/* ===== واجهة الصفحة: الثيم، الإعدادات، التنقل، اللوحات، الرسائل ===== */
const root = document.documentElement;
const header = $('#siteHeader');

// ---------- رسالة مؤقتة (Toast) ----------
let toastTimer;
function showToast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ---------- المظهر / حجم الخط / الحركة ----------
function applyTheme(theme) {
  prefs.theme = theme;
  root.dataset.theme = theme;
  $('#themeLabelIcon use').setAttribute('href', theme === 'dark' ? '#i-moon' : '#i-sun');
}
function applyFont(size) { prefs.font = size; root.dataset.font = size; }
function applyMotion(on) {
  prefs.reduce = on;
  root.classList.toggle('reduce-motion', on);
  const sw = $('#motionSwitch');
  sw.classList.toggle('is-on', on);
  sw.setAttribute('aria-checked', String(on));
}

// مزامنة حالة أزرار الإعدادات مع التفضيلات الحالية
function syncSettingsUI() {
  $$('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === prefs.lang)));
  $$('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === prefs.theme)));
  $$('[data-set-font]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setFont === prefs.font)));
}

document.addEventListener('click', (e) => {
  const lang = e.target.closest('[data-set-lang]');
  const theme = e.target.closest('[data-set-theme]');
  const font = e.target.closest('[data-set-font]');
  if (lang)  { prefs.lang = lang.dataset.setLang; setLang(prefs.lang); }
  if (theme) { applyTheme(theme.dataset.setTheme); }
  if (font)  { applyFont(font.dataset.setFont); }
  if (lang || theme || font) { savePrefs(); syncSettingsUI(); }
});
$('#motionSwitch').addEventListener('click', () => { applyMotion(!prefs.reduce); savePrefs(); });

// ---------- اللوحات (بحث / إعدادات / قائمة الهاتف / قائمة المستخدم) ----------
const PANELS = {
  search:   { btn: $('#searchBtn'),   el: $('#searchPanel') },
  settings: { btn: $('#settingsBtn'), el: $('#settingsCard') },
  menu:     { btn: $('#menuBtn'),     el: $('#mobileMenu') },
  user:     { btn: $('#loginBtn'),    el: $('#userMenu') }
};

function closePanels(except) {
  for (const name in PANELS) {
    if (name === except) continue;
    const { btn, el } = PANELS[name];
    el.classList.remove('is-open');
    if (btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
  }
  $('#menuIcon use').setAttribute('href', PANELS.menu.el.classList.contains('is-open') ? '#i-x' : '#i-menu');
}
function togglePanel(name) {
  const { btn, el } = PANELS[name];
  const open = !el.classList.contains('is-open');
  closePanels(open ? name : null);
  el.classList.toggle('is-open', open);
  if (btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', String(open));
  $('#menuIcon use').setAttribute('href', PANELS.menu.el.classList.contains('is-open') ? '#i-x' : '#i-menu');
  if (open && name === 'search') $('#searchInput').focus();
}

['search', 'settings', 'menu'].forEach((n) => PANELS[n].btn.addEventListener('click', () => togglePanel(n)));
// زر تسجيل الدخول: يفتح نافذة الدخول، أو قائمة المستخدم إن كان مسجلًا (انظر auth.js)
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-panel]')) closePanels();
  else if (!e.target.closest('.pop, .drop, [data-panel-btn]')) closePanels();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });
// إغلاق قائمة الهاتف عند اختيار رابط
$$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => closePanels()));

// ---------- البحث: يرسل النص إلى قسم المختصين ----------
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#searchInput').value.trim();
  window.dispatchEvent(new CustomEvent('maladh:search', { detail: text }));
  closePanels();
  $('#specialists').scrollIntoView({ behavior: 'smooth' });
});

// ---------- ظل الشريط عند التمرير + زر العودة للأعلى ----------
const toTop = $('#toTop');
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 20);
  toTop.classList.toggle('show', window.scrollY > 700);
}
window.addEventListener('scroll', onScroll, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- تمييز الرابط النشط حسب القسم الظاهر ----------
const spyIds = ['home', 'services', 'specialists', 'about'];
function setActive(id) {
  $$('[data-spy]').forEach((a) => {
    const on = a.dataset.spy === id;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  spyIds.forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

// ---------- بدء التشغيل ----------
applyTheme(prefs.theme || root.dataset.theme || 'light');
applyFont(prefs.font || 'normal');
applyMotion(!!prefs.reduce);
setLang(prefs.lang);
syncSettingsUI();
onScroll();
