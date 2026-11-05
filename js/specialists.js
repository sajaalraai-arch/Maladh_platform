/* ===== قسم المختصين: البيانات، التصفية، البطاقات، الترقيم ===== */
(function () {
  // لإضافة مختص جديد: أضف كائنًا هنا وسيظهر تلقائيًا (وتُنشأ صفحة ترقيم جديدة عند الحاجة).
  const SPECIALISTS = [
    {
      id: 'sara', specialty: 'therapy', service: 'counseling', remote: true, photo: 'assets/specialist-sara.jpg',
      ar: { name: 'د. سارة العريفي', title: 'أخصائية في علم النفس العلاجي', qualification: 'ماجستير في علم النفس', experience: 'أكثر من 8 سنوات' },
      en: { name: 'Dr. Sara Al-Areefi', title: 'Clinical Psychology Specialist', qualification: "Master's in Psychology", experience: '8+ years' }
    },
    {
      id: 'ahmed', specialty: 'recovery', service: 'recovery', remote: true, photo: 'assets/specialist-ahmed.jpg',
      ar: { name: 'د. أحمد السقاف', title: 'أخصائي دعم التعافي من الإدمان', qualification: 'دكتوراه في علم النفس', experience: 'أكثر من 10 سنوات' },
      en: { name: 'Dr. Ahmed Al-Saqqaf', title: 'Addiction Recovery Support Specialist', qualification: 'Doctorate in Psychology', experience: '10+ years' }
    }
  ];
  const PAGE_SIZE = 2;

  const grid = $('#specialistsGrid'), pagination = $('#pagination'), info = $('#resultsInfo');
  const q = $('#searchSpec'), specialtySel = $('#specialty'), serviceSel = $('#serviceType'), remoteSwitch = $('#remoteSwitch');
  let page = 1;

  const ico = (id, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // توحيد النص العربي للبحث (إزالة التشكيل وتوحيد الألف والتاء المربوطة)
  const norm = (s) => s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();

  function getFiltered() {
    const text = norm(q.value);
    const remoteOnly = remoteSwitch.getAttribute('aria-checked') === 'true';
    return SPECIALISTS.filter((s) => {
      const hay = norm(Object.values(s.ar).join(' ') + ' ' + Object.values(s.en).join(' '));
      return (!text || hay.includes(text)) &&
        (!specialtySel.value || s.specialty === specialtySel.value) &&
        (!serviceSel.value || s.service === serviceSel.value) &&
        (!remoteOnly || s.remote);
    });
  }

  function cardHTML(s) {
    const d = s[currentLang];
    return `
    <article class="spec-card">
      <img class="spec-photo" src="${s.photo}" alt="${esc(t('sp.photo') + ' ' + d.name)}" loading="lazy" />
      <div class="spec-info">
        <span class="badge">${ico('shield', 'ic-20')} ${t('sp.verified')}</span>
        <h3 class="spec-name">${esc(d.name)}</h3>
        <p class="spec-role">${esc(d.title)}</p>
        <ul class="spec-meta">
          <li>${ico('cap', 'ic-22')} ${t('sp.qual')}: ${esc(d.qualification)}</li>
          <li>${ico('brief', 'ic-22')} ${t('sp.exp')}: ${esc(d.experience)}</li>
        </ul>
        ${s.remote ? `<p class="spec-remote">${ico('video', 'ic-22')} ${t('sp.remoteTag')}</p>` : ''}
        <div class="spec-actions">
          <a href="#" data-book="${s.service}" class="btn btn-solid btn-sm">${ico('calendar', 'ic-20')} ${t('sp.book')}</a>
          <a href="#" data-profile="${s.id}" class="btn btn-outline btn-sm">${ico('user', 'ic-20')} ${t('sp.profile')}</a>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const list = getFiltered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const slice = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    grid.innerHTML = slice.length ? slice.map(cardHTML).join('')
      : `<div class="empty-state"><strong>${t('sp.emptyT')}</strong>${t('sp.emptyD')}</div>`;
    info.textContent = t('sp.count', { n: slice.length });

    if (pages < 2) { pagination.innerHTML = ''; return; }   // الترقيم يظهر فقط عند وجود أكثر من صفحة
    let html = `<button class="page-btn" data-go="${page - 1}" aria-label="${t('pg.prev')}" ${page === 1 ? 'disabled' : ''}>${ico('chevron-left', 'ic-20')}</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === page ? 'is-current' : ''}" data-go="${i}" ${i === page ? 'aria-current="page"' : ''} aria-label="${t('pg.page', { n: i })}">${i}</button>`;
    }
    html += `<button class="page-btn" data-go="${page + 1}" aria-label="${t('pg.next')}" ${page === pages ? 'disabled' : ''}>${ico('chevron-right', 'ic-20')}</button>`;
    pagination.innerHTML = html;
  }

  // ---------- الأحداث ----------
  [q, specialtySel, serviceSel].forEach((el) => el.addEventListener('input', () => { page = 1; render(); }));
  remoteSwitch.addEventListener('click', () => {
    const on = remoteSwitch.getAttribute('aria-checked') !== 'true';
    remoteSwitch.setAttribute('aria-checked', String(on));
    remoteSwitch.classList.toggle('is-on', on);
    page = 1; render();
  });
  pagination.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b || b.disabled) return;
    page = Number(b.dataset.go); render();
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  grid.addEventListener('click', (e) => {
    const p = e.target.closest('[data-profile]');
    if (p) { e.preventDefault(); showToast(t('toast.soon')); }   // TODO: اربط بصفحة الملف الشخصي
  });
  // البحث القادم من شريط التنقل
  window.addEventListener('maladh:search', (e) => { q.value = e.detail; page = 1; render(); });
  window.addEventListener('langchange', render);

  render();
})();
