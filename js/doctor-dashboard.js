/**
 * منصة ملاذ - محرك لوحة تحكم الأخصائي النفسي (Doctor Dashboard Logic)
 * HTML5, CSS3, Vanilla JavaScript فقط
 */

(function () {
  'use strict';

  // ---------- مفاتيح التخزين المحلي (LocalStorage Keys) ----------
  const KEYS = {
    DOCTOR_USER: 'maladh:doctor_user',
    CURRENT_ROLE: 'maladh:current_role',
    APPOINTMENTS: 'maladh:doctor_appts_v2',
    STATS: 'maladh:doctor_stats',
    SCHEDULE: 'maladh:doctor_schedule',
    THEME: 'maladh:theme',
    NOTIFS: 'maladh:doctor_notifs',
    VERSION: 'maladh:doctor_appts_version'
  };

  const CURRENT_APPTS_VERSION = 'v2.5';

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
    } catch (e) {}
  }

  const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // ---------- البيانات الأولية للأخصائي (Doctor Mock Data) ----------
  const INITIAL_DOCTOR = {
    username: 'د. سارة العتيبي',
    email: 'sara.otaibi@maladh.com',
    phone: '+966 50 123 4567',
    role: 'specialist',
    title: 'أخصائية في علم النفس العلاجي',
    license: 'رخصة هيئة التخصصات الصحية: PSY-88492',
    avatar: 'assets/specialist-sara.jpg',
    specialty: 'العلاج المعرفي السلوكي والدعم النفسي للتعافي',
    experience: '10 سنوات خبرة سريرية',
    bio: 'أخصائية معتمدة متخصصة في مسارات التعافي وإعادة التأهيل النفسي، وإدارة نوبات القلق والاكتئاب والضغوط الحياتية بسرية واحترافية تامة.'
  };

  let storedDoctor = getStorage(KEYS.DOCTOR_USER, null);
  if (!storedDoctor) {
    storedDoctor = INITIAL_DOCTOR;
    setStorage(KEYS.DOCTOR_USER, storedDoctor);
  }

  // ---------- البيانات التجريبية الشاملة للمواعيد (Full Appointments Mock Dataset) ----------
  const INITIAL_FULL_APPOINTMENTS = [
    // --- 1. مواعيد اليوم (3 مواعيد) ---
    {
      id: 'apt-today-1',
      beneficiary: 'أمل السلمي',
      time: '09:00 صباحاً',
      rawTime: '09:00',
      isoDate: '2026-11-06',
      date: 'اليوم - 6 نوفمبر 2026',
      consultType: 'استشارة نفسية فردية',
      sessionType: 'جلسة فردية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: true,
      isUpcoming: false,
      phone: '050 111 2233',
      notes: 'المستفيدة تعاني من قلق دراسي واضطرابات في النوم قبيل الاختبارات النهائية، ترغب في تقنيات ضبط التنفس والاسترخاء.'
    },
    {
      id: 'apt-today-2',
      beneficiary: 'محمد العتيبي',
      time: '11:30 صباحاً',
      rawTime: '11:30',
      isoDate: '2026-11-06',
      date: 'اليوم - 6 نوفمبر 2026',
      consultType: 'جلسة متابعة نفسية',
      sessionType: 'جلسة أولية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: true,
      isUpcoming: false,
      phone: '055 444 3322',
      notes: 'جلسة تقييم ومتابعة لمسار التعافي في اليوم الـ 42، المستفيد يحرز تقدماً ممتازاً في إدارة المحفزات اليومية.'
    },
    {
      id: 'apt-today-3',
      beneficiary: 'سارة القحطاني',
      time: '04:00 مساءً',
      rawTime: '16:00',
      isoDate: '2026-11-06',
      date: 'اليوم - 6 نوفمبر 2026',
      consultType: 'جلسة علاجية',
      sessionType: 'جلسة أولية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: true,
      isUpcoming: false,
      phone: '056 777 8899',
      notes: 'جلسة علاجية متخصصة في العلاج المعرفي السلوكي وبناء خطة مواجهة الأفكار السلبية والضغوط.'
    },

    // --- 2. المواعيد القادمة (8 مواعيد) ---
    {
      id: 'apt-up-1',
      beneficiary: 'نورة أحمد',
      time: '10:00 صباحاً',
      rawTime: '10:00',
      isoDate: '2026-11-07',
      date: 'السبت - 7 نوفمبر 2026',
      consultType: 'جلسة دعم وإرشاد',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: false,
      isUpcoming: true,
      phone: '054 222 3344',
      notes: 'جلسة إرشادية حول مهارات التعامل مع القلق الاجتماعي واستعادة التوازن النفسي.'
    },
    {
      id: 'apt-up-2',
      beneficiary: 'خالد عبدالله',
      time: '02:00 مساءً',
      rawTime: '14:00',
      isoDate: '2026-11-07',
      date: 'السبت - 7 نوفمبر 2026',
      consultType: 'استشارة أولية',
      sessionType: 'جلسة أولية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'new',
      statusText: 'جديد',
      isToday: false,
      isUpcoming: true,
      phone: '053 555 6677',
      notes: 'طلب حجز جديد للتقييم الأولي لمسار التعافي وتحديد الأهداف العلاجية.'
    },
    {
      id: 'apt-up-3',
      beneficiary: 'ريم محمد',
      time: '11:00 صباحاً',
      rawTime: '11:00',
      isoDate: '2026-11-08',
      date: 'الأحد - 8 نوفمبر 2026',
      consultType: 'استشارة نفسية فردية',
      sessionType: 'جلسة فردية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'pending',
      statusText: 'قيد الانتظار',
      isToday: false,
      isUpcoming: true,
      phone: '055 888 9911',
      notes: 'المستفيدة بانتظار تأكيد الموعد النهائي للجلسة الاستشارية الفردية.'
    },
    {
      id: 'apt-up-4',
      beneficiary: 'فيصل الدوسري',
      time: '05:00 مساءً',
      rawTime: '17:00',
      isoDate: '2026-11-09',
      date: 'الإثنين - 9 نوفمبر 2026',
      consultType: 'جلسة متابعة نفسية',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: false,
      isUpcoming: true,
      phone: '050 333 4455',
      notes: 'متابعة مؤشرات التعافي وقياس مستوى الالتزام بالخطة السلوكية اليومية.'
    },
    {
      id: 'apt-up-5',
      beneficiary: 'هند الغامدي',
      time: '09:30 صباحاً',
      rawTime: '09:30',
      isoDate: '2026-11-10',
      date: 'الثلاثاء - 10 نوفمبر 2026',
      consultType: 'جلسة علاجية',
      sessionType: 'جلسة أولية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'new',
      statusText: 'جديد',
      isToday: false,
      isUpcoming: true,
      phone: '056 444 7788',
      notes: 'طلب جديد لجلسة علاجية لإدارة نوبات الهلع وضيق التنفس المفاجئ.'
    },
    {
      id: 'apt-up-6',
      beneficiary: 'عمر الحربي',
      time: '04:30 مساءً',
      rawTime: '16:30',
      isoDate: '2026-11-12',
      date: 'الخميس - 12 نوفمبر 2026',
      consultType: 'استشارة نفسية فردية',
      sessionType: 'جلسة فردية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'confirmed',
      statusText: 'مؤكد',
      isToday: false,
      isUpcoming: true,
      phone: '052 777 6655',
      notes: 'استشارة فردية حول تعزيز المرونة النفسية والتعامل مع ضغوط العمل.'
    },
    {
      id: 'apt-up-7',
      beneficiary: 'ليلى الشهري',
      time: '01:00 مساءً',
      rawTime: '13:00',
      isoDate: '2026-11-14',
      date: 'السبت - 14 نوفمبر 2026',
      consultType: 'استشارة أولية',
      sessionType: 'جلسة أولية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'new',
      statusText: 'جديد',
      isToday: false,
      isUpcoming: true,
      phone: '055 333 1122',
      notes: 'استشارة استكشافية أولية لتحديد المسار العلاجي المناسب.'
    },
    {
      id: 'apt-up-8',
      beneficiary: 'عبد الرحمن الشمري',
      time: '06:00 مساءً',
      rawTime: '18:00',
      isoDate: '2026-11-15',
      date: 'الأحد - 15 نوفمبر 2026',
      consultType: 'جلسة دعم وإرشاد',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'pending',
      statusText: 'قيد الانتظار',
      isToday: false,
      isUpcoming: true,
      phone: '055 123 4567',
      notes: 'جلسة دعم دورية لمتابعة الإنجازات المحققة في رحلة التعافي.'
    },

    // --- 3. المواعيد الملغاة (2 مواعيد) ---
    {
      id: 'apt-can-1',
      beneficiary: 'طارق الزهراني',
      time: '12:00 ظهراً',
      rawTime: '12:00',
      isoDate: '2026-11-03',
      date: 'الثلاثاء - 3 نوفمبر 2026',
      consultType: 'استشارة نفسية فردية',
      sessionType: 'جلسة فردية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'cancelled',
      statusText: 'ملغي',
      isToday: false,
      isUpcoming: false,
      phone: '050 777 1122',
      notes: 'تم إلغاء الموعد بناءً على طلب المستفيد لظروف سفر مفاجئة.'
    },
    {
      id: 'apt-can-2',
      beneficiary: 'منيرة السبيعي',
      time: '03:00 مساءً',
      rawTime: '15:00',
      isoDate: '2026-11-04',
      date: 'الأربعاء - 4 نوفمبر 2026',
      consultType: 'جلسة متابعة نفسية',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'cancelled',
      statusText: 'ملغي',
      isToday: false,
      isUpcoming: false,
      phone: '054 666 8899',
      notes: 'تم إلغاء الموعد لتعارض في جدول المستفيدة، وتمت إعادة التوجيه لطلب موعد جديد.'
    },

    // --- 4. نماذج الجلسات المكتملة السابقة (التي تمت وتحتوي على تقارير سريرية وتوصيات) ---
    {
      id: 'apt-comp-1',
      beneficiary: 'فهد المطيري',
      time: '10:00 صباحاً',
      rawTime: '10:00',
      isoDate: '2026-11-05',
      date: 'الخميس - 5 نوفمبر 2026',
      consultType: 'جلسة علاجية',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'completed',
      statusText: 'مكتمل',
      isToday: false,
      isUpcoming: false,
      phone: '050 444 5566',
      diagnosis: 'أعراض قلق وتوتر نفسي ناتج عن الضغوط المهنية، مع تقدم ممتاز في استراتيجيات التنظيم الانفعالي.',
      clinicalReport: 'تم خلال الجلسة مراجعة مسار التعافي لآخر أسبوعين، المستفيد أظهر التزاماً ممتازاً بالتمارين اليومية، كما تم تقييم وتعديل أنماط التفكير المشوهة وتدريبه على أسلوب حل المشكلات التدريجي. الحالة مستقرة وتتجه نحو الاستقلالية التامة.',
      recommendations: [
        'الاستمرار في ممارسة تمرين التنفس البطني (4-7-8) مرتين يومياً.',
        'تدوين سجل الأفكار والمشاعر اليومي في تطبيق ملاذ.',
        'جلسة المتابعة القادمة بعد أسبوعين لتقييم النتائج.'
      ],
      notes: 'اكتملت الجلسة بنجاح، المستفيد أبدى تحسناً ملحوظاً في السيطرة على القلق وتطبيق تمارين الاسترخاء.'
    },
    {
      id: 'apt-comp-2',
      beneficiary: 'رنا العبدلي',
      time: '01:30 مساءً',
      rawTime: '13:30',
      isoDate: '2026-11-05',
      date: 'الخميس - 5 نوفمبر 2026',
      consultType: 'استشارة نفسية فردية',
      sessionType: 'جلسة فردية',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'completed',
      statusText: 'مكتمل',
      isToday: false,
      isUpcoming: false,
      phone: '055 999 4433',
      diagnosis: 'اضطراب المزاج التفاعلي الخفيف مع تحسن ملحوظ في تعزيز المرونة وتعديل الأفكار المشوهة.',
      clinicalReport: 'عقدت الجلسة عن بُعد عبر اتصال فيديو مشفر، المستفيدة أظهرت استبصاراً عالياً بالمشاعر وتجاوبت بفعالية مع تقنيات العلاج المعرفي السلوكي، وتطبيق سجل الرصد اليومي.',
      recommendations: [
        'الالتزام بروتين النوم الصحي والابتعاد عن الشاشات قبل النوم.',
        'ممارسة تمارين الاسترخاء العضلي التدريجي.',
        'متابعة أسبوعية عبر الاستشارات السريعة في منصة ملاذ.'
      ],
      notes: 'تمت مناقشة المعتقدات السلبية وإعادة صياغة الأهداف الأسبوعية بنجاح.'
    },
    {
      id: 'apt-comp-3',
      beneficiary: 'ياسر التميمي',
      time: '04:00 مساءً',
      rawTime: '16:00',
      isoDate: '2026-11-02',
      date: 'الإثنين - 2 نوفمبر 2026',
      consultType: 'جلسة دعم وإرشاد',
      sessionType: 'جلسة متابعة',
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'green',
      status: 'completed',
      statusText: 'مكتمل',
      isToday: false,
      isUpcoming: false,
      phone: '056 123 9988',
      diagnosis: 'مرحلة متقدمة في مسار التعافي، بناء خطة الحماية من الانتكاسة وتعزيز شبكة الدعم الذاتي.',
      clinicalReport: 'تقييم شامل لليوم الـ 90 من التعافي، مناقشة المحفزات البيئية، وتأكيد جاهزية المستفيد لإنهاء البرنامج العلاجي المكثف والانتقال إلى الرعاية اللاحقة.',
      recommendations: [
        'حضور جلسات الدعم الجماعي الدورية للمتعافين.',
        'الاستمرار في تحديث عداد ومسار التعافي في ملاذ.',
        'التواصل الفوري في حال مواجهة أي محفزات ضاغطة.'
      ],
      notes: 'تم توثيق تقرير الجلسة وحفظ التوصيات الإكلينيكية بنجاح.'
    }
  ];

  // التحقق من تحديث التخزين المحلي بالبيانات الموسعة والتقارير
  let storedAppts = getStorage(KEYS.APPOINTMENTS, null);
  const storedVersion = localStorage.getItem(KEYS.VERSION);
  if (!storedAppts || storedVersion !== CURRENT_APPTS_VERSION || storedAppts.length < 10) {
    storedAppts = INITIAL_FULL_APPOINTMENTS;
    setStorage(KEYS.APPOINTMENTS, storedAppts);
    try { localStorage.setItem(KEYS.VERSION, CURRENT_APPTS_VERSION); } catch (e) {}
  }

  // الإحصائيات الأولية
  const INITIAL_STATS = {
    monthAppts: 18,
    completedSessions: 46,
    totalSessionsTarget: 50,
    completionRate: 92,
    totalPatients: 32,
    newRequests: 5
  };

  // قائمة الإشعارات
  const INITIAL_NOTIFICATIONS = [
    { id: 'notif-1', title: 'طلب حجز جديد', desc: 'قامت أمل السلمي بحجز جلسة استشارية فردية للساعة 09:00 صباحاً.', time: 'منذ 15 دقيقة', unread: true },
    { id: 'notif-2', title: 'تذكير بموعد وشيك', desc: 'جلستك القادمة مع محمد العتيبي تبدأ خلال 30 دقيقة.', time: 'منذ ساعة', unread: true },
    { id: 'notif-3', title: 'تم استكمال تقرير جلسة', desc: 'تم حفظ تقرير الجلسة السريرية للمستفيد عبد الرحمن الشمري بنجاح.', time: 'منذ ساعتين', unread: false },
    { id: 'notif-4', title: 'تقييم جديد 5 نجوم', desc: 'حصلت على تقييم 5 نجوم من المستفيدة سارة القحطاني.', time: 'أمس', unread: false }
  ];

  // الحالة العامة للتطبيق
  let state = {
    doctor: storedDoctor,
    appointments: storedAppts,
    completedBaseCount: 45,
    stats: getStorage(KEYS.STATS, INITIAL_STATS),
    notifications: getStorage(KEYS.NOTIFS, INITIAL_NOTIFICATIONS),
    currentView: 'appointments', // «إدارة المواعيد» نشطة افتراضياً حسب طلب المستخدم
    currentApptsTab: 'upcoming',  // التبويب النشط افتراضياً في قائمة المواعيد
    calendar: {
      year: 2026,
      month: 10, // نوفمبر (0-indexed: 10 = نوفمبر)
      selectedDate: '2026-11-06',
      viewMode: 'month'
    },
    activeSession: null,
    sessionTimerInterval: null,
    sessionSeconds: 0,
    pendingActionAppt: null
  };

  // ---------- إشعارات التوست السريعة ----------
  function showToast(message) {
    const toast = $('#docToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('is-show');
    }, 3200);
  }

  // ---------- تحديث بيانات الأخصائي في الواجهة ----------
  function syncDoctorProfileUI() {
    const doc = state.doctor;
    const name = doc.username || 'د. سارة العتيبي';

    const headerName = $('#headerDoctorName');
    if (headerName) headerName.textContent = name;
    const headerAvatar = $('#headerDoctorAvatar');
    if (headerAvatar && doc.avatar) headerAvatar.src = doc.avatar;

    const bannerName = $('#welcomeDoctorName');
    if (bannerName) bannerName.textContent = `مرحباً بك ${name}`;

    const pName = $('#profileDoctorName'); if (pName) pName.value = name;
    const pTitle = $('#profileDoctorTitle'); if (pTitle) pTitle.value = doc.title || '';
    const pLicense = $('#profileDoctorLicense'); if (pLicense) pLicense.value = doc.license || '';
    const pPhone = $('#profileDoctorPhone'); if (pPhone) pPhone.value = doc.phone || '';
    const pEmail = $('#profileDoctorEmail'); if (pEmail) pEmail.value = doc.email || '';
    const pBio = $('#profileDoctorBio'); if (pBio) pBio.value = doc.bio || '';

    const cardName = $('#cardDoctorName'); if (cardName) cardName.textContent = name;
    const cardTitle = $('#cardDoctorTitle'); if (cardTitle) cardTitle.textContent = doc.title || '';
    const cardLicense = $('#cardDoctorLicense'); if (cardLicense) cardLicense.textContent = doc.license || '';
  }

  // ---------- تحديث أرقام إحصائيات الصفحة الرئيسية ----------
  function renderStats() {
    const s = state.stats;
    const elMonth = $('#statMonthAppts');
    if (elMonth) elMonth.textContent = s.monthAppts;

    const elRate = $('#statCompletionRate');
    if (elRate) elRate.textContent = `${s.completionRate}%`;

    const elPatients = $('#statTotalPatients');
    if (elPatients) elPatients.textContent = s.totalPatients;

    const elRequests = $('#statNewRequests');
    if (elRequests) elRequests.textContent = s.newRequests;
  }

  // ---------- رسم جدول مواعيد اليوم في الصفحة الرئيسية ----------
  function renderTodayAppointments(filterText = '') {
    const tbody = $('#todayApptsTableBody');
    if (!tbody) return;

    const q = (filterText || '').trim().toLowerCase();
    const list = state.appointments.filter(a => {
      if (!a.isToday || a.status === 'cancelled') return false;
      if (!q) return true;
      return a.beneficiary.toLowerCase().includes(q) ||
             a.consultType.toLowerCase().includes(q) ||
             a.sessionType.toLowerCase().includes(q) ||
             a.time.toLowerCase().includes(q);
    });

    const counterEl = $('#todayApptsCount');
    if (counterEl) counterEl.textContent = `${list.length} مواعيد مجدولة اليوم`;

    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8 text-muted">
            <svg class="icon ic-24 mb-2 mx-auto text-primary opacity-60"><use href="#i-calendar"/></svg>
            <p class="font-bold">لا توجد مواعيد مطابقة لنتائج البحث في جدول اليوم</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(a => {
      const isStartBlue = a.btnColor === 'blue';
      const startBtnClass = isStartBlue ? 'doc-btn-start-blue' : 'doc-btn-start-green';

      return `
        <tr id="row-${a.id}">
          <td>
            <div class="doc-user-cell">
              <div class="doc-user-cell-icon">
                <svg class="icon ic-16"><use href="#i-user"/></svg>
              </div>
              <div>
                <span>${a.beneficiary}</span>
                <span class="block text-[11px] text-muted font-normal">${a.phone || ''}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="doc-time-cell">
              <svg class="icon ic-16"><use href="#i-clock"/></svg>
              <span>${a.time}</span>
            </div>
          </td>
          <td>
            <span class="doc-chip doc-chip-blue">${a.consultType}</span>
          </td>
          <td>
            <span class="doc-chip ${a.sessionType === 'جلسة أولية' ? 'doc-chip-purple' : 'doc-chip-teal'}">
              ${a.sessionType}
            </span>
          </td>
          <td>
            <button type="button" class="doc-table-btn ${startBtnClass}" data-start-session="${a.id}">
              <svg class="icon ic-16"><use href="#i-video"/></svg>
              <span>بدء الجلسة</span>
            </button>
          </td>
          <td>
            <button type="button" class="doc-table-btn doc-btn-view-details" data-view-detail="${a.id}">
              <svg class="icon ic-16"><use href="#i-eye"/></svg>
              <span>عرض التفاصيل</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // وظائف ومحرك صفحة "إدارة المواعيد" (Appointments Management View Logic)
  // =========================================================================

  // ---------- 1. تحديث إحصائيات المواعيد الأربع ديناميكياً ----------
  function updateAppointmentStats() {
    const appts = state.appointments;

    // حساب الأعداد وفق الحالات والتواريخ
    const todayCount = appts.filter(a => a.isToday && a.status !== 'cancelled').length;
    const upcomingCount = appts.filter(a => (a.isUpcoming || a.isToday) && a.status !== 'cancelled' && a.status !== 'completed').length;
    const newlyCompleted = appts.filter(a => a.status === 'completed' && a.id.startsWith('apt-today')).length;
    const completedCount = state.completedBaseCount + newlyCompleted;
    const cancelledCount = appts.filter(a => a.status === 'cancelled').length;
    const newCount = appts.filter(a => a.status === 'new').length;

    // 1. كروت الإحصائيات الأربعة الأفقية
    const elToday = $('#statApptsToday'); if (elToday) elToday.textContent = todayCount;
    const elUpcoming = $('#statApptsUpcoming'); if (elUpcoming) elUpcoming.textContent = upcomingCount;
    const elCompleted = $('#statApptsCompleted'); if (elCompleted) elCompleted.textContent = completedCount;
    const elCancelled = $('#statApptsCancelled'); if (elCancelled) elCancelled.textContent = cancelledCount;

    // 2. شارات أعداد التبويبات الخمسة
    const bNew = $('#tabBadgeNew'); if (bNew) bNew.textContent = newCount;
    const bToday = $('#tabBadgeToday'); if (bToday) bToday.textContent = todayCount;
    const bUpcoming = $('#tabBadgeUpcoming'); if (bUpcoming) bUpcoming.textContent = upcomingCount;
    const bCompleted = $('#tabBadgeCompleted'); if (bCompleted) bCompleted.textContent = completedCount;
    const bCancelled = $('#tabBadgeCancelled'); if (bCancelled) bCancelled.textContent = cancelledCount;

    // 3. شارة الشريط الجانبي
    const sideBadge = $('#sidebarApptsBadge');
    if (sideBadge) sideBadge.textContent = `${upcomingCount} مجدولة`;
  }

  // ---------- 2. التقويم التفاعلي (Interactive Calendar) ----------
  function renderCalendar() {
    const grid = $('#docCalendarGrid');
    const label = $('#calMonthYearLabel');
    if (!grid || !label) return;

    const { year, month, selectedDate } = state.calendar;
    label.textContent = `${ARABIC_MONTHS[month]} ${year}`;

    // حساب بداية الشهر وعدد الأيام
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = الأحد
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // استخراج تواريخ المواعيد لهذا الشهر لعرض مؤشر النقطة
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const apptDatesSet = new Set(
      state.appointments
        .filter(a => a.isoDate && a.isoDate.startsWith(monthPrefix) && a.status !== 'cancelled')
        .map(a => a.isoDate)
    );

    let html = '';

    // الأيام من الشهر السابق
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      html += `<div class="doc-cal-cell is-other-month" aria-hidden="true">${dayNum}</div>`;
    }

    // أيام الشهر الحالي
    const todayStr = '2026-11-06';
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dayStr === todayStr;
      const isSelected = dayStr === selectedDate;
      const hasAppts = apptDatesSet.has(dayStr);

      let classes = ['doc-cal-cell'];
      if (isToday) classes.push('is-today');
      if (isSelected) classes.push('is-selected');
      if (hasAppts) classes.push('has-appts');

      html += `
        <button type="button" class="${classes.join(' ')}" data-cal-date="${dayStr}" aria-label="${day} ${ARABIC_MONTHS[month]}">
          <span>${day}</span>
        </button>
      `;
    }

    // الأيام اللاحقة لإكمال مربعات الأسبوع
    const totalCells = firstDayIndex + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      html += `<div class="doc-cal-cell is-other-month" aria-hidden="true">${nextDay}</div>`;
    }

    grid.innerHTML = html;
  }

  // ---------- 3. بطاقة المواعيد القادمة في الجهة اليمنى ----------
  function renderUpcomingAppointments(targetDate) {
    const container = $('#upcomingApptsContainer');
    const dateLabel = $('#upcomingSelectedDateLabel');
    const countBadge = $('#upcomingDayCountBadge');
    if (!container) return;

    if (!targetDate) targetDate = state.calendar.selectedDate || '2026-11-06';

    // تنسيق التاريخ باللغة العربية
    let displayDate = targetDate;
    if (targetDate === '2026-11-06') {
      displayDate = 'اليوم - 6 نوفمبر 2026';
    } else {
      const parts = targetDate.split('-');
      if (parts.length === 3) {
        const mIdx = parseInt(parts[1], 10) - 1;
        displayDate = `${parseInt(parts[2], 10)} ${ARABIC_MONTHS[mIdx] || ''} ${parts[0]}`;
      }
    }
    if (dateLabel) dateLabel.textContent = displayDate;

    // تصفية المواعيد لليوم المحدد، أو إن لم يوجد نعرض المواعيد القادمة القريبة
    let list = state.appointments.filter(a => a.isoDate === targetDate && a.status !== 'cancelled');
    if (!list.length && targetDate === '2026-11-06') {
      list = state.appointments.filter(a => a.isToday && a.status !== 'cancelled');
    }

    if (countBadge) countBadge.textContent = `${list.length} ${list.length === 1 ? 'موعد' : 'مواعيد'}`;

    if (!list.length) {
      container.innerHTML = `
        <div class="p-6 text-center text-muted bg-bg-soft rounded-2xl border border-line-soft my-auto">
          <svg class="icon ic-24 text-primary mx-auto mb-2 opacity-60"><use href="#i-calendar"/></svg>
          <p class="font-bold text-sm text-ink mb-1">لا توجد مواعيد مجدولة لهذا التاريخ</p>
          <p class="text-xs text-muted mb-3">يمكنك فتح موعد جديد أو تحديد يوم آخر من التقويم.</p>
          <button type="button" class="btn btn-outline btn-sm text-xs" onclick="openNewAppointmentModal('${targetDate}')">
            <svg class="icon ic-14"><use href="#i-calendar"/></svg>
            <span>جدولة موعد في هذا اليوم</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(a => `
      <div class="doc-upcoming-item" id="upcoming-${a.id}">
        <div class="flex items-center gap-2.5">
          <div class="doc-upcoming-initial">${a.beneficiary.charAt(0)}</div>
          <div>
            <h4 class="font-bold text-sm text-ink">${a.beneficiary}</h4>
            <div class="flex items-center gap-1.5 text-xs text-muted mt-0.5">
              <svg class="icon ic-12 text-primary"><use href="#i-clock"/></svg>
              <span>${a.time}</span>
              <span>•</span>
              <span class="text-ink font-medium">${a.consultType}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          ${a.isToday ? `
            <button type="button" class="doc-table-btn doc-btn-start-blue text-xs py-1.5 px-3" data-start-session="${a.id}">
              <svg class="icon ic-14"><use href="#i-video"/></svg>
              <span>بدء</span>
            </button>
          ` : ''}
          <button type="button" class="doc-action-btn doc-action-edit" data-action="edit" data-id="${a.id}" data-tooltip="تعديل الموعد" title="تعديل الموعد">
            <svg class="icon ic-16"><use href="#i-edit"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // ---------- 4. جدول إدارة المواعيد والتبويبات الخمسة والبحث ----------
  function renderAppointmentsManager() {
    const tbody = $('#apptsManagerTableBody');
    if (!tbody) return;

    updateAppointmentStats();

    const activeTab = state.currentApptsTab || 'upcoming';
    const globalSearch = ($('#docGlobalSearch')?.value || '').trim().toLowerCase();
    const localSearch = ($('#apptsSearchInput')?.value || '').trim().toLowerCase();
    const query = localSearch || globalSearch;
    const typeFilter = ($('#apptsTypeFilter')?.value || '').trim();

    // 1. التصفية حسب التبويب النشط
    let list = state.appointments.filter(a => {
      if (activeTab === 'new') return a.status === 'new';
      if (activeTab === 'today') return a.isToday && a.status !== 'cancelled';
      if (activeTab === 'upcoming') return (a.isUpcoming || a.isToday) && a.status !== 'cancelled' && a.status !== 'completed';
      if (activeTab === 'completed') return a.status === 'completed';
      if (activeTab === 'cancelled') return a.status === 'cancelled';
      return true;
    });

    // 2. التصفية حسب نوع الجلسة
    if (typeFilter) {
      list = list.filter(a => a.consultType === typeFilter);
    }

    // 3. التصفية حسب البحث (اسم المستفيد، تاريخ الموعد، نوع الاستشارة)
    if (query) {
      list = list.filter(a =>
        a.beneficiary.toLowerCase().includes(query) ||
        a.date.toLowerCase().includes(query) ||
        (a.isoDate && a.isoDate.includes(query)) ||
        a.consultType.toLowerCase().includes(query) ||
        a.time.toLowerCase().includes(query)
      );
    }

    // تحديث نص عداد النتائج
    const countEl = $('#apptsFilterResultsCount');
    if (countEl) {
      const tabTitles = {
        new: 'المواعيد الجديدة',
        today: 'مواعيد اليوم',
        upcoming: 'المواعيد القادمة',
        completed: 'المواعيد المكتملة',
        cancelled: 'المواعيد الملغاة'
      };
      countEl.textContent = `عرض ${list.length} في ${tabTitles[activeTab] || 'القائمة'}`;
    }

    // رسالة عدم وجود نتائج
    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-muted">
            <svg class="icon ic-28 mb-2 mx-auto text-primary opacity-60"><use href="#i-search"/></svg>
            <p class="font-bold text-base text-ink mb-1">لا توجد مواعيد مطابقة لبحثك</p>
            <p class="text-xs text-muted">جرّب تغيير كلمات البحث أو التبديل إلى تصنيف آخر.</p>
          </td>
        </tr>
      `;
      return;
    }

    // رسم صفوف الجدول بنظام RTL:
    // - أيقونة العرض: تظهر فقط للمواعيد المكتملة (التي تمت) لفتح التقرير والملاحظات
    // - للمواعيد الجديدة والقادمة: تم حذف أيقونة العرض بناءً على طلب المستخدم
    // - أيقونة التعديل (القلم): تفتح نافذة تعديل كافة الحقول والبيانات
    // - أيقونة الحذف (سلة المهملات): تفتح نافذة تأكيد الحذف
    tbody.innerHTML = list.map(a => {
      let statusBadge = '';
      if (a.status === 'new') {
        statusBadge = '<span class="doc-chip doc-chip-cyan">جديد</span>';
      } else if (a.status === 'confirmed') {
        statusBadge = '<span class="doc-chip doc-chip-green">مؤكد</span>';
      } else if (a.status === 'pending') {
        statusBadge = '<span class="doc-chip doc-chip-amber">قيد الانتظار</span>';
      } else if (a.status === 'completed') {
        statusBadge = '<span class="doc-chip doc-chip-green font-bold">مكتمل</span>';
      } else if (a.status === 'cancelled') {
        statusBadge = '<span class="doc-chip doc-chip-red">ملغي</span>';
      } else {
        statusBadge = `<span class="doc-chip doc-chip-blue">${a.statusText || a.status}</span>`;
      }

      const isCompleted = a.status === 'completed';
      const viewReportBtn = isCompleted ? `
        <button type="button" class="doc-action-btn doc-action-view" data-action="view-report" data-id="${a.id}" data-tooltip="عرض التقرير والملاحظات" title="عرض التقرير والملاحظات" aria-label="عرض التقرير والملاحظات">
          <svg class="icon ic-16"><use href="#i-file-text"/></svg>
        </button>
      ` : '';

      const editBtn = `
        <button type="button" class="doc-action-btn doc-action-edit" data-action="edit" data-id="${a.id}" data-tooltip="تعديل الموعد" title="تعديل الموعد" aria-label="تعديل الموعد">
          <svg class="icon ic-16"><use href="#i-edit"/></svg>
        </button>
      `;

      const deleteBtn = `
        <button type="button" class="doc-action-btn doc-action-delete" data-action="delete" data-id="${a.id}" data-tooltip="حذف الموعد" title="حذف الموعد" aria-label="حذف الموعد">
          <svg class="icon ic-16"><use href="#i-trash"/></svg>
        </button>
      `;

      return `
        <tr id="mgmt-row-${a.id}">
          <td>
            <div class="doc-user-cell">
              <div class="doc-user-cell-icon">
                <svg class="icon ic-16"><use href="#i-user"/></svg>
              </div>
              <div>
                <span class="font-bold text-ink">${a.beneficiary}</span>
                <span class="block text-[11px] text-muted font-normal">${a.phone || ''}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="flex items-center gap-1.5 text-xs text-ink font-semibold">
              <svg class="icon ic-14 text-primary"><use href="#i-calendar"/></svg>
              <span>${a.date}</span>
            </div>
          </td>
          <td>
            <div class="doc-time-cell">
              <svg class="icon ic-14"><use href="#i-clock"/></svg>
              <span>${a.time}</span>
            </div>
          </td>
          <td>
            <span class="doc-chip doc-chip-blue">${a.consultType}</span>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align:center;">
            <div class="doc-actions-group">
              ${viewReportBtn}
              ${editBtn}
              ${deleteBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ---------- 5. النوافذ المنبثقة لإدارة المواعيد ----------

  // أ. فتح نافذة تعديل بيانات وحقول الموعد بالكامل
  function openEditApptModal(apptId) {
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;

    $('#editApptId').value = a.id;
    $('#editApptPatient').value = a.beneficiary;
    $('#editApptPhone').value = a.phone || '';
    $('#editApptDate').value = a.isoDate || '2026-11-06';
    $('#editApptTime').value = a.time || '09:00 صباحاً';
    $('#editApptConsultType').value = a.consultType || 'استشارة نفسية فردية';
    $('#editApptSessionType').value = a.sessionType || 'جلسة فردية';
    $('#editApptStatus').value = a.status || 'confirmed';
    $('#editApptMethod').value = a.method || 'عن بُعد - اتصال فيديو مشفر عبر المنصة';
    $('#editApptNotes').value = a.notes || '';

    openModal('#doctorEditApptModal');
  }

  // ب. حفظ كافة تعديلات الموعد
  function handleEditApptSubmit(e) {
    e.preventDefault();
    const apptId = $('#editApptId').value;
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;

    const patientName = $('#editApptPatient').value.trim();
    const phone = $('#editApptPhone').value.trim();
    const newIsoDate = $('#editApptDate').value;
    const time = $('#editApptTime').value;
    const consultType = $('#editApptConsultType').value;
    const sessionType = $('#editApptSessionType').value;
    const status = $('#editApptStatus').value;
    const method = $('#editApptMethod').value;
    const notes = $('#editApptNotes').value.trim();

    if (!patientName || !newIsoDate) {
      showToast('يرجى التأكد من كتابة اسم المستفيد وتحديد التاريخ.');
      return;
    }

    a.beneficiary = patientName;
    a.phone = phone;
    a.isoDate = newIsoDate;
    a.time = time;
    a.consultType = consultType;
    a.sessionType = sessionType;
    a.status = status;
    a.method = method;
    a.notes = notes;

    const statusLabels = {
      new: 'جديد',
      confirmed: 'مؤكد',
      pending: 'قيد الانتظار',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    a.statusText = statusLabels[status] || status;

    // تحديث صيغة التاريخ
    const parts = newIsoDate.split('-');
    if (parts.length === 3) {
      const mIdx = parseInt(parts[1], 10) - 1;
      const formattedDate = `${parseInt(parts[2], 10)} ${ARABIC_MONTHS[mIdx] || ''} ${parts[0]}`;
      a.date = newIsoDate === '2026-11-06' ? 'اليوم - 6 نوفمبر 2026' : formattedDate;
    }

    a.isToday = newIsoDate === '2026-11-06';
    a.isUpcoming = newIsoDate > '2026-11-06';

    setStorage(KEYS.APPOINTMENTS, state.appointments);
    closeModal('#doctorEditApptModal');

    renderAppointmentsManager();
    renderUpcomingAppointments(state.calendar.selectedDate);
    renderCalendar();
    renderTodayAppointments();
    showToast(`تم تعديل بيانات موعد ${a.beneficiary} بنجاح ✨`);
  }

  // ج. فتح نافذة عرض التقرير السريري والملاحظات للمواعيد التي تمت
  function openSessionReportModal(apptId) {
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;

    $('#reportPatientInitial').textContent = a.beneficiary.charAt(0);
    $('#reportPatientName').textContent = a.beneficiary;
    $('#reportSessionTypes').textContent = `${a.consultType} • ${a.sessionType}`;
    $('#reportDateTime').textContent = `${a.date} - ${a.time}`;

    $('#reportDiagnosis').textContent = a.diagnosis || 'تم استكمال التقييم السريري لحالة المستفيد وإقرار خطة المتابعة العلاجية والتأهيلية بنجاح.';
    $('#reportClinicalNotes').textContent = a.clinicalReport || a.notes || 'سجل الملاحظات: أظهر المستفيد استجابة إيجابية ممتازة لتقنيات العلاج المعرفي السلوكي وضبط التوتر، وتم توثيق استقرار الحالة.';

    const recsList = $('#reportRecommendations');
    if (recsList) {
      if (a.recommendations && Array.isArray(a.recommendations) && a.recommendations.length > 0) {
        recsList.innerHTML = a.recommendations.map(r => `
          <li class="flex items-center gap-2">
            <svg class="icon ic-14 text-emerald-600 flex-shrink-0"><use href="#i-check"/></svg>
            <span>${r}</span>
          </li>
        `).join('');
      } else {
        recsList.innerHTML = `
          <li class="flex items-center gap-2">
            <svg class="icon ic-14 text-emerald-600 flex-shrink-0"><use href="#i-check"/></svg>
            <span>الاستمرار في ممارسة تمرين التنفس البطني (4-7-8) مرتين يومياً.</span>
          </li>
          <li class="flex items-center gap-2">
            <svg class="icon ic-14 text-emerald-600 flex-shrink-0"><use href="#i-check"/></svg>
            <span>تدوين سجل الأفكار والمشاعر اليومي في تطبيق ملاذ.</span>
          </li>
          <li class="flex items-center gap-2">
            <svg class="icon ic-14 text-emerald-600 flex-shrink-0"><use href="#i-check"/></svg>
            <span>جلسة المتابعة القادمة بعد أسبوعين لتقييم النتائج.</span>
          </li>
        `;
      }
    }

    openModal('#doctorSessionReportModal');
  }

  // د. فتح نافذة تأكيد حذف الموعد
  function openDeleteModal(apptId) {
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;
    state.pendingActionAppt = a;

    $('#deletePatientName').textContent = a.beneficiary;
    $('#deleteApptDetails').textContent = `${a.date} - ${a.time} (${a.consultType})`;

    openModal('#doctorDeleteModal');
  }

  // هـ. تأكيد حذف الموعد
  function handleConfirmDelete() {
    if (!state.pendingActionAppt) return;
    const id = state.pendingActionAppt.id;
    const name = state.pendingActionAppt.beneficiary;

    state.appointments = state.appointments.filter(a => a.id !== id);
    setStorage(KEYS.APPOINTMENTS, state.appointments);

    closeModal('#doctorDeleteModal');
    state.pendingActionAppt = null;

    renderAppointmentsManager();
    renderUpcomingAppointments(state.calendar.selectedDate);
    renderCalendar();
    renderTodayAppointments();
    showToast(`تم حذف موعد ${name} بنجاح`);
  }

  // و. فتح نافذة إضافة موعد جديد
  window.openNewAppointmentModal = function (suggestedDate) {
    const dateInput = $('#newApptDate');
    if (dateInput) {
      dateInput.value = suggestedDate || state.calendar.selectedDate || '2026-11-07';
      dateInput.min = '2026-11-06';
    }
    openModal('#doctorNewApptModal');
  };

  // ز. حفظ موعد جديد
  function handleNewAppointmentSubmit(e) {
    e.preventDefault();
    const name = $('#newApptPatient')?.value.trim();
    const isoDate = $('#newApptDate')?.value;
    const time = $('#newApptTime')?.value;
    const consultType = $('#newApptConsultType')?.value;
    const sessionType = $('#newApptSessionType')?.value;
    const notes = $('#newApptNotes')?.value.trim();

    if (!name || !isoDate) {
      showToast('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const parts = isoDate.split('-');
    const mIdx = parseInt(parts[1], 10) - 1;
    const dateText = `${parseInt(parts[2], 10)} ${ARABIC_MONTHS[mIdx] || ''} ${parts[0]}`;

    const newAppt = {
      id: 'apt-' + Date.now(),
      beneficiary: name,
      time: time,
      rawTime: time,
      isoDate: isoDate,
      date: isoDate === '2026-11-06' ? 'اليوم - 6 نوفمبر 2026' : dateText,
      consultType: consultType,
      sessionType: sessionType,
      method: 'عن بُعد - اتصال فيديو مشفر عبر المنصة',
      btnColor: 'blue',
      status: 'new',
      statusText: 'جديد',
      isToday: isoDate === '2026-11-06',
      isUpcoming: isoDate > '2026-11-06',
      phone: '05' + Math.floor(10000000 + Math.random() * 90000000),
      notes: notes || 'تمت إضافة الموعد من لوحة تحكم الأخصائي.'
    };

    state.appointments.unshift(newAppt);
    setStorage(KEYS.APPOINTMENTS, state.appointments);

    closeModal('#doctorNewApptModal');
    $('#newApptForm')?.reset();

    renderAppointmentsManager();
    renderUpcomingAppointments(state.calendar.selectedDate);
    renderCalendar();
    showToast(`تمت إضافة موعد جديد للمستفيد ${name} بنجاح ✨`);
  }

  // ---------- تفاصيل الموعد العامة (للصفحة الرئيسية) ----------
  function openAppointmentDetailModal(apptId) {
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;

    $('#detailBeneficiaryName').textContent = a.beneficiary;
    $('#detailApptDate').textContent = a.date;
    $('#detailApptTime').textContent = a.time;
    $('#detailConsultType').textContent = a.consultType;
    $('#detailSessionType').textContent = a.sessionType;
    $('#detailApptStatus').textContent = a.statusText || 'مؤكد';
    $('#detailSessionMethod').textContent = a.method || 'عن بُعد - اتصال فيديو مشفر عبر المنصة';
    $('#detailApptNotes').textContent = a.notes || 'لا توجد ملاحظات إضافية مسجلة لهذا الموعد.';

    const modalStartBtn = $('#modalStartSessionBtn');
    if (modalStartBtn) {
      modalStartBtn.onclick = () => {
        closeModal('#doctorApptDetailModal');
        openLiveSessionModal(a.id);
      };
    }

    openModal('#doctorApptDetailModal');
  }

  // ---------- التبديل بين مشاهد اللوحة الجانبية ----------
  function switchView(viewName) {
    if (!viewName) viewName = 'appointments';
    state.currentView = viewName;

    // تحديث أزرار الشريط الجانبي (العنصر النشط خلفية بيضاء ونصوص زرقاء)
    $$('.doc-nav-link').forEach(btn => {
      const isTarget = btn.dataset.docNav === viewName;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // تبديل المشاهد المعروضة
    $$('.doc-view').forEach(view => {
      view.classList.toggle('is-active', view.id === `view-${viewName}`);
    });

    // إغلاق الشريط الجانبي على شاشات الموبايل
    $('#docSidebar')?.classList.remove('is-open');

    // تشغيل التحديثات بحسب المشهد
    if (viewName === 'home') {
      renderStats();
      renderTodayAppointments($('#docGlobalSearch')?.value || '');
    } else if (viewName === 'appointments') {
      renderCalendar();
      renderUpcomingAppointments(state.calendar.selectedDate);
      renderAppointmentsManager();
    } else if (viewName === 'beneficiaries') {
      renderBeneficiariesList();
    } else if (viewName === 'consultations') {
      renderDoctorChat();
    } else if (viewName === 'profile') {
      syncDoctorProfileUI();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- بدء الجلسة التفاعلية الحية ----------
  function openLiveSessionModal(apptId) {
    const a = state.appointments.find(x => x.id === apptId);
    if (!a) return;
    state.activeSession = a;

    $('#sessionPatientName').textContent = a.beneficiary;
    $('#sessionPatientInitial').textContent = a.beneficiary.charAt(0);
    $('#sessionConsultType').textContent = a.consultType;
    $('#sessionApptTime').textContent = a.time;
    $('#sessionClinicalNotes').value = a.notes ? `الملاحظات السابقة: ${a.notes}\n\nتطورات الجلسة الحالية:\n` : '';

    // تصفير وبدء المؤقت
    state.sessionSeconds = 0;
    updateSessionTimerDisplay();
    clearInterval(state.sessionTimerInterval);
    state.sessionTimerInterval = setInterval(() => {
      state.sessionSeconds++;
      updateSessionTimerDisplay();
    }, 1000);

    openModal('#doctorLiveSessionModal');
    showToast(`بدأت الجلسة الرقمية مع ${a.beneficiary}`);
  }

  function updateSessionTimerDisplay() {
    const timerEl = $('#sessionLiveTimer');
    if (!timerEl) return;
    const sec = state.sessionSeconds;
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    timerEl.textContent = `00:${m}:${s}`;
  }

  function endLiveSession() {
    if (!state.activeSession) return;
    const a = state.activeSession;

    if (confirm(`هل أنت متأكد من رغبتك في إنهاء الجلسة مع المستفيد ${a.beneficiary} وحفظ التقرير؟`)) {
      clearInterval(state.sessionTimerInterval);
      
      const writtenNotes = $('#sessionClinicalNotes')?.value.trim();
      a.status = 'completed';
      a.statusText = 'مكتملة بنجاح';
      a.clinicalReport = writtenNotes || 'تم استكمال الجلسة الاستشارية ومراجعة مؤشرات التعافي بنجاح.';
      a.diagnosis = 'جلسة متابعة سريرية - تم تقييم التقدم وحفظ التوصيات الإكلينيكية.';
      a.recommendations = [
        'الاستمرار في خطة الدعم اليومية وتدوين التحديات والمشاعر.',
        'ممارسة تمارين الاسترخاء وضبط الأفكار المحفزة.',
        'موعد الجلسة القادمة بعد أسبوعين.'
      ];

      setStorage(KEYS.APPOINTMENTS, state.appointments);

      state.stats.completedSessions = (state.stats.completedSessions || 46) + 1;
      state.stats.completionRate = Math.min(100, Math.round((state.stats.completedSessions / state.stats.totalSessionsTarget) * 100));
      if (state.stats.newRequests > 0) state.stats.newRequests--;
      setStorage(KEYS.STATS, state.stats);

      state.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'اكتملت الجلسة بنجاح',
        desc: `تم استكمال جلسة ${a.beneficiary} بنجاح وتوثيق التوصيات.`,
        time: 'الآن',
        unread: true
      });
      setStorage(KEYS.NOTIFS, state.notifications);
      updateNotifBadge();

      closeModal('#doctorLiveSessionModal');
      renderStats();
      renderTodayAppointments();
      renderAppointmentsManager();
      renderUpcomingAppointments(state.calendar.selectedDate);
      showToast('تم إنهاء الجلسة وحفظ التقرير السريري بنجاح ✨');
      state.activeSession = null;
    }
  }

  // ---------- فتح وإغلاق النوافذ المنبثقة العامة ----------
  function openModal(selector) {
    const modal = $(selector);
    if (modal) modal.classList.add('is-open');
  }

  function closeModal(selector) {
    const modal = $(selector);
    if (modal) modal.classList.remove('is-open');
  }

  // ---------- تفاصيل بطاقات الإحصائيات الأربع ----------
  function openStatDetailsModal(statKey) {
    const titleEl = $('#statDetailModalTitle');
    const descEl = $('#statDetailModalDesc');
    const contentEl = $('#statDetailModalContent');

    if (statKey === 'monthAppts') {
      titleEl.innerHTML = '<svg class="icon ic-20 text-primary"><use href="#i-calendar"/></svg><span>تفاصيل مواعيد هذا الشهر</span>';
      descEl.textContent = 'إجمالي المواعيد المجدولة خلال الشهر الحالي مع الأخصائي وتوزيعها.';
      contentEl.innerHTML = `
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-slate-800 border border-line">
            <span class="font-bold">المواعيد المكتملة</span>
            <span class="font-extrabold text-primary">12 جلسة</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-line">
            <span class="font-bold">المواعيد القادمة المؤكدة</span>
            <span class="font-extrabold text-emerald-600">5 جلسات</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-slate-800 border border-line">
            <span class="font-bold">مواعيد أعيدت جدولتها</span>
            <span class="font-extrabold text-rose-500">1 جلسة</span>
          </div>
        </div>
      `;
    } else if (statKey === 'completionRate') {
      titleEl.innerHTML = '<svg class="icon ic-20 text-emerald-600"><use href="#i-check"/></svg><span>معدل إكمال الجلسات</span>';
      descEl.textContent = 'مؤشر التزام المستفيدين وحضور الجلسات في الوقت المحدد.';
      contentEl.innerHTML = `
        <div class="space-y-3 text-sm text-center">
          <div class="p-4 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200">
            <span class="text-3xl font-extrabold text-emerald-600">92%</span>
            <p class="text-xs text-muted mt-1 font-bold">نسبة ممتازة تعكس التزاماً عالياً من المستفيدين وجدوى خطة الدعم.</p>
          </div>
          <p class="text-xs t-body text-start">يتم احتساب النسبة من إجمالي الجلسات المحجوزة مقابل الجلسات التي تم إتمامها بنجاح دون إلغاء متأخر.</p>
        </div>
      `;
    } else if (statKey === 'totalPatients') {
      titleEl.innerHTML = '<svg class="icon ic-20 text-primary"><use href="#i-users"/></svg><span>إجمالي المستفيدين</span>';
      descEl.textContent = 'المستفيدون المسجلون تحت إشرافك السريري في منصة ملاذ.';
      contentEl.innerHTML = `
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-slate-800 border border-line">
            <span class="font-bold">مستفيدون نشطون (متابعة أسبوعية)</span>
            <span class="font-extrabold text-primary">24 مستفيداً</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-line">
            <span class="font-bold">مستفيدون استكملوا مرحلة التعافي</span>
            <span class="font-extrabold text-emerald-600">8 مستفيدين</span>
          </div>
        </div>
      `;
    } else if (statKey === 'newRequests') {
      titleEl.innerHTML = '<svg class="icon ic-20 text-amber-500"><use href="#i-clipboard"/></svg><span>طلبات الحجز الجديدة</span>';
      descEl.textContent = 'المستفيدون الذين طلبوا جلسات أولية بانتظار الاعتماد.';
      contentEl.innerHTML = `
        <div class="space-y-3 text-sm">
          <div class="p-3 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 flex items-center justify-between">
            <span class="font-bold">طلبات جديدة اليوم</span>
            <span class="font-extrabold text-amber-600">5 طلبات</span>
          </div>
          <p class="text-xs text-muted">يمكنك قبول المواعيد أو تعديل الموعد من قسم إدارة المواعيد.</p>
        </div>
      `;
    }

    openModal('#statDetailModal');
  }

  // ---------- تحديث شارة الإشعارات ----------
  function updateNotifBadge() {
    const unread = state.notifications.filter(n => n.unread).length;
    const dot = $('#docNotifDot');
    if (dot) {
      dot.style.display = unread > 0 ? 'block' : 'none';
    }
  }

  function renderNotificationsList() {
    const list = $('#docNotifList');
    if (!list) return;

    if (!state.notifications.length) {
      list.innerHTML = '<div class="p-4 text-center text-xs text-muted">لا توجد إشعارات جديدة حالياً.</div>';
      return;
    }

    list.innerHTML = state.notifications.map(n => `
      <div class="p-2.5 rounded-xl border border-line-soft text-xs ${n.unread ? 'bg-blue-50/50 font-semibold' : ''}">
        <div class="flex items-center justify-between mb-1">
          <h5 class="font-bold text-ink">${n.title}</h5>
          <span class="text-[10px] text-muted">${n.time}</span>
        </div>
        <p class="text-muted leading-relaxed">${n.desc}</p>
      </div>
    `).join('');
  }

  // ---------- المستفيدون في صفحة "المستفيدون" ----------
  const BENEFICIARIES_DIRECTORY = [
    { name: 'أمل السلمي', age: 24, sessions: 3, lastVisit: 'اليوم', status: 'نشط', note: 'خطة علاجية لإدارة نوبات القلق وضغوط الاختبارات.' },
    { name: 'محمد العتيبي', age: 31, sessions: 8, lastVisit: 'اليوم', status: 'ملتزم بمرحلة التعافي', note: 'وصل لليوم 42 من التعافي ويوصى بالاستمرار في كتابة اليوميات.' },
    { name: 'سارة القحطاني', age: 28, sessions: 1, lastVisit: 'اليوم', status: 'جلسة أولية', note: 'تم إجراء التقييم السريري المبدئي وبدء جلسات الدعم النفسي.' },
    { name: 'عبد الرحمن الشمري', age: 29, sessions: 12, lastVisit: 'أمس', status: 'متعافٍ ومتقدم', note: 'مستفيد متميز في مسار التعافي ويستعد لإنهاء البرنامج.' },
    { name: 'فهد المطيري', age: 35, sessions: 6, lastVisit: 'منذ 3 أيام', status: 'نشط', note: 'متابعة دورية لإدارة الضغوط المهنية والتوازن الأسري.' }
  ];

  function renderBeneficiariesList(filter = '') {
    const container = $('#beneficiariesGrid');
    if (!container) return;

    const q = (filter || '').trim().toLowerCase();
    const list = BENEFICIARIES_DIRECTORY.filter(b => !q || b.name.toLowerCase().includes(q) || b.status.toLowerCase().includes(q));

    container.innerHTML = list.map(b => `
      <div class="p-4 rounded-2xl bg-white border border-line shadow-sm flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-primary font-bold grid place-items-center">
              ${b.name.charAt(0)}
            </div>
            <div>
              <h4 class="font-bold text-sm text-ink">${b.name}</h4>
              <span class="text-xs text-muted">${b.age} سنة</span>
            </div>
          </div>
          <span class="doc-chip doc-chip-blue text-[11px]">${b.status}</span>
        </div>
        <p class="text-xs t-body leading-relaxed bg-bg-soft p-2.5 rounded-xl border border-line-soft">${b.note}</p>
        <div class="flex items-center justify-between text-xs pt-2 border-t border-line text-muted">
          <span>الجلسات: <strong>${b.sessions}</strong></span>
          <span>آخر جلسة: <strong>${b.lastVisit}</strong></span>
        </div>
      </div>
    `).join('');
  }

  // ---------- الاستشارات والمحادثات ----------
  function renderDoctorChat() {
    const container = $('#doctorChatBox');
    if (!container) return;
  }

  // ---------- حفظ الملف الشخصي للأخصائي ----------
  function handleDoctorProfileSubmit(e) {
    e.preventDefault();
    const newName = $('#profileDoctorName')?.value.trim();
    if (!newName) {
      showToast('يرجى إدخال اسم الأخصائي.');
      return;
    }

    state.doctor.username = newName;
    state.doctor.title = $('#profileDoctorTitle')?.value.trim() || state.doctor.title;
    state.doctor.license = $('#profileDoctorLicense')?.value.trim() || state.doctor.license;
    state.doctor.phone = $('#profileDoctorPhone')?.value.trim() || state.doctor.phone;
    state.doctor.email = $('#profileDoctorEmail')?.value.trim() || state.doctor.email;
    state.doctor.bio = $('#profileDoctorBio')?.value.trim() || state.doctor.bio;

    setStorage(KEYS.DOCTOR_USER, state.doctor);
    syncDoctorProfileUI();
    showToast('تم حفظ وتحديث بيانات الملف الشخصي بنجاح ✨');
  }

  // ---------- تسجيل الخروج ----------
  function handleLogout() {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة الأخصائي؟')) {
      localStorage.removeItem('maladh:current_role');
      showToast('تم تسجيل الخروج بنجاح.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    }
  }

  // ---------- تهيئة وإعداد الأحداث العامة ----------
  function init() {
    syncDoctorProfileUI();
    renderStats();
    renderTodayAppointments();
    updateNotifBadge();

    // روابط التنقل في الشريط الجانبي
    $$('[data-doc-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.docNav;
        switchView(targetView);
      });
    });

    // زر فتح الملف الشخصي من الهيدر
    $('#doctorProfileHeaderBtn')?.addEventListener('click', () => {
      switchView('profile');
    });

    // روابط إضافة موعد
    $('#topAddApptBtn')?.addEventListener('click', () => {
      openNewAppointmentModal(state.calendar.selectedDate);
    });

    // تفويض أحداث النقر العامة
    document.addEventListener('click', (e) => {
      // 1. أزرار إجراءات جدول المواعيد:
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.preventDefault();
        const action = actionBtn.dataset.action;
        const apptId = actionBtn.dataset.id;
        
        // عرض التقرير للمواعيد المكتملة
        if (action === 'view-report') {
          openSessionReportModal(apptId);
        }
        // تعديل بيانات وحقول الموعد
        else if (action === 'edit') {
          openEditApptModal(apptId);
        }
        // حذف الموعد مع نافذة التأكيد
        else if (action === 'delete') {
          openDeleteModal(apptId);
        }
        // عرض التفاصيل العامة
        else if (action === 'view') {
          openAppointmentDetailModal(apptId);
        }
        return;
      }

      // 2. بدء الجلسة
      const startBtn = e.target.closest('[data-start-session]');
      if (startBtn) {
        e.preventDefault();
        openLiveSessionModal(startBtn.dataset.startSession);
        return;
      }

      // 3. عرض التفاصيل من الصفحة الرئيسية
      const viewBtn = e.target.closest('[data-view-detail]');
      if (viewBtn) {
        e.preventDefault();
        openAppointmentDetailModal(viewBtn.dataset.viewDetail);
        return;
      }

      // 4. تفاصيل بطاقات الإحصائيات
      const statBtn = e.target.closest('[data-stat-modal]');
      if (statBtn) {
        e.preventDefault();
        openStatDetailsModal(statBtn.dataset.statModal);
        return;
      }

      // 5. النقر على يوم في التقويم التفاعلي
      const calCell = e.target.closest('[data-cal-date]');
      if (calCell) {
        e.preventDefault();
        state.calendar.selectedDate = calCell.dataset.calDate;
        renderCalendar();
        renderUpcomingAppointments(state.calendar.selectedDate);
        return;
      }

      // 6. أزرار تبويبات المواعيد الخمسة
      const tabBtn = e.target.closest('[data-appts-tab]');
      if (tabBtn) {
        e.preventDefault();
        const targetTab = tabBtn.dataset.apptsTab;
        state.currentApptsTab = targetTab;

        $$('.doc-tab-btn').forEach(btn => {
          const isTarget = btn.dataset.apptsTab === targetTab;
          btn.classList.toggle('is-active', isTarget);
          btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        renderAppointmentsManager();
        return;
      }

      // 7. أزرار تبديل عرض التقويم (شهري، أسبوعي، يومي)
      const viewSwitchBtn = e.target.closest('[data-cal-view]');
      if (viewSwitchBtn) {
        e.preventDefault();
        const mode = viewSwitchBtn.dataset.calView;
        state.calendar.viewMode = mode;
        $$('[data-cal-view]').forEach(b => b.classList.toggle('is-active', b === viewSwitchBtn));
        const modeNames = { month: 'الشهري', week: 'الأسبوعي', day: 'اليومي' };
        showToast(`تم التبديل إلى العرض ${modeNames[mode] || mode}`);
        return;
      }

      // 8. زر طباعة التقرير الطبي
      const printBtn = e.target.closest('#printReportBtn');
      if (printBtn) {
        e.preventDefault();
        showToast('جاري فتح نافذة طباعة التقرير الطبي...');
        setTimeout(() => {
          window.print();
        }, 300);
        return;
      }

      // 9. إغلاق أي نافذة منبثقة
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        e.preventDefault();
        closeModal(closeBtn.dataset.closeModal);
        return;
      }

      // 10. النقر على خلفية المودال للإغلاق
      if (e.target.classList.contains('doc-modal-overlay')) {
        e.target.classList.remove('is-open');
      }
    });

    // التنقل بين أشهر التقويم
    $('#calPrevMonthBtn')?.addEventListener('click', () => {
      let { year, month } = state.calendar;
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      state.calendar.year = year;
      state.calendar.month = month;
      renderCalendar();
    });

    $('#calNextMonthBtn')?.addEventListener('click', () => {
      let { year, month } = state.calendar;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      state.calendar.year = year;
      state.calendar.month = month;
      renderCalendar();
    });

    // زر "اليوم" في التقويم
    $('#calTodayBtn')?.addEventListener('click', () => {
      state.calendar.year = 2026;
      state.calendar.month = 10;
      state.calendar.selectedDate = '2026-11-06';
      renderCalendar();
      renderUpcomingAppointments('2026-11-06');
      showToast('تمت العودة إلى تاريخ اليوم: 6 نوفمبر 2026');
    });

    // البحث والفلترة في صفحة المواعيد
    $('#apptsSearchInput')?.addEventListener('input', () => {
      renderAppointmentsManager();
    });

    $('#apptsTypeFilter')?.addEventListener('change', () => {
      renderAppointmentsManager();
    });

    // إنهاء الجلسة الحية
    $('#endLiveSessionBtn')?.addEventListener('click', endLiveSession);

    // البحث اللحظي في الهيدر العلوي
    $('#docGlobalSearch')?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (state.currentView === 'home') {
        renderTodayAppointments(val);
      } else if (state.currentView === 'appointments') {
        const localInput = $('#apptsSearchInput');
        if (localInput) localInput.value = val;
        renderAppointmentsManager();
      } else if (state.currentView === 'beneficiaries') {
        renderBeneficiariesList(val);
      }
    });

    // إرسال نماذج المودالات
    $('#editApptFullForm')?.addEventListener('submit', handleEditApptSubmit);
    $('#confirmDeleteApptBtn')?.addEventListener('click', handleConfirmDelete);
    $('#newApptForm')?.addEventListener('submit', handleNewAppointmentSubmit);

    // قائمة الإشعارات
    $('#docNotifBtn')?.addEventListener('click', () => {
      const menu = $('#docNotifMenu');
      if (menu) {
        const isOpen = menu.classList.toggle('is-open');
        if (isOpen) {
          renderNotificationsList();
          state.notifications.forEach(n => n.unread = false);
          setStorage(KEYS.NOTIFS, state.notifications);
          updateNotifBadge();
        }
      }
    });

    // زر الإعدادات
    $('#docSettingsBtn')?.addEventListener('click', () => {
      openModal('#doctorSettingsModal');
    });

    // أزرار قائمة الموبايل
    $('#docMobileToggleBtn')?.addEventListener('click', () => {
      $('#docSidebar')?.classList.toggle('is-open');
    });

    $('#docSidebarCloseBtn')?.addEventListener('click', () => {
      $('#docSidebar')?.classList.remove('is-open');
    });

    // حفظ الملف الشخصي
    $('#doctorProfileForm')?.addEventListener('submit', handleDoctorProfileSubmit);

    // تسجيل الخروج
    $$('[data-doc-logout]').forEach(btn => {
      btn.addEventListener('click', handleLogout);
    });

    // تبديل المظهر
    $$('[data-doc-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.docTheme;
        document.documentElement.setAttribute('data-theme', theme);
        setStorage(KEYS.THEME, theme);
        $$('[data-doc-theme]').forEach(b => b.classList.toggle('btn-solid', b.dataset.docTheme === theme));
        showToast(`تم تفعيل المظهر ${theme === 'dark' ? 'الداكن' : 'الفاتح'}`);
      });
    });

    // استعادة المظهر
    const savedTheme = getStorage(KEYS.THEME, 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);

    // التحقق من الرابط أو التجزئة (Hash) لتحديد المشهد المبدئي
    const hash = window.location.hash.replace('#', '');
    const validViews = ['home', 'appointments', 'beneficiaries', 'consultations', 'reports', 'schedule', 'profile'];
    if (hash && validViews.includes(hash)) {
      switchView(hash);
    } else {
      // المشهد الافتراضي المطلوب: «إدارة المواعيد»
      switchView('appointments');
    }
  }

  // تشغيل عند تحميل DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
