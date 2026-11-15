/**
 * =====================================================================
 * محرك لوحة تحكم مدير منصة ملاذ (Admin Dashboard Controller)
 * - HTML5, CSS3, Vanilla JavaScript
 * - اتجاه عربي كامل (RTL)
 * - بيانات تجريبية متكاملة وتفاعلات فورية مع LocalStorage
 * =====================================================================
 */

(function () {
  'use strict';

  // مفاتيح التخزين المحلي LocalStorage
  const KEYS = {
    ADMIN_USER: 'maladh:admin_user',
    CURRENT_ROLE: 'maladh:current_role',
    BENEFICIARIES: 'maladh:admin_beneficiaries_v1',
    SPECIALISTS: 'maladh:admin_specialists_v1',
    APPOINTMENTS: 'maladh:admin_appointments_v1',
    SERVICES: 'maladh:admin_services_v1',
    REQUESTS: 'maladh:admin_requests_v1',
    SUPPORT: 'maladh:admin_support_v1',
    NOTIFS: 'maladh:admin_notifs_v1',
    SETTINGS: 'maladh:admin_settings_v1'
  };

  // دوال مساعدة
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  function getStorage(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // إشعار التوست
  function showToast(message) {
    const toast = $('#adminToast');
    const msgEl = $('#adminToastMessage');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(window._adminToastTimeout);
    window._adminToastTimeout = setTimeout(() => {
      toast.classList.remove('is-show');
    }, 3200);
  }

  // =====================================================================
  // البيانات الافتراضية التجريبية (Mock Data)
  // =====================================================================

  const DEFAULT_ADMIN = {
    username: 'مدير النظام',
    email: 'admin@maladh.com',
    phone: '0501234567',
    title: 'مدير النظام العام',
    avatar: 'assets/specialist-sara.jpg'
  };

  const DEFAULT_BENEFICIARIES = [
    { id: 'b1', name: 'أمل السلمي', email: 'amal.s@example.com', phone: '0551122334', registeredDate: '2026-09-12', sessionsCount: 8, status: 'active' },
    { id: 'b2', name: 'محمد العتيبي', email: 'm.otaibi@example.com', phone: '0562233445', registeredDate: '2026-09-28', sessionsCount: 14, status: 'active' },
    { id: 'b3', name: 'سارة القحطاني', email: 'sara.q@example.com', phone: '0543344556', registeredDate: '2026-10-05', sessionsCount: 5, status: 'active' },

    { id: 'b5', name: 'منيرة السبيعي', email: 'moneera.s@example.com', phone: '0535566778', registeredDate: '2026-10-22', sessionsCount: 3, status: 'active' },
    { id: 'b6', name: 'خالد بن فهد', email: 'khaled.f@example.com', phone: '0556677889', registeredDate: '2026-10-30', sessionsCount: 1, status: 'disabled' },
    { id: 'b7', name: 'نوف الدوسري', email: 'nouf.d@example.com', phone: '0547788990', registeredDate: '2026-11-02', sessionsCount: 6, status: 'active' },
    { id: 'b8', name: 'تركي الحربي', email: 'turki.h@example.com', phone: '0568899001', registeredDate: '2026-11-08', sessionsCount: 2, status: 'active' }
  ];

  const DEFAULT_SPECIALISTS = [
    { id: 'sp1', name: 'د. سارة العتيبي', specialty: 'استشارات نفسية وعلاج معرفي سلوكي', license: 'PSY-88492', email: 'sara.otaibi@maladh.com', phone: '0512345678', verified: true, available: true, rating: 4.9, sessions: 184 },
    { id: 'sp2', name: 'د. خالد الشمري', specialty: 'علاج الإدمان ودعم التعافي', license: 'MED-77142', email: 'khaled.sh@maladh.com', phone: '0523456789', verified: true, available: true, rating: 4.85, sessions: 156 },
    { id: 'sp3', name: 'د. نورة القحطاني', specialty: 'إرشاد أسري وعلاقات زوجية', license: 'FAM-66321', email: 'noura.q@maladh.com', phone: '0534567890', verified: true, available: false, rating: 4.92, sessions: 122 },
    { id: 'sp4', name: 'د. عبد الله الدوسري', specialty: 'اضطرابات القلق والمخاوف السلوكية', license: 'PSY-55901', email: 'a.dossari@maladh.com', phone: '0545678901', verified: true, available: true, rating: 4.8, sessions: 98 },
    { id: 'sp5', name: 'د. فيصل السبيعي', specialty: 'استشارات نفسية وتأهيل سلوكي', license: 'PSY-99120', email: 'f.subaie@maladh.com', phone: '0556789012', verified: false, available: true, rating: 4.7, sessions: 12 },
    { id: 'sp6', name: 'د. ريم الغامدي', specialty: 'علاج الإدمان وإدارة الانتكاسات', license: 'MED-44219', email: 'reem.gh@maladh.com', phone: '0567890123', verified: false, available: false, rating: 4.65, sessions: 8 }
  ];

  const DEFAULT_APPOINTMENTS = [
    { id: 'APT-1042', beneficiary: 'أمل السلمي', specialist: 'د. سارة العتيبي', date: '2026-11-14', time: '16:00', type: 'جلسة مرئية مشفرة', status: 'upcoming' },
    { id: 'APT-1043', beneficiary: 'محمد العتيبي', specialist: 'د. خالد الشمري', date: '2026-11-14', time: '17:30', type: 'متابعة مسار التعافي', status: 'upcoming' },
    { id: 'APT-1044', beneficiary: 'سارة القحطاني', specialist: 'د. نورة القحطاني', date: '2026-11-14', time: '19:00', type: 'استشارة أسرية', status: 'upcoming' },
    { id: 'APT-1039', beneficiary: 'تركي الحربي', specialist: 'د. عبد الله الدوسري', date: '2026-11-13', time: '18:00', type: 'جلسة مرئية مشفرة', status: 'completed' },
    { id: 'APT-1038', beneficiary: 'خالد بن فهد', specialist: 'د. خالد الشمري', date: '2026-11-12', time: '15:00', type: 'تقييم مبدئي', status: 'cancelled' }
  ];

  const DEFAULT_SERVICES = [
    { id: 'srv1', title: 'الاستشارات النفسية الفردية', desc: 'جلسات علاجية متخصصة لعلاج الاكتئاب، اضطرابات القلق، الصدمات والضغوط النفسية مع مختصين مرخصين.', icon: 'i-heart', specialistsCount: 18, sessionsCount: 680, active: true },
    { id: 'srv2', title: 'مسار دعم التعافي من الإدمان', desc: 'برنامج علاجي وتأهيلي شامل للمتعافين من الإدمان وإدارة محفزات الانتكاسة مع خطة متابعة يومية.', icon: 'i-sprout', specialistsCount: 12, sessionsCount: 502, active: true },
    { id: 'srv3', title: 'الإرشاد الأسري والعلاقات', desc: 'استشارات متخصصة للتعامل مع الخلافات الأسرية والزوجية وبناء بيئة داعمة ومستقرة للأبناء.', icon: 'i-users', specialistsCount: 9, sessionsCount: 292, active: true },  ];

  const DEFAULT_CONSULTATIONS = [
    { id: 'REQ-501', beneficiary: 'فيصل المطيري', service: 'علاج الإدمان ودعم التعافي', date: '2026-11-14 11:20', priority: 'عاجل', specialist: 'د. خالد الشمري', status: 'assigned' },
    { id: 'REQ-502', beneficiary: 'عهود العبد الله', service: 'الاستشارات النفسية الفردية', date: '2026-11-14 10:15', priority: 'عادي', specialist: 'غير محال', status: 'new' },    { id: 'REQ-504', beneficiary: 'ريما العسيري', service: 'الإرشاد الأسري والعلاقات', date: '2026-11-13 21:00', priority: 'عادي', specialist: 'د. نورة القحطاني', status: 'completed' },
    { id: 'REQ-505', beneficiary: 'فهد البقمي', service: 'الاستشارات النفسية الفردية', date: '2026-11-13 18:30', priority: 'عادي', specialist: 'د. سارة العتيبي', status: 'assigned' }
  ];

  const DEFAULT_SUPPORT_TICKETS = [
    {
      id: 'tk1',
      beneficiary: 'محمد العتيبي',
      topic: 'استفسار بخصوص رابط الجلسة المرئية',
      unread: 1,
      status: 'open',
      lastTime: '11:15 ص',
      messages: [
        { sender: 'user', text: 'السلام عليكم، لم يصلني رابط الجلسة المجدولة مع الدكتور خالد اليوم الساعة 5:30.', time: '11:10 ص' },
        { sender: 'admin', text: 'أهلاً بك أخي محمد. تم التحقق من الحجز وسيتم تفعيل زر الدخول للجلسة تلقائياً قبل الموعد بـ 15 دقيقة.', time: '11:12 ص' },
        { sender: 'user', text: 'ممتاز جزاكم الله خيراً، شكراً على التوضيح.', time: '11:15 ص' }
      ]
    },
    {
      id: 'tk2',
      beneficiary: 'ريم القحطاني',
      topic: 'تعديل موعد استشارة نفسية',
      unread: 0,
      status: 'open',
      lastTime: '10:40 ص',
      messages: [
        { sender: 'user', text: 'مرحباً، أود تأجيل جلستي المقررة غداً صباحاً إلى يوم الثلاثاء.', time: '10:35 ص' },
        { sender: 'admin', text: 'مرحباً ريم، بإمكانك الدخول لصفحة مواعيدي واختيار إعادة جدولة الموعد بسهولة.', time: '10:40 ص' }
      ]
    },
    {
      id: 'tk3',
      beneficiary: 'أمل السلمي',
      topic: 'تحديث بيانات الحساب وتأكيد السرية',
      unread: 0,
      status: 'resolved',
      lastTime: 'أمس',
      messages: [
        { sender: 'user', text: 'شكراً جزيلاً لفريق الدعم على حماية الخصوصية.', time: 'أمس 04:00 م' },
        { sender: 'admin', text: 'في خدمتك دائماً أمل، خصوصيتكم وأمانكم في مقدمة أولوياتنا.', time: 'أمس 04:10 م' }
      ]
    }
  ];

  const DEFAULT_NOTIFICATIONS = [
    { id: 'notif1', title: 'إطلاق مسار التعافي المحدث', target: 'جميع المستفيدين', type: ' إعلان عام', date: '2026-11-10 14:00', status: 'تم الإرسال ' },
    { id: 'notif2', title: 'تحديث سياسة حفظ الخصوصية الطبية', target: 'كافة مستخدمي المنصة', type: ' تحديث نظام', date: '2026-11-06 09:30', status: 'تم الإرسال' },
    { id: 'notif3', title: 'تذكير بمواعيد التوثيق السنوي للمختصين', target: 'جميع المختصين', type: 'تنبيه هام', date: '2026-11-01 11:00', status: 'تم الإرسال ' }
  ];

  const DEFAULT_ACTIVITIES = [
    { id: 'act1', title: 'اكتمال جلسة استشارية', desc: 'أنهت د. سارة العتيبي جلسة علاج معرفي مع أمل السلمي.', time: 'منذ 15 دقيقة', badge: 'جلسة مكتملة', type: 'success' },
    { id: 'act2', title: 'طلب استشارة جديد', desc: 'قدم المستفيد فيصل المطيري طلب انضمام لمسار دعم التعافي.', time: 'منذ 40 دقيقة', badge: 'طلب جديد', type: 'info' },
    { id: 'act3', title: 'توثيق رخصة مختص', desc: 'تم اعتماد وتوثيق ملف د. خالد الشمري بعد فحص الترخيص المهني.', time: 'منذ ساعتين', badge: 'توثيق معتمد', type: 'success' },
    { id: 'act4', title: 'تأكيد حجز موعد', desc: 'قام المستفيد تركي الحربي بحجز موعد استشارة فردية.', time: 'منذ 3 ساعات', badge: 'حجز مؤكد', type: 'info' }
  ];

  // الحالة العامة للتطبيق
  let state = {
    admin: getStorage(KEYS.ADMIN_USER, DEFAULT_ADMIN),
    beneficiaries: getStorage(KEYS.BENEFICIARIES, DEFAULT_BENEFICIARIES),
    specialists: getStorage(KEYS.SPECIALISTS, DEFAULT_SPECIALISTS),
    appointments: getStorage(KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS),
    services: getStorage(KEYS.SERVICES, DEFAULT_SERVICES),
    consultations: getStorage(KEYS.REQUESTS, DEFAULT_CONSULTATIONS),
    supportTickets: getStorage(KEYS.SUPPORT, DEFAULT_SUPPORT_TICKETS),
    notifications: getStorage(KEYS.NOTIFS, DEFAULT_NOTIFICATIONS),
    activities: DEFAULT_ACTIVITIES,
    currentView: 'dashboard',
    activeTicketId: 'tk1',
    beneficiaryFilter: 'all',
    specialistFilter: 'all',
    apptFilter: 'all',
    requestFilter: 'all'
  };

  // =====================================================================
  // التحكم بالتنقل بين الواجهات العشر (View Switcher)
  // =====================================================================

  const VIEW_TITLES = {
    dashboard: { heading: 'لوحة التحكم الرئيسية', sub: 'نظرة عامة ومؤشرات أداء منصة ملاذ للاستشارات النفسية والتعافي' },
    beneficiaries: { heading: 'إدارة حسابات المستفيدين', sub: 'متابعة سجلات المستفيدين، وتفعيل الحسابات وتفاصيل الجلسات' },
    specialists: { heading: 'إدارة المختصين النفسيين', sub: 'مراجعة ملفات التوثيق، واعتماد التراخيص وإدارة التوفر' },
    appointments: { heading: 'إدارة المواعيد والجلسات', sub: 'جدول المواعيد النشطة والمكتملة وإدارة الحجوزات اليومية' },
    support: { heading: 'إدارة الدعم الخاص والمباشر', sub: 'خدمة عملاء ودعم فني مباشر للمستفيدين لحل أي صعوبات' },
    notifications: { heading: 'إدارة التنبيهات والإشعارات', sub: 'بث رسائل وإعلانات وتنبيهات فورية لكافة مستخدمي المنصة' },
    reports: { heading: 'التقارير والإحصائيات التحليلية', sub: 'مؤشرات الأداء السريري ومعدلات الرضا والنمو الشهري' },
    settings: { heading: '', sub: 'المعلومات الإدارية، وسياسات الأمان وتفضيلات التشغيل' }
  };

  function switchView(viewName) {
    if (!VIEW_TITLES[viewName]) viewName = 'dashboard';
    state.currentView = viewName;

    // تحديث القائمة الجانبية
    $$('.admin-nav-link').forEach(link => {
      const isTarget = link.dataset.adminNav === viewName;
      link.classList.toggle('is-active', isTarget);
      link.setAttribute('aria-selected', String(isTarget));
    });

    // تحديث المشاهد
    $$('.admin-view').forEach(view => {
      view.classList.toggle('is-active', view.id === `view-${viewName}`);
    });

    // تحديث الهيدر
    const titleInfo = VIEW_TITLES[viewName];
    const headingEl = $('#adminCurrentPageHeading');
    const subEl = $('#adminCurrentPageSubheading');
    if (headingEl) headingEl.textContent = titleInfo.heading;
    if (subEl) subEl.textContent = titleInfo.sub;

    // إغلاق قائمة الموبايل إن كانت مفتوحة
    $('#adminSidebar')?.classList.remove('is-open');

    // تشغيل الريندر الخاص بالمشهد
    if (viewName === 'dashboard') renderDashboardView();
    else if (viewName === 'beneficiaries') renderBeneficiariesTable();
    else if (viewName === 'specialists') renderSpecialistsTable();
    else if (viewName === 'appointments') renderAppointmentsTable();
    else if (viewName === 'services') renderServicesCards();
    else if (viewName === 'consultations') renderConsultationsTable();
    else if (viewName === 'support') renderSupportChat();
    else if (viewName === 'notifications') renderNotificationsLog();

    // تحديث هاش الرابط
    if (window.location.hash !== `#${viewName}`) {
      window.location.hash = viewName;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =====================================================================
  // 1. واجهة لوحة التحكم الرئيسية (Dashboard Overview)
  // =====================================================================

  function renderDashboardView() {
    // تحديث الأرقام الإحصائية
    $('#statBeneficiariesCount') && ($('#statBeneficiariesCount').textContent = state.beneficiaries.length.toLocaleString('ar-SA'));
    $('#statSpecialistsCount') && ($('#statSpecialistsCount').textContent = state.specialists.length.toLocaleString('ar-SA'));
    $('#statAppointmentsCount') && ($('#statAppointmentsCount').textContent = state.appointments.length.toLocaleString('ar-SA'));
    $('#statConsultationsCount') && ($('#statConsultationsCount').textContent = state.consultations.length.toLocaleString('ar-SA'));
    $('#statServicesCount') && ($('#statServicesCount').textContent = state.services.length.toLocaleString('ar-SA'));

    // رسم سجل الأنشطة الحديثة
    const actList = $('#dashActivityLogList');
    if (actList) {
      actList.innerHTML = state.activities.map(act => `
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
          <div class="flex-1 text-xs">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <span class="font-extrabold text-ink">${act.title}</span>
              <span class="text-[10px] text-muted">${act.time}</span>
            </div>
            <p class="text-muted">${act.desc}</p>
          </div>
          <span class="badge-success text-[10px] px-2 py-0.5 rounded-full">${act.badge}</span>
        </div>
      `).join('');
    }

    // رسم مواعيد اليوم في لوحة التحكم
    const apptsTbody = $('#dashTodayApptsTbody');
    if (apptsTbody) {
      const todayAppts = state.appointments.slice(0, 4);
      apptsTbody.innerHTML = todayAppts.map(a => `
        <tr>
          <td><span class="font-bold text-xs text-ink">${a.beneficiary}</span></td>
          <td><span class="text-xs text-muted">${a.specialist}</span></td>
          <td><span class="text-xs font-semibold text-primary">${a.time}</span></td>
          <td><span class="text-[11px] text-muted">${a.type}</span></td>
          <td>
            ${a.status === 'completed' ? '<span class="badge-success text-[11px] px-2 py-0.5 rounded-full">مكتمل</span>' : '<span class="badge-warning text-[11px] px-2 py-0.5 rounded-full">قادم اليوم</span>'}
          </td>
        </tr>
      `).join('');
    }

    // رسم أحدث المستفيدين
    const recentBenef = $('#dashRecentBeneficiariesList');
    if (recentBenef) {
      recentBenef.innerHTML = state.beneficiaries.slice(0, 3).map(b => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="table-avatar-monogram">${b.name.charAt(0)}</div>
            <div class="text-xs">
              <span class="font-bold text-ink block">${b.name}</span>
              <span class="text-[11px] text-muted">${b.email}</span>
            </div>
          </div>
          <span class="badge-success text-[10px] px-2 py-0.5 rounded-full">نشط</span>
        </div>
      `).join('');
    }

    // رسم أحدث المختصين
    const recentSpec = $('#dashRecentSpecialistsList');
    if (recentSpec) {
      recentSpec.innerHTML = state.specialists.slice(0, 3).map(s => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="table-avatar-monogram bg-emerald-100 text-emerald-800">${s.name.charAt(0)}</div>
            <div class="text-xs">
              <span class="font-bold text-ink block">${s.name}</span>
              <span class="text-[11px] text-muted">${s.specialty}</span>
            </div>
          </div>
          <span class="${s.verified ? 'badge-success' : 'badge-warning'} text-[10px] px-2 py-0.5 rounded-full">
            ${s.verified ? 'موثق' : 'قيد المراجعة'}
          </span>
        </div>
      `).join('');
    }
  }

  // =====================================================================
  // 2. واجهة إدارة المستفيدين (Beneficiaries)
  // =====================================================================

  function renderBeneficiariesTable() {
    const tbody = $('#beneficiariesTableTbody');
    if (!tbody) return;

    let list = [...state.beneficiaries];
    const q = ($('#beneficiarySearchInput')?.value || '').trim().toLowerCase();

    if (q) {
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.phone.includes(q));
    }

    if (state.beneficiaryFilter === 'active') {
      list = list.filter(b => b.status === 'active');
    } else if (state.beneficiaryFilter === 'disabled') {
      list = list.filter(b => b.status === 'disabled');
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-8 text-muted text-xs">
            لا توجد حسابات مستفيدين تطابق معايير البحث والفلترة.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(b => `
      <tr>
        <td>
          <div class="table-user-cell">
            <div class="table-avatar-monogram">${b.name.charAt(0)}</div>
            <div>
              <span class="font-bold text-xs text-ink block">${b.name}</span>
              <span class="text-[11px] text-muted">${b.email} • ${b.phone}</span>
            </div>
          </div>
        </td>
        <td><span class="text-xs text-muted">${b.registeredDate}</span></td>
        <td><span class="text-xs font-bold text-primary">${b.sessionsCount} جلسات</span></td>
        <td>
          ${b.status === 'active'
        ? '<span class="badge-success text-xs px-2.5 py-1 rounded-full">نشط ومفعل</span>'
        : '<span class="badge-danger text-xs px-2.5 py-1 rounded-full">معطل مؤقتاً</span>'}
        </td>
        <td>
          <div class="table-actions-cell">
            <button type="button" class="table-action-btn view-benef-btn" data-id="${b.id}" title="عرض ملف المستفيد">
              <svg class="icon ic-14"><use href="#i-eye" /></svg>
              <span>تفاصيل</span>
            </button>
            <button type="button" class="table-action-btn toggle-benef-btn" data-id="${b.id}" title="${b.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}">
              <svg class="icon ic-14"><use href="#i-shield" /></svg>
              <span>${b.status === 'active' ? 'تعطيل' : 'تفعيل'}</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // ربط أزرار الإجراءات
    $$('.view-benef-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => openBeneficiaryDetailsModal(btn.dataset.id));
    });

    $$('.toggle-benef-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => toggleBeneficiaryStatus(btn.dataset.id));
    });
  }

  function openBeneficiaryDetailsModal(id) {
    const b = state.beneficiaries.find(x => x.id === id);
    if (!b) return;

    const modalName = $('#benefModalName');
    const modalContent = $('#benefModalContent');

    if (modalName) modalName.textContent = `ملف المستفيد: ${b.name}`;
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="space-y-3 text-xs">
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div class="table-avatar-monogram w-12 h-12 text-base">${b.name.charAt(0)}</div>
            <div>
              <h4 class="font-bold text-sm text-ink">${b.name}</h4>
              <p class="text-muted">${b.email} | ${b.phone}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <div class="p-2.5 bg-slate-50 rounded-lg">
              <span class="text-muted block text-[11px]">تاريخ الانضمام للمنصة:</span>
              <span class="font-bold text-ink">${b.registeredDate}</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-lg">
              <span class="text-muted block text-[11px]">إجمالي الجلسات المنجزة:</span>
              <span class="font-bold text-primary">${b.sessionsCount} جلسة استشارية</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-lg">
              <span class="text-muted block text-[11px]">حالة الحساب الإدارية:</span>
              <span class="font-bold ${b.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}">
                ${b.status === 'active' ? 'حساب موثق ونشط' : 'حساب معطل وموقوف'}
              </span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-lg">
              <span class="text-muted block text-[11px]">مستوى الخصوصية:</span>
              <span class="font-bold text-ink">تشفير طبي كامل</span>
            </div>
          </div>
        </div>
      `;
    }

    openModal('#adminBeneficiaryDetailModal');
  }

  function toggleBeneficiaryStatus(id) {
    const b = state.beneficiaries.find(x => x.id === id);
    if (!b) return;

    b.status = b.status === 'active' ? 'disabled' : 'active';
    setStorage(KEYS.BENEFICIARIES, state.beneficiaries);
    renderBeneficiariesTable();
    showToast(`تم ${b.status === 'active' ? 'تفعيل' : 'تعطيل'} حساب المستفيد: ${b.name}`);

    if (window.MaladhDB && window.MaladhDB.auth && b.id) {
      window.MaladhDB.auth.updateProfile(b.id, { is_active: b.status === 'active' }).catch(err => console.warn(err));
    }
  }

  // =====================================================================
  // 3. واجهة إدارة المختصين (Specialists)
  // =====================================================================

  function renderSpecialistsTable() {
    const tbody = $('#specialistsTableTbody');
    if (!tbody) return;

    let list = [...state.specialists];
    const q = ($('#specialistSearchInput')?.value || '').trim().toLowerCase();

    if (q) {
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q) || s.license.toLowerCase().includes(q));
    }

    if (state.specialistFilter === 'verified') {
      list = list.filter(s => s.verified);
    } else if (state.specialistFilter === 'pending') {
      list = list.filter(s => !s.verified);
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td>
          <div class="table-user-cell">
            <div class="table-avatar-monogram bg-emerald-100 text-emerald-800">${s.name.charAt(0)}</div>
            <div>
              <span class="font-bold text-xs text-ink block">${s.name}</span>
              <span class="text-[11px] text-muted">رخصة: ${s.license}</span>
            </div>
          </div>
        </td>
        <td><span class="text-xs font-semibold text-ink">${s.specialty}</span></td>
        <td><span class="text-xs text-muted">${s.email}<br/>${s.phone}</span></td>
        <td>
          ${s.verified
        ? '<span class="badge-success text-xs px-2.5 py-1 rounded-full">موثق ومعتمد</span>'
        : '<span class="badge-warning text-xs px-2.5 py-1 rounded-full">بانتظار المراجعة</span>'}
        </td>
        <td>
          ${s.available
        ? '<span class="flex items-center gap-1.5 text-xs text-emerald-600 font-bold"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>متاح للحجز</span>'
        : '<span class="flex items-center gap-1.5 text-xs text-slate-400 font-bold"><span class="w-2 h-2 rounded-full bg-slate-300"></span>غير متاح</span>'}
        </td>
        <td>
          <div class="table-actions-cell">
            ${!s.verified ? `
              <button type="button" class="table-action-btn bg-emerald-50 text-emerald-700 approve-spec-btn" data-id="${s.id}">
                <svg class="icon ic-14"><use href="#i-check" /></svg>
                <span>اعتماد</span>
              </button>
            ` : `
              <button type="button" class="table-action-btn toggle-avail-btn" data-id="${s.id}">
                <span>تبديل التوفر</span>
              </button>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    $$('.approve-spec-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        const s = state.specialists.find(x => x.id === btn.dataset.id);
        if (s) {
          s.verified = true;
          setStorage(KEYS.SPECIALISTS, state.specialists);
          renderSpecialistsTable();
          showToast(`تم اعتماد وتوثيق رخصة المختص: ${s.name}`);
          if (window.MaladhDB && window.MaladhDB.specialists && s.id) {
            window.MaladhDB.specialists.verifySpecialist(s.id, true).catch(err => console.warn(err));
          }
        }
      });
    });

    $$('.toggle-avail-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        const s = state.specialists.find(x => x.id === btn.dataset.id);
        if (s) {
          s.available = !s.available;
          setStorage(KEYS.SPECIALISTS, state.specialists);
          renderSpecialistsTable();
          showToast(`تم تعديل حالة توفر المختص: ${s.name}`);
          if (window.MaladhDB && window.MaladhDB.specialists && s.id) {
            window.MaladhDB.specialists.setAvailability(s.id, s.available).catch(err => console.warn(err));
          }
        }
      });
    });
  }

  // =====================================================================
  // 4. واجهة إدارة المواعيد (Appointments)
  // =====================================================================

  function renderAppointmentsTable() {
    const tbody = $('#appointmentsTableTbody');
    if (!tbody) return;

    let list = [...state.appointments];
    const q = ($('#apptSearchInput')?.value || '').trim().toLowerCase();

    if (q) {
      list = list.filter(a => a.beneficiary.toLowerCase().includes(q) || a.specialist.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    }

    if (state.apptFilter !== 'all') {
      list = list.filter(a => a.status === state.apptFilter);
    }

    tbody.innerHTML = list.map(a => `
      <tr>
        <td><span class="font-extrabold text-xs text-primary">${a.id}</span></td>
        <td><span class="font-bold text-xs text-ink">${a.beneficiary}</span></td>
        <td><span class="text-xs text-muted">${a.specialist}</span></td>
        <td><span class="text-xs text-ink font-semibold">${a.date} • ${a.time}</span></td>
        <td><span class="text-xs text-muted">${a.type}</span></td>
        <td>
          ${a.status === 'upcoming' ? '<span class="badge-warning text-xs px-2.5 py-1 rounded-full">قادم</span>' : ''}
          ${a.status === 'completed' ? '<span class="badge-success text-xs px-2.5 py-1 rounded-full">مكتمل</span>' : ''}
          ${a.status === 'cancelled' ? '<span class="badge-danger text-xs px-2.5 py-1 rounded-full">ملغي</span>' : ''}
        </td>
        <td>
          <div class="table-actions-cell">
            ${a.status === 'upcoming' ? `
              <button type="button" class="btn-danger-outline cancel-appt-btn" data-id="${a.id}">إلغاء الموعد</button>
            ` : '<span class="text-xs text-muted">—</span>'}
          </div>
        </td>
      </tr>
    `).join('');

    $$('.cancel-appt-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟')) {
          const a = state.appointments.find(x => x.id === btn.dataset.id);
          if (a) {
            a.status = 'cancelled';
            setStorage(KEYS.APPOINTMENTS, state.appointments);
            renderAppointmentsTable();
            showToast(`تم إلغاء الموعد رقم ${a.id} بنجاح`);
          }
        }
      });
    });
  }

  // =====================================================================
  // 7. واجهة إدارة الدعم الخاص (Private Support Chat)
  // =====================================================================

  function renderSupportChat() {
    const listEl = $('#adminSupportTicketsList');
    const badgeEl = $('#supportActiveCountBadge');
    if (!listEl) return;

    if (badgeEl) badgeEl.textContent = `${state.supportTickets.filter(t => t.status === 'open').length} نشطة`;

    listEl.innerHTML = state.supportTickets.map(t => {
      const isActive = t.id === state.activeTicketId;
      return `
        <button type="button" class="admin-chat-item ${isActive ? 'is-active' : ''}" data-ticket-id="${t.id}">
          <div class="table-avatar-monogram">${t.beneficiary.charAt(0)}</div>
          <div class="flex-1 text-start overflow-hidden">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="font-bold text-xs text-ink truncate">${t.beneficiary}</span>
              <span class="text-[10px] text-muted">${t.lastTime}</span>
            </div>
            <p class="text-[11px] text-muted truncate">${t.topic}</p>
          </div>
        </button>
      `;
    }).join('');

    $$('.admin-chat-item', listEl).forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTicketId = btn.dataset.ticketId;
        renderSupportChat();
      });
    });

    // رسم المحادثة النشطة
    const activeTicket = state.supportTickets.find(t => t.id === state.activeTicketId) || state.supportTickets[0];
    if (activeTicket) {
      $('#activeSupportAvatar') && ($('#activeSupportAvatar').textContent = activeTicket.beneficiary.charAt(0));
      $('#activeSupportName') && ($('#activeSupportName').textContent = activeTicket.beneficiary);
      $('#activeSupportMeta') && ($('#activeSupportMeta').textContent = `مستفيد • تذكرة #${activeTicket.id} • ${activeTicket.topic}`);

      const msgContainer = $('#adminSupportMessagesContainer');
      if (msgContainer) {
        msgContainer.innerHTML = activeTicket.messages.map(m => `
          <div class="admin-msg-row ${m.sender === 'admin' ? 'is-admin' : 'is-user'}">
            <div class="admin-msg-bubble">
              <span class="font-bold text-[11px] block mb-1 ${m.sender === 'admin' ? 'text-blue-200' : 'text-primary'}">
                ${m.sender === 'admin' ? 'الدعم الفني (إدارة ملاذ)' : activeTicket.beneficiary}
              </span>
              <p>${m.text}</p>
              <span class="admin-msg-time ${m.sender === 'admin' ? 'text-blue-200' : 'text-slate-400'}">${m.time}</span>
            </div>
          </div>
        `).join('');

        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    }
  }

  // =====================================================================
  // 8. واجهة إدارة الإشعارات (Notifications)
  // =====================================================================

  function renderNotificationsLog() {
    const tbody = $('#notificationsLogTbody');
    if (!tbody) return;

    tbody.innerHTML = state.notifications.map(n => `
      <tr>
        <td><span class="font-bold text-xs text-ink">${n.title}</span></td>
        <td><span class="text-xs text-muted">${n.target}</span></td>
        <td><span class="text-xs font-semibold text-primary">${n.type}</span></td>
        <td><span class="text-xs text-muted">${n.date}</span></td>
        <td><span class="badge-success text-xs px-2 py-0.5 rounded-full">${n.status}</span></td>
        <td>
          <button type="button" class="btn-danger-outline delete-notif-btn" data-id="${n.id}">حذف</button>
        </td>
      </tr>
    `).join('');

    $$('.delete-notif-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        state.notifications = state.notifications.filter(x => x.id !== btn.dataset.id);
        setStorage(KEYS.NOTIFS, state.notifications);
        renderNotificationsLog();
        showToast('تم حذف الإشعار من السجل');
      });
    });
  }

  // =====================================================================
  // إدارة النوافذ المنبثقة (Modals Management)
  // =====================================================================

  function openModal(modalSelector) {
    const modal = $(modalSelector);
    if (modal) {
      modal.classList.add('is-open');
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
      setTimeout(() => firstInput?.focus(), 50);
    }
  }

  function closeModal(modalSelector) {
    const modal = $(modalSelector);
    if (modal) {
      modal.classList.remove('is-open');
    }
  }

  // =====================================================================
  // ربط أحداث النماذج والأزرار العامة
  // =====================================================================

  function initAdminEvents() {

    // 1. روابط القائمة الجانبية العشرة
    $$('[data-admin-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.adminNav;
        switchView(targetView);
      });
    });

    // 2. البحث العام في الهيدر
    $('#adminGlobalSearchInput')?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (state.currentView === 'beneficiaries') {
        const input = $('#beneficiarySearchInput');
        if (input) input.value = val;
        renderBeneficiariesTable();
      } else if (state.currentView === 'specialists') {
        const input = $('#specialistSearchInput');
        if (input) input.value = val;
        renderSpecialistsTable();
      } else if (state.currentView === 'appointments') {
        const input = $('#apptSearchInput');
        if (input) input.value = val;
        renderAppointmentsTable();
      }
    });

    // 3. زر وقائمة الملف الشخصي
    $('#adminProfileBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#adminProfileMenu')?.classList.toggle('is-open');
    });

    // زر الإشعارات في الهيدر
    $('#adminNotifBellBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#adminNotifMenu')?.classList.toggle('is-open');
    });

    // إغلاق الدروب داون عند النقر خارجها
    document.addEventListener('click', () => {
      $('#adminProfileMenu')?.classList.remove('is-open');
      $('#adminNotifMenu')?.classList.remove('is-open');
    });

    // 4. زر الموبايل
    $('#adminMobileToggleBtn')?.addEventListener('click', () => {
      $('#adminSidebar')?.classList.toggle('is-open');
    });

    // 5. تسجيل الخروج
    const handleLogout = () => {
      if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة تحكم المدير؟')) {
        localStorage.removeItem('maladh:current_role');
        showToast('تم تسجيل الخروج بنجاح.');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      }
    };

    $('#adminSidebarLogoutBtn')?.addEventListener('click', handleLogout);
    $('#adminHeaderLogoutBtn')?.addEventListener('click', handleLogout);

    // 6. اختصارات لوحة التحكم
    $('#dashQuickAddSpecialistBtn')?.addEventListener('click', () => openModal('#adminAddSpecialistModal'));
    $('#dashQuickAddServiceBtn')?.addEventListener('click', () => {
      $('#adminServiceModalTitle') && ($('#adminServiceModalTitle').textContent = 'إضافة خدمة جديدة');
      $('#serviceEditId').value = '';
      $('#adminServiceForm')?.reset();
      openModal('#adminServiceModal');
    });
    $('#dashQuickBroadcastNotifBtn')?.addEventListener('click', () => switchView('notifications'));

    // 7. أزرار الفلاتر في جدول المستفيدين
    $$('[data-beneficiary-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-beneficiary-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.beneficiaryFilter = btn.dataset.beneficiaryFilter;
        renderBeneficiariesTable();
      });
    });

    $('#beneficiarySearchInput')?.addEventListener('input', renderBeneficiariesTable);
    $('#openAddBeneficiaryModalBtn')?.addEventListener('click', () => openModal('#adminAddBeneficiaryModal'));

    // نموذج إضافة مستفيد جديد
    $('#adminAddBeneficiaryForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#addBenefName')?.value.trim();
      const email = $('#addBenefEmail')?.value.trim();
      const phone = $('#addBenefPhone')?.value.trim();
      const status = $('#addBenefStatus')?.value || 'active';

      if (!name || !email) return;

      const newB = {
        id: `b-${Date.now()}`,
        name,
        email,
        phone,
        registeredDate: '2026-11-14',
        sessionsCount: 0,
        status
      };

      state.beneficiaries.unshift(newB);
      setStorage(KEYS.BENEFICIARIES, state.beneficiaries);
      closeModal('#adminAddBeneficiaryModal');
      $('#adminAddBeneficiaryForm').reset();
      renderBeneficiariesTable();
      showToast(`تمت إضافة المستفيد: ${name} بنجاح`);
    });

    // 8. أزرار الفلاتر في جدول المختصين
    $$('[data-specialist-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-specialist-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.specialistFilter = btn.dataset.specialistFilter;
        renderSpecialistsTable();
      });
    });

    $('#specialistSearchInput')?.addEventListener('input', renderSpecialistsTable);
    $('#openAddSpecialistModalBtn')?.addEventListener('click', () => openModal('#adminAddSpecialistModal'));

    // نموذج إضافة مختص جديد
    $('#adminAddSpecialistForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#addSpecName')?.value.trim();
      const specialty = $('#addSpecSpecialty')?.value;
      const license = $('#addSpecLicense')?.value.trim();
      const email = $('#addSpecEmail')?.value.trim();
      const phone = $('#addSpecPhone')?.value.trim();

      if (!name || !license) return;

      const newS = {
        id: `sp-${Date.now()}`,
        name,
        specialty,
        license,
        email,
        phone,
        verified: true,
        available: true,
        rating: 5.0,
        sessions: 0
      };

      state.specialists.unshift(newS);
      setStorage(KEYS.SPECIALISTS, state.specialists);
      closeModal('#adminAddSpecialistModal');
      $('#adminAddSpecialistForm').reset();
      renderSpecialistsTable();
      showToast(`تمت إضافة واعتماد المختص: ${name} بنجاح`);
    });

    // 9. أزرار فلاتر المواعيد
    $$('[data-appt-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-appt-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.apptFilter = btn.dataset.apptFilter;
        renderAppointmentsTable();
      });
    });

    $('#apptSearchInput')?.addEventListener('input', renderAppointmentsTable);

    // 10. نموذج إضافة وتعديل الخدمات
    $('#openAddServiceModalBtn')?.addEventListener('click', () => {
      $('#adminServiceModalTitle') && ($('#adminServiceModalTitle').textContent = 'إضافة خدمة جديدة');
      $('#serviceEditId').value = '';
      $('#adminServiceForm')?.reset();
      openModal('#adminServiceModal');
    });

    $('#adminServiceForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#serviceEditId')?.value;
      const title = $('#serviceNameInput')?.value.trim();
      const desc = $('#serviceDescInput')?.value.trim();
      const icon = $('#serviceIconSelect')?.value || 'i-heart';
      const active = $('#serviceStatusSelect')?.value === 'active';

      if (!title || !desc) return;

      if (id) {
        // تعديل
        const srv = state.services.find(x => x.id === id);
        if (srv) {
          srv.title = title;
          srv.desc = desc;
          srv.icon = icon;
          srv.active = active;
          showToast(`تم تعديل خدمة: ${title} بنجاح`);
          if (window.MaladhDB && window.MaladhDB.services) {
            window.MaladhDB.services.update(id, { title, description: desc, icon, is_active: active }).catch(err => console.warn(err));
          }
        }
      } else {
        // إضافة جديدة
        state.services.push({
          id: `srv-${Date.now()}`,
          title,
          desc,
          icon,
          specialistsCount: 1,
          sessionsCount: 0,
          active
        });
        showToast(`تمت إضافة خدمة: ${title} بنجاح`);
        if (window.MaladhDB && window.MaladhDB.services) {
          window.MaladhDB.services.create({ title, description: desc, icon, is_active: active }).catch(err => console.warn(err));
        }
      }

      setStorage(KEYS.SERVICES, state.services);
      closeModal('#adminServiceModal');
      renderServicesCards();
    });

    // 11. إحالة طلب استشارة
    $('#adminAssignSpecialistForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const reqId = $('#assignRequestId')?.value;
      const specName = $('#assignSpecialistSelect')?.value;

      const req = state.consultations.find(x => x.id === reqId);
      if (req) {
        req.specialist = specName;
        req.status = 'assigned';
        setStorage(KEYS.REQUESTS, state.consultations);
        closeModal('#adminAssignSpecialistModal');
        renderConsultationsTable();
        showToast(`تمت إحالة الطلب ${req.id} إلى ${specName} بنجاح`);
      }
    });

    // 12. إرسال رد في الدعم الخاص
    $('#adminSupportForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#adminSupportInput');
      const text = input ? input.value.trim() : '';
      if (!text) return;

      const ticket = state.supportTickets.find(t => t.id === state.activeTicketId);
      if (ticket) {
        const now = new Date();
        const timeStr = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
        ticket.messages.push({
          sender: 'admin',
          text,
          time: timeStr
        });
        ticket.lastTime = timeStr;
        setStorage(KEYS.SUPPORT, state.supportTickets);
        input.value = '';
        renderSupportChat();

        if (window.MaladhDB && window.MaladhDB.support && ticket.id) {
          window.MaladhDB.support.sendMessage(ticket.id, state.admin.id || '773d12c3-39b6-400a-ab85-2d1c99e1c97b', 'admin', text).catch(err => console.warn(err));
        }
      }
    });

    $('#supportResolveTicketBtn')?.addEventListener('click', () => {
      const ticket = state.supportTickets.find(t => t.id === state.activeTicketId);
      if (ticket) {
        ticket.status = 'resolved';
        setStorage(KEYS.SUPPORT, state.supportTickets);
        renderSupportChat();
        showToast(`تم إغلاق وحل تذكرة المستفيد: ${ticket.beneficiary}`);

        if (window.MaladhDB && window.MaladhDB.support && ticket.id) {
          window.MaladhDB.support.updateTicketStatus(ticket.id, 'resolved').catch(err => console.warn(err));
        }
      }
    });

    // 13. نموذج إرسال إشعار جديد
    $('#createNotificationForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const target = $('#notifTargetGroup')?.options[$('#notifTargetGroup').selectedIndex].text;
      const type = $('#notifTypeSelect')?.value;
      const title = $('#notifTitleInput')?.value.trim();
      const content = $('#notifContentInput')?.value.trim();

      if (!title || !content) return;

      const newNotif = {
        id: `notif-${Date.now()}`,
        title,
        target,
        type: $('#notifTypeSelect')?.options[$('#notifTypeSelect').selectedIndex].text,
        date: '2026-11-14 15:30',
        status: `تم الإرسال (${target})`
      };

      state.notifications.unshift(newNotif);
      setStorage(KEYS.NOTIFS, state.notifications);
      $('#createNotificationForm').reset();
      renderNotificationsLog();
      showToast(`تم بث وإرسال الإشعار بنجاح إلى: ${target}`);
    });

    // 14. تصدير التقارير
    $('#exportReportBtn')?.addEventListener('click', () => {
      showToast('جاري إنشاء وتحميل التقرير الإداري بصيغة PDF المشفرة...');
      setTimeout(() => {
        window.print();
      }, 500);
    });

    // 15. تبويبات الإعدادات
    $$('[data-settings-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.settingsTab;
        $$('[data-settings-tab]').forEach(b => {
          b.classList.remove('is-active', 'bg-blue-50', 'text-primary');
        });
        btn.classList.add('is-active', 'bg-blue-50', 'text-primary');

        $('#settingsTabProfile')?.classList.toggle('hidden', tab !== 'profile');
        $('#settingsTabPlatform')?.classList.toggle('hidden', tab !== 'platform');
        $('#settingsTabSecurity')?.classList.toggle('hidden', tab !== 'security');
      });
    });

    $('#adminProfileSettingsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#settingAdminName')?.value.trim();
      const email = $('#settingAdminEmail')?.value.trim();
      const title = $('#settingAdminTitle')?.value.trim();

      if (name) state.admin.username = name;
      if (email) state.admin.email = email;
      if (title) state.admin.title = title;

      setStorage(KEYS.ADMIN_USER, state.admin);
      $('#adminHeaderName') && ($('#adminHeaderName').textContent = name);
      showToast('تم تحديث بيانات حساب مدير النظام بنجاح');
    });

    $('#adminPlatformSettingsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('تم حفظ وتطبيق إعدادات المنصة العامة بنجاح');
    });

    // 16. إغلاق النوافذ المنبثقة
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        e.preventDefault();
        closeModal(closeBtn.dataset.closeModal);
      } else if (e.target.classList.contains('admin-modal-overlay')) {
        e.target.classList.remove('is-open');
      }
    });

    // زر Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openM = $('.admin-modal-overlay.is-open');
        if (openM) openM.classList.remove('is-open');
      }
    });

    // ---------- مزامنة بيانات لوحة المدير مع Supabase ----------
    async function syncAdminWithSupabase() {
      if (!window.MaladhDB) return;
      try {
        // 1. مزامنة الخدمات المعتمدة
        if (window.MaladhDB.services) {
          const liveServices = await window.MaladhDB.services.getAll();
          if (liveServices && liveServices.length > 0) {
            state.services = liveServices.map(s => ({
              id: s.id,
              title: s.title,
              desc: s.description,
              icon: s.icon || 'i-heart',
              specialistsCount: s.specialists_count || 1,
              sessionsCount: s.sessions_count || 0,
              active: s.is_active !== false
            }));
            setStorage(KEYS.SERVICES, state.services);
            if (state.currentView === 'services') renderServicesCards();
          }
        }

        // 2. مزامنة الأخصائيين
        if (window.MaladhDB.specialists) {
          const liveSpecs = await window.MaladhDB.specialists.getAll();
          if (liveSpecs && liveSpecs.length > 0) {
            state.specialists = liveSpecs.map(s => ({
              id: s.id,
              name: (s.profiles && s.profiles.full_name) || s.name || 'أخصائي',
              specialty: s.specialty || 'استشارات نفسية',
              license: s.license_number || s.license || 'PSY-00000',
              email: (s.profiles && s.profiles.email) || s.email || 'doctor@maladh.com',
              phone: (s.profiles && s.profiles.phone) || s.phone || '05XXXXXXXX',
              verified: s.is_verified === true,
              available: s.is_available === true,
              rating: Number(s.rating) || 4.9,
              sessions: s.total_sessions || 0
            }));
            setStorage(KEYS.SPECIALISTS, state.specialists);
            if (state.currentView === 'specialists') renderSpecialistsTable();
            if (state.currentView === 'dashboard') renderDashboardView();
          }
        }

        // 3. مزامنة المواعيد
        if (window.MaladhDB.appointments) {
          const liveAppts = await window.MaladhDB.appointments.getAll({ role: 'admin' });
          if (liveAppts && liveAppts.length > 0) {
            state.appointments = liveAppts.map(a => ({
              id: a.appointment_code || a.id,
              beneficiary: (a.beneficiary && a.beneficiary.full_name) || a.beneficiary || 'مستفيد',
              specialist: (a.specialist && a.specialist.profile && a.specialist.profile.full_name) || a.specialist || 'أخصائي',
              date: a.appointment_date,
              time: a.appointment_time,
              type: a.type || 'عن بُعد',
              status: a.status
            }));
            setStorage(KEYS.APPOINTMENTS, state.appointments);
            if (state.currentView === 'appointments') renderAppointmentsTable();
            if (state.currentView === 'dashboard') renderDashboardView();
          }
        }

        // 4. مزامنة المستفيدين من Supabase
        if (window.MaladhDB.auth && window.MaladhDB.auth.getAllProfiles) {
          const liveProfiles = await window.MaladhDB.auth.getAllProfiles({ role: 'beneficiary' });
          if (liveProfiles && liveProfiles.length > 0) {
            state.beneficiaries = liveProfiles.map(p => ({
              id: p.id,
              name: p.full_name || 'مستفيد',
              email: p.email,
              phone: p.phone || '05XXXXXXXX',
              registeredDate: (p.created_at || '').split('T')[0] || '2026-11-15',
              sessionsCount: 3,
              status: p.is_active ? 'active' : 'disabled'
            }));
            setStorage(KEYS.BENEFICIARIES, state.beneficiaries);
            if (state.currentView === 'beneficiaries') renderBeneficiariesTable();
            if (state.currentView === 'dashboard') renderDashboardView();
          }
        }

        // 5. مزامنة تذاكر الدعم الخاص من Supabase
        if (window.MaladhDB.support) {
          const liveTickets = await window.MaladhDB.support.getTickets();
          if (liveTickets && liveTickets.length > 0) {
            state.supportTickets = liveTickets.map(t => {
              const msgs = (t.messages || []).map(m => ({
                sender: m.sender_role || 'user',
                text: m.message_text,
                time: m.created_at ? new Date(m.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'
              }));
              const lastMsg = msgs[msgs.length - 1];
              return {
                id: t.id,
                beneficiary: 'عبد الرحمن محمد',
                subject: t.subject,
                lastMsg: lastMsg ? lastMsg.text : 'استفسار جديد',
                lastTime: lastMsg ? lastMsg.time : 'الآن',
                unread: t.status === 'open',
                status: t.status,
                messages: msgs
              };
            });
            setStorage(KEYS.SUPPORT, state.supportTickets);
            if (state.currentView === 'support') renderSupportChat();
          }
        }
      } catch (e) {
        console.warn('[Admin Dashboard] Supabase sync notice:', e.message);
      }
    }

    // 17. التعامل مع الهاش (Hash) المبدئي
    const hash = window.location.hash.replace('#', '');
    if (hash && VIEW_TITLES[hash]) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }

    // تشغيل المزامنة مع Supabase
    syncAdminWithSupabase();
  }

  // تشغيل عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminEvents);
  } else {
    initAdminEvents();
  }

})();

