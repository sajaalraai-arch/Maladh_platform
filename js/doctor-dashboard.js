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
    CHAT: 'maladh:doctor_chat_v1',
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
    

    // --- 2. المواعيد القادمة (8 مواعيد) ---
    
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
    
// --- 3. المواعيد الملغاة (2 مواعيد) ---
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
    { id: 'notif-4', title: 'تقييم جديد 5 نجوم', desc: 'حصلت على تقييم 5 نجوم من المستفيدة سارة القحطاني.', time: 'أمس', unread: false },
  ];

  // البيانات الافتراضية لجدول توفر الأخصائية (Doctor Availability Schedule Mock Data)
  const INITIAL_SCHEDULE = {
    days: [
      {
        id: 'saturday',
        name: 'السبت',
        enabled: true,
        periods: [
          { id: 1, startTime: '09:00', endTime: '13:00' },
          { id: 2, startTime: '16:00', endTime: '20:00' }
        ]
      },
      {
        id: 'sunday',
        name: 'الأحد',
        enabled: true,
        periods: [
          { id: 1, startTime: '09:00', endTime: '13:00' },
          { id: 2, startTime: '16:00', endTime: '20:00' }
        ]
      },
      {
        id: 'monday',
        name: 'الاثنين',
        enabled: true,
        periods: [
          { id: 1, startTime: '09:00', endTime: '13:00' },
          { id: 2, startTime: '16:00', endTime: '20:00' }
        ]
      },
      {
        id: 'tuesday',
        name: 'الثلاثاء',
        enabled: true,
        periods: [
          { id: 1, startTime: '09:00', endTime: '13:00' },
          { id: 2, startTime: '16:00', endTime: '20:00' }
        ]
      },
      {
        id: 'wednesday',
        name: 'الأربعاء',
        enabled: true,
        periods: [
          { id: 1, startTime: '09:00', endTime: '13:00' },
          { id: 2, startTime: '16:00', endTime: '20:00' }
        ]
      },
      {
        id: 'thursday',
        name: 'الخميس',
        enabled: false,
        periods: [
          { id: 1, startTime: '09:00', endTime: '14:00' }
        ]
      },
      {
        id: 'friday',
        name: 'الجمعة',
        enabled: false,
        periods: [
          { id: 1, startTime: '16:00', endTime: '20:00' }
        ]
      }
    ],
    settings: {
      sessionDuration: 45,
      breakDuration: 10,
      maxDailySessions: 8,
      minNoticeHours: 2,
      bookingWindowDays: 30
    },
    vacations: [
      {
        id: 'vac-1',
        title: 'إجازة منتصف الفصل الدراسي',
        startDate: '2026-11-20',
        endDate: '2026-11-24',
        notes: 'عطلة رسمية'
      },
      {
        id: 'vac-2',
        title: 'مؤتمر الطب النفسي السريري',
        startDate: '2026-12-05',
        endDate: '2026-12-07',
        notes: 'مشاركة علمية'
      }
    ],
    selectedDate: '2026-11-14',
    modalDate: '2026-11-14',
    dayErrors: {},
    pendingDeleteVacationId: null
  };

  const INITIAL_DOCTOR_CHAT = [
    {
      id: 'amal',
      name: 'أمل السلمي',
      role: 'مستفيدة • جلسات علاجية سلوكية',
      isOnline: true,
      unread: 2,
      lastMsg: 'شكراً جزيلاً دكتورة، أشعر بتحسن كبير.',
      lastTime: '10:24 ص',
      nextSession: 'جلسة اليوم 4:00 م',
      avatar: null,
      monogram: 'أ',
      messages: [
        { id: 1, type: 'beneficiary', text: 'صباح الخير دكتورة، كيف حالك؟', time: '09:15 ص', date: 'اليوم' },
        { id: 2, type: 'doctor', text: 'صباح النور أمل، أنا بخير والحمد لله، كيف حالك؟ كيف كانت ليلتك؟', time: '09:18 ص', date: 'اليوم' },
        { id: 3, type: 'beneficiary', text: 'الحمد لله، نمت بشكل أفضل الليلة. مارست تقنيات التنفس التي علمتيني إياها.', time: '09:22 ص', date: 'اليوم' },
        { id: 4, type: 'doctor', text: 'هذا رائع جداً! أنا سعيدة بهذا التقدم. استمري على هذا المنوال. 🌟', time: '09:25 ص', date: 'اليوم' },
        { id: 5, type: 'beneficiary', text: 'شكراً جزيلاً دكتورة، أشعر بتحسن كبير.', time: '10:24 ص', date: 'اليوم' }
      ]
    },
    {
      id: 'mohammed',
      name: 'محمد العتيبي',
      role: 'مستفيد • مسار التعافي (اليوم 42)',
      isOnline: false,
      unread: 0,
      lastMsg: 'حاضر، شكراً دكتورة سأكون في الموعد.',
      lastTime: 'أمس 8:15 م',
      nextSession: 'جلسة الأحد 11:30 ص',
      avatar: null,
      monogram: 'م',
      messages: [
        { id: 1, type: 'doctor', text: 'مرحباً محمد، تذكير بجلستنا القادمة لمتابعة إدارة المحفزات يوم الأحد.', time: '8:00 م', date: 'أمس' },
        { id: 2, type: 'beneficiary', text: 'حاضر، شكراً دكتورة سأكون في الموعد.', time: '8:15 م', date: 'أمس' }
      ]
    },
    {
      id: 'sara',
      name: 'سارة القحطاني',
      role: 'مستفيدة • اضطراب القلق التكيفي',
      isOnline: true,
      unread: 1,
      lastMsg: 'وصلتني استمارة التقييم دكتورة، سأكملها الليلة.',
      lastTime: 'السبت 6:30 م',
      nextSession: null,
      avatar: null,
      monogram: 'س',
      messages: [
        { id: 1, type: 'doctor', text: 'سارة، أرسلت لك تقييم الجلسة الأخيرة. أرجو مراجعته عند فراغك.', time: '6:00 م', date: 'السبت' },
        { id: 2, type: 'beneficiary', text: 'وصلتني استمارة التقييم دكتورة، سأكملها الليلة.', time: '6:30 م', date: 'السبت' }
      ]
    },

    {
      id: 'moneera',
      name: 'منيرة السبيعي',
      role: 'مستفيدة • جلسة متابعة نفسية',
      isOnline: false,
      unread: 0,
      lastMsg: 'حسناً دكتورة، موعدنا يوم الأربعاء.',
      lastTime: 'الأربعاء 3:00 م',
      nextSession: null,
      avatar: null,
      monogram: 'م',
      messages: [
        { id: 1, type: 'doctor', text: 'منيرة، تم تثبيت موعد المتابعة القادم معنا.', time: '2:45 م', date: 'الأربعاء' },
        { id: 2, type: 'beneficiary', text: 'حسناً دكتورة، موعدنا يوم الأربعاء.', time: '3:00 م', date: 'الأربعاء' }
      ]
    }
  ];

  // الحالة العامة للتطبيق
  let state = {
    doctor: storedDoctor,
    appointments: storedAppts,
    completedBaseCount: 45,
    stats: getStorage(KEYS.STATS, INITIAL_STATS),
    notifications: getStorage(KEYS.NOTIFS, INITIAL_NOTIFICATIONS),
    schedule: getStorage(KEYS.SCHEDULE, INITIAL_SCHEDULE),
    chatConversations: getStorage(KEYS.CHAT, INITIAL_DOCTOR_CHAT),
    chatActiveId: 'amal',
    chatFilter: 'all',
    chatSearch: '',
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
    } else if (viewName === 'schedule') {
      renderScheduleView();
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

      // مزامنة اكتمال الجلسة مع Supabase
      if (window.MaladhDB && window.MaladhDB.appointments && a.id) {
        window.MaladhDB.appointments.updateStatus(a.id, 'completed', a.clinicalReport).catch(e => console.warn(e));
      }

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

  // ---------- الاستشارات والمحادثات للأخصائي ----------
  function getActiveDocConversation() {
    return state.chatConversations.find(c => c.id === state.chatActiveId) || state.chatConversations[0];
  }

  function renderDocConversationsList() {
    const listEl = $('#docConversationsList');
    const badgeEl = $('#docConvCountBadge');
    if (!listEl) return;

    let convs = state.chatConversations || [];
    if (badgeEl) badgeEl.textContent = convs.length;

    // تصفية حسب البحث
    const q = (state.chatSearch || '').trim().toLowerCase();
    if (q) {
      convs = convs.filter(c => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || (c.lastMsg && c.lastMsg.toLowerCase().includes(q)));
    }

    // تصفية حسب التبويب
    if (state.chatFilter === 'unread') {
      convs = convs.filter(c => c.unread > 0);
    } else if (state.chatFilter === 'active') {
      convs = convs.filter(c => c.isOnline);
    }

    if (convs.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-muted text-xs">
          <svg class="icon ic-20 mx-auto mb-2 text-slate-400"><use href="#i-message-square"/></svg>
          <p>لا توجد محادثات تطابق الفلتر المحدد</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = convs.map(c => {
      const isActive = c.id === state.chatActiveId;
      return `
        <button type="button" class="doc-conversation-item ${isActive ? 'is-active' : ''}" data-conv-id="${c.id}" role="tab" aria-selected="${isActive}">
          <div class="doc-conv-avatar-wrap">
            <div class="doc-conv-avatar-monogram">${c.monogram || c.name.charAt(0)}</div>
            ${c.isOnline ? '<span class="doc-conv-online-dot"></span>' : ''}
          </div>
          <div class="doc-conv-body">
            <div class="doc-conv-top-row">
              <span class="doc-conv-name">${c.name}</span>
              <span class="doc-conv-time">${c.lastTime}</span>
            </div>
            <div class="doc-conv-bottom-row">
              <span class="doc-conv-last-msg">${c.lastMsg || 'لا توجد رسائل'}</span>
              ${c.unread > 0 ? `<span class="doc-conv-unread-badge">${c.unread}</span>` : ''}
            </div>
          </div>
        </button>
      `;
    }).join('');

    // ربط النقر
    $$('.doc-conversation-item', listEl).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.convId;
        switchDocConversation(id);
      });
    });
  }

  function renderDocChatMessages(conv) {
    const container = $('#docChatMessagesContainer');
    if (!container || !conv) return;

    if (!conv.messages || conv.messages.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-muted text-xs">
          <svg class="icon ic-24 mx-auto mb-2 text-slate-300"><use href="#i-message-square"/></svg>
          <p>بدأت جلسة المحادثة الطبية الآمنة مع ${conv.name}. يمكنك كتابة أي توجيه علاجي هنا.</p>
        </div>
      `;
      return;
    }

    let html = '';
    let lastDate = '';

    conv.messages.forEach(m => {
      if (m.date && m.date !== lastDate) {
        lastDate = m.date;
        html += `
          <div class="doc-chat-date-separator">
            <span>${m.date}</span>
          </div>
        `;
      }

      const isDoc = m.type === 'doctor';
      const senderName = isDoc ? (state.doctor.username || 'د. سارة العتيبي') : conv.name;

      html += `
        <div class="doc-message-row ${isDoc ? 'is-doctor' : 'is-beneficiary'}">
          <div class="doc-message-avatar-wrap">
            ${isDoc ? `
              <img src="${state.doctor.avatar || 'assets/specialist-sara.jpg'}" alt="الأخصائي" class="doc-message-avatar-img">
            ` : `
              <div class="doc-message-avatar-monogram">${conv.monogram || conv.name.charAt(0)}</div>
            `}
          </div>
          <div class="doc-message-content">
            <div class="doc-message-sender-name">${senderName}</div>
            <div class="doc-message-bubble">
              ${m.attachment ? `
                <div class="doc-message-attachment-box">
                  <svg class="icon ic-16 text-primary flex-shrink-0"><use href="#i-file-text"/></svg>
                  <span class="text-xs font-semibold truncate">${m.attachment.name}</span>
                </div>
              ` : ''}
              <p class="doc-message-text">${m.text}</p>
            </div>
            <div class="doc-message-meta">
              <span class="doc-message-time">${m.time}</span>
              ${isDoc ? `
                <svg class="doc-message-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function renderDocChatWindow(convId) {
    const conv = state.chatConversations.find(c => c.id === convId) || state.chatConversations[0];
    if (!conv) return;

    state.chatActiveId = conv.id;

    // تحديث الهيدر
    const nameEl = $('#docChatHeaderName');
    const roleEl = $('#docChatHeaderRole');
    const monoEl = $('#docChatHeaderMonogram');
    const dotEl = $('#docChatHeaderOnlineDot');
    const statusPill = $('#docChatHeaderStatusPill');
    const statusText = $('#docChatHeaderStatusText');
    const nextSessWrap = $('#docChatNextSessionBadge');
    const nextSessText = $('#docChatNextSessionText');
    const typingAvatar = $('#docTypingAvatar');

    if (nameEl) nameEl.textContent = conv.name;
    if (roleEl) roleEl.textContent = conv.role;
    if (monoEl) monoEl.textContent = conv.monogram || conv.name.charAt(0);
    if (typingAvatar) typingAvatar.textContent = conv.monogram || conv.name.charAt(0);

    if (dotEl) dotEl.style.display = conv.isOnline ? 'block' : 'none';

    if (statusPill && statusText) {
      if (conv.isOnline) {
        statusPill.className = 'doc-chat-online-status-pill is-active';
        statusText.textContent = 'متصلة الآن';
      } else {
        statusPill.className = 'doc-chat-online-status-pill is-offline';
        statusText.textContent = 'غير متصلة حالياً';
      }
    }

    if (nextSessWrap && nextSessText) {
      if (conv.nextSession) {
        nextSessWrap.style.display = 'inline-flex';
        nextSessText.textContent = conv.nextSession;
      } else {
        nextSessWrap.style.display = 'none';
      }
    }

    // تصفير غير المقروء
    conv.unread = 0;
    setStorage(KEYS.CHAT, state.chatConversations);

    // إخفاء مؤشر الكتابة
    const typingRow = $('#docTypingIndicator');
    if (typingRow) typingRow.classList.remove('is-active');

    renderDocChatMessages(conv);
  }

  function switchDocConversation(convId) {
    state.chatActiveId = convId;
    renderDocConversationsList();
    renderDocChatWindow(convId);

    // للموبايل
    document.body.classList.add('doc-mobile-view-chat');
  }

  let isDocChatEventsInitialized = false;

  function initDocChatEvents() {
    if (isDocChatEventsInitialized) return;
    isDocChatEventsInitialized = true;

    // 1. بحث المحادثات
    $('#docConvSearchInput')?.addEventListener('input', (e) => {
      state.chatSearch = e.target.value;
      renderDocConversationsList();
    });

    // 2. فلتر المحادثات
    $$('.doc-conv-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.doc-conv-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.chatFilter = btn.dataset.filter || 'all';
        renderDocConversationsList();
      });
    });

    // 3. إرسال رسالة جديدة من الأخصائي
    $('#docChatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#docChatInput');
      const text = input ? input.value.trim() : '';
      const attachedPill = $('#docAttachedFilePill');
      const hasAttachment = attachedPill && attachedPill.classList.contains('is-visible');
      const attachedName = $('#docAttachedFileName')?.textContent || 'مرفق';

      if (!text && !hasAttachment) return;

      const conv = getActiveDocConversation();
      if (!conv) return;

      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const h12 = hours % 12 || 12;
      const timeStr = `${h12}:${minutes} ${period}`;

      const newMsg = {
        id: Date.now(),
        type: 'doctor',
        text: text,
        time: timeStr,
        date: 'اليوم',
        attachment: hasAttachment ? { name: attachedName } : null
      };

      if (!conv.messages) conv.messages = [];
      conv.messages.push(newMsg);
      conv.lastMsg = text || `مرفق: ${attachedName}`;
      conv.lastTime = timeStr;

      // حفظ
      setStorage(KEYS.CHAT, state.chatConversations);

      // تفريغ الحقول
      if (input) input.value = '';
      if (attachedPill) attachedPill.classList.remove('is-visible');

      renderDocChatMessages(conv);
      renderDocConversationsList();

      // محاكاة رد من المستفيد بعد ثانية ونصف
      simulateBeneficiaryReply(conv);
    });

    // 4. محاكاة رد المستفيد
    function simulateBeneficiaryReply(conv) {
      const typingRow = $('#docTypingIndicator');
      if (typingRow) typingRow.classList.add('is-active');

      const container = $('#docChatMessagesContainer');
      if (container) container.scrollTop = container.scrollHeight;

      setTimeout(() => {
        if (typingRow) typingRow.classList.remove('is-active');

        const replies = [
          'شكراً لك دكتورة على هذا التوجيه، سأطبقه فوراً.',
          'تمام دكتورة، ممتنة جداً لمتابعتك الدقيقة واهتمامك.',
          'حاضر دكتورة، سأسجل ملاحظاتي اليومية كما طلبتِ.',
          'أشعر براحة أكبر الآن، شكراً جزيلاً لك.'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const now = new Date();
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'م' : 'ص';
        const h12 = hours % 12 || 12;
        const timeStr = `${h12}:${minutes} ${period}`;

        conv.messages.push({
          id: Date.now(),
          type: 'beneficiary',
          text: randomReply,
          time: timeStr,
          date: 'اليوم'
        });
        conv.lastMsg = randomReply;
        conv.lastTime = timeStr;

        setStorage(KEYS.CHAT, state.chatConversations);
        if (state.chatActiveId === conv.id) {
          renderDocChatMessages(conv);
        }
        renderDocConversationsList();
      }, 1600);
    }

    // 5. الرموز التعبيرية
    $('#docEmojiBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#docEmojiPopover')?.classList.toggle('is-open');
    });

    $$('.doc-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        const input = $('#docChatInput');
        if (input && emoji) {
          input.value += emoji;
          input.focus();
        }
        $('#docEmojiPopover')?.classList.remove('is-open');
      });
    });

    // 6. المرفقات
    $('#docAttachBtn')?.addEventListener('click', () => {
      $('#docFileInput')?.click();
    });

    $('#docFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const pill = $('#docAttachedFilePill');
        const nameEl = $('#docAttachedFileName');
        if (pill && nameEl) {
          nameEl.textContent = file.name;
          pill.classList.add('is-visible');
        }
      }
    });

    $('#docRemoveAttachBtn')?.addEventListener('click', () => {
      const pill = $('#docAttachedFilePill');
      const input = $('#docFileInput');
      if (pill) pill.classList.remove('is-visible');
      if (input) input.value = '';
    });

    // 7. قائمة الخيارات الإضافية
    $('#docChatOptionsBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#docChatOptionsMenu')?.classList.toggle('is-open');
    });

    $('#docOptClearChat')?.addEventListener('click', () => {
      $('#docChatOptionsMenu')?.classList.remove('is-open');
      const conv = getActiveDocConversation();
      if (!conv) return;
      if (confirm(`هل أنت متأكد من رغبتك في مسح سجل المحادثة مع ${conv.name}؟`)) {
        conv.messages = [];
        conv.lastMsg = '';
        setStorage(KEYS.CHAT, state.chatConversations);
        renderDocChatMessages(conv);
        renderDocConversationsList();
        showToast('تم مسح سجل المحادثة');
      }
    });

    $('#docOptMuteChat')?.addEventListener('click', () => {
      $('#docChatOptionsMenu')?.classList.remove('is-open');
      showToast('تم كتم إشعارات المحادثة مؤقتاً');
    });

    $('#docOptBeneficiaryInfo')?.addEventListener('click', () => {
      $('#docChatOptionsMenu')?.classList.remove('is-open');
      const conv = getActiveDocConversation();
      if (conv) {
        showToast(`ملف المستفيد: ${conv.name} - مسجل في ${conv.role}`);
      }
    });

    // 8. زر الرجوع في الموبايل
    $('#docMobileChatBackBtn')?.addEventListener('click', () => {
      document.body.classList.remove('doc-mobile-view-chat');
    });

    // 9. إغلاق البوب أوفرز عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#docEmojiPopover') && !e.target.closest('#docEmojiBtn')) {
        $('#docEmojiPopover')?.classList.remove('is-open');
      }
      if (!e.target.closest('#docChatOptionsMenu') && !e.target.closest('#docChatOptionsBtn')) {
        $('#docChatOptionsMenu')?.classList.remove('is-open');
      }
    });
  }

  function renderDoctorChat() {
    renderDocConversationsList();
    renderDocChatWindow(state.chatActiveId);
    initDocChatEvents();
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

    // مزامنة الملف الشخصي مع Supabase
    const docId = (state.doctor.id && state.doctor.id !== 'sp1' && state.doctor.id !== 'usr_local')
      ? state.doctor.id
      : '11cea870-41e3-49e4-903c-6a2588520967';

    if (window.MaladhDB && window.MaladhDB.auth) {
      window.MaladhDB.auth.updateProfile(docId, {
        full_name: state.doctor.username,
        phone: state.doctor.phone
      }).catch(e => console.warn('[Supabase Specialist Profile Sync]:', e.message));
    }
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

  // =====================================================================
  // محرك واجهة جدول التوفر للأخصائية (Availability Schedule Controller)
  // =====================================================================

  const DAY_ID_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const DAY_NAMES_AR = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة'
  };

  // تحويل "HH:MM" إلى دقائق
  function timeToMinutes(tStr) {
    if (!tStr) return 0;
    const parts = tStr.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }

  // تحويل دقائق إلى "HH:MM"
  function minutesToTime(mins) {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // تنسيق الوقت إلى صيغة عربية (مثال: 09:00 صباحاً)
  function formatTimeArabic(tStr) {
    if (!tStr) return '';
    const [hStr, mStr] = tStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  }

  // تنسيق التاريخ إلى نص عربي كامل (السبت، 14 نوفمبر 2026)
  function formatDateArabicFull(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][dateObj.getDay()];
    const monthName = ARABIC_MONTHS[m - 1] || '';
    return `${dayName}، ${d} ${monthName} ${y}`;
  }

  // الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
  function getTodayIsoDate() {
    return '2026-11-14'; // تاريخ مرجعي للمنصة
  }

  // حساب إحصائيات جدول التوفر الأربع
  function calculateScheduleStats() {
    const { days, settings } = state.schedule;
    const sessionDuration = parseInt(settings.sessionDuration, 10) || 45;
    const breakDuration = parseInt(settings.breakDuration, 10) || 10;
    const slotStep = sessionDuration + breakDuration;

    let workDaysCount = 0;
    let totalMinutes = 0;
    let totalSlots = 0;

    days.forEach(day => {
      if (day.enabled && Array.isArray(day.periods) && day.periods.length > 0) {
        workDaysCount++;
        let dayMinutes = 0;
        day.periods.forEach(p => {
          const s = timeToMinutes(p.startTime);
          const e = timeToMinutes(p.endTime);
          if (e > s) {
            const span = e - s;
            dayMinutes += span;
            const slotsInPeriod = Math.floor((span + breakDuration) / slotStep);
            totalSlots += Math.max(0, slotsInPeriod);
          }
        });
        totalMinutes += dayMinutes;
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const offDays = 7 - workDaysCount;

    return {
      workDays: workDaysCount,
      totalHours: totalHours,
      slotsCount: totalSlots,
      offDays: offDays
    };
  }

  // تحديث أرقام كروت الإحصائيات الأربع لجدول التوفر
  function renderScheduleStats() {
    const stats = calculateScheduleStats();
    const workDaysEl = $('#statScheduleWorkDays');
    const totalHoursEl = $('#statScheduleTotalHours');
    const slotsEl = $('#statScheduleSlots');
    const offDaysEl = $('#statScheduleOffDays');

    if (workDaysEl) workDaysEl.textContent = stats.workDays;
    if (totalHoursEl) totalHoursEl.textContent = stats.totalHours;
    if (slotsEl) slotsEl.textContent = stats.slotsCount;
    if (offDaysEl) offDaysEl.textContent = stats.offDays;
  }

  // التحقق من صحة الأوقات في كل يوم
  function validateScheduleTimes() {
    state.schedule.dayErrors = {};
    let hasError = false;

    state.schedule.days.forEach(day => {
      if (!day.enabled) return;

      const periods = day.periods || [];
      if (periods.length === 0) {
        state.schedule.dayErrors[day.id] = 'يجب إضافة فترة عمل واحدة على الأقل لهذا اليوم أو تعطيله كعطلة.';
        hasError = true;
        return;
      }

      // فحص أوقات كل فترة
      for (let i = 0; i < periods.length; i++) {
        const p = periods[i];
        const s = timeToMinutes(p.startTime);
        const e = timeToMinutes(p.endTime);

        if (e <= s) {
          state.schedule.dayErrors[day.id] = 'وقت نهاية الدوام يجب أن يكون بعد وقت البداية.';
          hasError = true;
          return;
        }
      }

      // فحص التداخل بين الفترات في نفس اليوم
      if (periods.length > 1) {
        for (let i = 0; i < periods.length; i++) {
          for (let j = i + 1; j < periods.length; j++) {
            const s1 = timeToMinutes(periods[i].startTime);
            const e1 = timeToMinutes(periods[i].endTime);
            const s2 = timeToMinutes(periods[j].startTime);
            const e2 = timeToMinutes(periods[j].endTime);

            if (Math.max(s1, s2) < Math.min(e1, e2)) {
              state.schedule.dayErrors[day.id] = 'توجد فترات عمل متداخلة في هذا اليوم، يرجى تعديل أوقات البدء والانتهاء.';
              hasError = true;
              return;
            }
          }
        }
      }
    });

    return !hasError;
  }

  // رسم بطاقات أيام الأسبوع السبعة
  function renderScheduleDaysList() {
    const container = $('#scheduleDaysContainer');
    if (!container) return;

    validateScheduleTimes();
    const days = state.schedule.days || [];

    container.innerHTML = days.map((day, dIdx) => {
      const isEnabled = day.enabled;
      const periods = day.periods || [];
      const errorMsg = state.schedule.dayErrors[day.id];

      // حساب إجمالي ساعات اليوم
      let dayHours = 0;
      if (isEnabled && periods.length > 0) {
        periods.forEach(p => {
          const s = timeToMinutes(p.startTime);
          const e = timeToMinutes(p.endTime);
          if (e > s) dayHours += (e - s) / 60;
        });
      }
      dayHours = Math.round(dayHours * 10) / 10;

      return `
        <div class="doc-day-card ${!isEnabled ? 'is-disabled' : ''}" data-day-id="${day.id}">
          <!-- ترويسة اليوم -->
          <div class="doc-day-header">
            <div class="doc-day-title-wrap">
              <span class="doc-day-name">${day.name}</span>
              ${isEnabled ? `
                <span class="doc-day-status-pill is-active">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>متاح • ${periods.length} ${periods.length === 1 ? 'فترة' : 'فترات'} (${dayHours} ساعة)</span>
                </span>
              ` : `
                <span class="doc-day-status-pill is-off">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>عطلة أسبوعية</span>
                </span>
              `}
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold ${isEnabled ? 'text-primary' : 'text-muted'}">
                ${isEnabled ? 'تشغيل الدوام' : 'إيقاف (عطلة)'}
              </span>
              <!-- مفتاح التشغيل والإيقاف Toggle -->
              <label class="doc-switch" title="تبديل توفر يوم ${day.name}">
                <input type="checkbox" class="schedule-day-toggle" data-day-id="${day.id}" ${isEnabled ? 'checked' : ''} aria-label="تبديل توفر يوم ${day.name}">
                <span class="doc-switch-slider"></span>
              </label>
            </div>
          </div>

          <!-- محتوى فترات اليوم -->
          ${isEnabled ? `
            <div class="doc-day-slots-wrap">
              ${errorMsg ? `
                <div class="doc-slot-error-msg">
                  <svg class="icon ic-16 flex-shrink-0"><use href="#i-alert-circle"/></svg>
                  <span>${errorMsg}</span>
                </div>
              ` : ''}

              ${periods.map((p, pIdx) => `
                <div class="doc-slot-row" data-period-id="${p.id || pIdx}">
                  <span class="doc-slot-period-tag">
                    <svg class="icon ic-14"><use href="#i-clock"/></svg>
                    <span>فترة ${pIdx + 1}</span>
                  </span>

                  <!-- وقت البدء -->
                  <div class="doc-time-field-wrap">
                    <span class="doc-time-label">من:</span>
                    <input type="time" class="doc-time-input schedule-time-start"
                      data-day-id="${day.id}" data-period-index="${pIdx}" value="${p.startTime}" required aria-label="وقت بداية الفترة ${pIdx + 1}">
                  </div>

                  <span class="text-xs text-muted font-bold">—</span>

                  <!-- وقت النهاية -->
                  <div class="doc-time-field-wrap">
                    <span class="doc-time-label">إلى:</span>
                    <input type="time" class="doc-time-input schedule-time-end"
                      data-day-id="${day.id}" data-period-index="${pIdx}" value="${p.endTime}" required aria-label="وقت نهاية الفترة ${pIdx + 1}">
                  </div>

                  <!-- زر حذف الفترة -->
                  ${periods.length > 1 ? `
                    <button type="button" class="doc-btn-remove-slot schedule-btn-remove-period"
                      data-day-id="${day.id}" data-period-index="${pIdx}" title="حذف هذه الفترة" aria-label="حذف فترة العمل">
                      <svg class="icon ic-16"><use href="#i-trash"/></svg>
                    </button>
                  ` : ''}
                </div>
              `).join('')}

              <!-- زر إضافة فترة عمل إضافية لنفس اليوم -->
              <button type="button" class="doc-btn-add-day-slot schedule-btn-add-day-slot" data-day-id="${day.id}">
                <svg class="icon ic-14"><use href="#i-plus"/></svg>
                <span>إضافة فترة عمل إضافية لهذا اليوم</span>
              </button>
            </div>
          ` : `
            <!-- شريط العطلة عند الإيقاف -->
            <div class="doc-day-off-banner">
              <svg class="icon ic-16 text-muted flex-shrink-0"><use href="#i-coffee"/></svg>
              <span>يوم إجازة أسبوعية مسجل — لا يتم استقبال أي حجوزات أو استشارات في هذا اليوم.</span>
            </div>
          `}
        </div>
      `;
    }).join('');

    attachDayEventListeners();
  }

  // ربط أحداث الأيام والـ Toggles ومربعات الأوقات
  function attachDayEventListeners() {
    // 1. مفاتيح التشغيل والإيقاف (Toggles)
    $$('.schedule-day-toggle').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const dayId = e.target.dataset.dayId;
        const isChecked = e.target.checked;
        const day = state.schedule.days.find(d => d.id === dayId);
        if (day) {
          day.enabled = isChecked;
          // إذا لم يكن لديه فترات عند التفعيل، نضع فترة افتراضية
          if (isChecked && (!day.periods || day.periods.length === 0)) {
            day.periods = [{ id: 1, startTime: '09:00', endTime: '13:00' }];
          }
          renderScheduleDaysList();
          renderScheduleStats();
          renderQuickPreview(state.schedule.selectedDate);
          showToast(`تم ${isChecked ? 'تفعيل واستقبال الحجوزات ليوم' : 'تعطيل واعتماد يوم'} ${day.name}`);
        }
      });
    });

    // 2. تغيير أوقات البداية
    $$('.schedule-time-start').forEach(input => {
      input.addEventListener('change', (e) => {
        const { dayId, periodIndex } = e.target.dataset;
        const day = state.schedule.days.find(d => d.id === dayId);
        if (day && day.periods && day.periods[periodIndex]) {
          day.periods[periodIndex].startTime = e.target.value;
          renderScheduleStats();
          renderQuickPreview(state.schedule.selectedDate);
          validateScheduleTimes();
          renderScheduleDaysList();
        }
      });
    });

    // 3. تغيير أوقات النهاية
    $$('.schedule-time-end').forEach(input => {
      input.addEventListener('change', (e) => {
        const { dayId, periodIndex } = e.target.dataset;
        const day = state.schedule.days.find(d => d.id === dayId);
        if (day && day.periods && day.periods[periodIndex]) {
          day.periods[periodIndex].endTime = e.target.value;
          renderScheduleStats();
          renderQuickPreview(state.schedule.selectedDate);
          validateScheduleTimes();
          renderScheduleDaysList();
        }
      });
    });

    // 4. حذف فترة معينة
    $$('.schedule-btn-remove-period').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.schedule-btn-remove-period');
        const { dayId, periodIndex } = targetBtn.dataset;
        const day = state.schedule.days.find(d => d.id === dayId);
        if (day && day.periods && day.periods.length > 1) {
          day.periods.splice(parseInt(periodIndex, 10), 1);
          renderScheduleDaysList();
          renderScheduleStats();
          renderQuickPreview(state.schedule.selectedDate);
          showToast(`تم حذف فترة العمل من يوم ${day.name}`);
        }
      });
    });

    // 5. زر إضافة فترة أخرى لليوم نفسه
    $$('.schedule-btn-add-day-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.schedule-btn-add-day-slot');
        const dayId = targetBtn.dataset.dayId;
        const day = state.schedule.days.find(d => d.id === dayId);
        if (day) {
          // حساب وقت مناسب للفترة الجديدة (مثلاً بعد آخر فترة بساعتين)
          const lastPeriod = day.periods[day.periods.length - 1];
          let newStart = '16:00';
          let newEnd = '20:00';
          if (lastPeriod) {
            const lastEndMin = timeToMinutes(lastPeriod.endTime);
            if (lastEndMin + 120 < 1440) {
              newStart = minutesToTime(lastEndMin + 60);
              newEnd = minutesToTime(Math.min(1410, lastEndMin + 240));
            }
          }
          day.periods.push({
            id: Date.now(),
            startTime: newStart,
            endTime: newEnd
          });
          renderScheduleDaysList();
          renderScheduleStats();
          renderQuickPreview(state.schedule.selectedDate);
          showToast(`تمت إضافة فترة عمل ثانية ليوم ${day.name}`);
        }
      });
    });
  }

  // رسم قائمة الإجازات المسجلة
  function renderScheduleVacationsList() {
    const listEl = $('#scheduleVacationsList');
    const badgeEl = $('#scheduleVacationsCountBadge');
    if (!listEl) return;

    const vacations = state.schedule.vacations || [];
    if (badgeEl) badgeEl.textContent = `${vacations.length} إجازات مسجلة`;

    if (vacations.length === 0) {
      listEl.innerHTML = `
        <div class="doc-vacations-empty">
          <div class="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <svg class="icon ic-20"><use href="#i-coffee"/></svg>
          </div>
          <h4 class="font-bold text-sm text-ink mb-1">لا توجد إجازات مسجلة حالياً</h4>
          <p class="text-xs text-muted mb-3">يمكنك إضافة إجازاتك الرسمية أو السنوية لحجب مواعيد الحجز فيها تلقائياً.</p>
          <button type="button" class="btn btn-solid btn-sm" id="emptyAddVacationBtn">
            <svg class="icon ic-14"><use href="#i-plus"/></svg>
            <span>إضافة إجازة الآن</span>
          </button>
        </div>
      `;
      $('#emptyAddVacationBtn')?.addEventListener('click', () => openVacationModal());
      return;
    }

    const todayStr = getTodayIsoDate();

    listEl.innerHTML = vacations.map(v => {
      // حساب الأيام وحالة الإجازة
      const sDate = new Date(v.startDate);
      const eDate = new Date(v.endDate);
      const diffDays = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

      let statusBadge = '<span class="doc-vacation-badge is-upcoming">قادمة</span>';
      if (todayStr >= v.startDate && todayStr <= v.endDate) {
        statusBadge = '<span class="doc-vacation-badge is-active">جارية الآن</span>';
      } else if (todayStr > v.endDate) {
        statusBadge = '<span class="doc-vacation-badge is-past">منتهية</span>';
      }

      return `
        <div class="doc-vacation-card" data-vacation-id="${v.id}">
          <div class="doc-vacation-info">
            <div class="flex items-center gap-2">
              <span class="doc-vacation-title">${v.title}</span>
              ${statusBadge}
            </div>
            <div class="doc-vacation-dates">
              <svg class="icon ic-14 text-muted"><use href="#i-calendar"/></svg>
              <span>من ${v.startDate} إلى ${v.endDate} (${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'})</span>
            </div>
            ${v.notes ? `<p class="text-[11px] text-muted italic">${v.notes}</p>` : ''}
          </div>

          <div class="doc-vacation-actions">
            <button type="button" class="doc-table-btn doc-btn-outline-blue py-1 px-2.5 text-xs schedule-edit-vacation-btn"
              data-vacation-id="${v.id}" title="تعديل بيانات الإجازة">
              <svg class="icon ic-14"><use href="#i-edit"/></svg>
              <span>تعديل</span>
            </button>
            <button type="button" class="doc-table-btn doc-btn-remove-slot py-1 px-2 text-xs schedule-delete-vacation-btn"
              data-vacation-id="${v.id}" title="حذف الإجازة">
              <svg class="icon ic-14"><use href="#i-trash"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // ربط أزرار التعديل والحذف
    $$('.schedule-edit-vacation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openVacationModal(btn.dataset.vacationId);
      });
    });

    $$('.schedule-delete-vacation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openDeleteVacationConfirmModal(btn.dataset.vacationId);
      });
    });
  }

  // فتح نافذة إضافة / تعديل إجازة
  function openVacationModal(vacationId = null) {
    const titleEl = $('#scheduleVacationModalTitle');
    const idInput = $('#vacationEditId');
    const nameInput = $('#vacationTitle');
    const startInput = $('#vacationStartDate');
    const endInput = $('#vacationEndDate');
    const notesInput = $('#vacationNotes');

    if (vacationId) {
      const v = (state.schedule.vacations || []).find(x => x.id === vacationId);
      if (v) {
        if (titleEl) titleEl.textContent = 'تعديل الإجازة المسجلة';
        if (idInput) idInput.value = v.id;
        if (nameInput) nameInput.value = v.title;
        if (startInput) startInput.value = v.startDate;
        if (endInput) endInput.value = v.endDate;
        if (notesInput) notesInput.value = v.notes || '';
      }
    } else {
      if (titleEl) titleEl.textContent = 'إضافة إجازة أو عطلة جديدة';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (startInput) startInput.value = '2026-11-20';
      if (endInput) endInput.value = '2026-11-22';
      if (notesInput) notesInput.value = '';
    }

    openModal('#scheduleVacationModal');
  }

  // حفظ نموذج الإجازة
  function handleVacationFormSubmit(e) {
    e.preventDefault();
    const id = $('#vacationEditId')?.value;
    const title = $('#vacationTitle')?.value.trim();
    const startDate = $('#vacationStartDate')?.value;
    const endDate = $('#vacationEndDate')?.value;
    const notes = $('#vacationNotes')?.value.trim();

    if (!title || !startDate || !endDate) {
      showToast('يرجى ملء جميع الحقول المطلوبة للإجازة');
      return;
    }

    if (endDate < startDate) {
      showToast('خطأ: تاريخ نهاية الإجازة يجب أن يكون مساوياً أو بعد تاريخ البداية');
      return;
    }

    if (!state.schedule.vacations) state.schedule.vacations = [];

    if (id) {
      // تعديل
      const idx = state.schedule.vacations.findIndex(x => x.id === id);
      if (idx !== -1) {
        state.schedule.vacations[idx] = { id, title, startDate, endDate, notes };
        showToast('تم تعديل الإجازة وتحديث جدول الحجوزات بنجاح');
      }
    } else {
      // إضافة جديدة
      state.schedule.vacations.push({
        id: `vac-${Date.now()}`,
        title,
        startDate,
        endDate,
        notes
      });
      showToast('تمت إضافة الإجازة وحجب الفترات المشمولة بنجاح');
    }

    closeModal('#scheduleVacationModal');
    setStorage(KEYS.SCHEDULE, state.schedule);
    renderScheduleVacationsList();
    renderScheduleStats();
    renderQuickPreview(state.schedule.selectedDate);
    if ($('#scheduleDetailPreviewModal')?.classList.contains('is-open')) {
      renderModalDetailedSlots(state.schedule.modalDate);
    }
  }

  // فتح نافذة تأكيد حذف الإجازة
  function openDeleteVacationConfirmModal(vacationId) {
    const v = (state.schedule.vacations || []).find(x => x.id === vacationId);
    if (!v) return;
    state.schedule.pendingDeleteVacationId = vacationId;
    const nameEl = $('#deleteVacationNameDisplay');
    if (nameEl) nameEl.textContent = v.title;
    openModal('#scheduleConfirmDeleteVacationModal');
  }

  // تنفيذ حذف الإجازة بعد التأكيد
  function executeDeleteVacation() {
    const id = state.schedule.pendingDeleteVacationId;
    if (!id) return;

    state.schedule.vacations = (state.schedule.vacations || []).filter(x => x.id !== id);
    state.schedule.pendingDeleteVacationId = null;
    closeModal('#scheduleConfirmDeleteVacationModal');
    setStorage(KEYS.SCHEDULE, state.schedule);
    renderScheduleVacationsList();
    renderScheduleStats();
    renderQuickPreview(state.schedule.selectedDate);
    if ($('#scheduleDetailPreviewModal')?.classList.contains('is-open')) {
      renderModalDetailedSlots(state.schedule.modalDate);
    }
    showToast('تم حذف الإجازة وإعادة إتاحة الفترات للحجز');
  }

  // تحديث مدخلات ونصوص إعدادات الجلسات
  function syncScheduleSettingsUI() {
    const s = state.schedule.settings || {};
    const sessionDurEl = $('#settingSessionDuration');
    const breakDurEl = $('#settingBreakDuration');
    const maxDailyEl = $('#settingMaxDailySessions');
    const minNoticeEl = $('#settingMinNoticeHours');
    const bookingWinEl = $('#settingBookingWindowDays');

    if (sessionDurEl && s.sessionDuration) sessionDurEl.value = s.sessionDuration;
    if (breakDurEl && s.breakDuration) breakDurEl.value = s.breakDuration;
    if (maxDailyEl && s.maxDailySessions) maxDailyEl.value = s.maxDailySessions;
    if (minNoticeEl && s.minNoticeHours) minNoticeEl.value = s.minNoticeHours;
    if (bookingWinEl && s.bookingWindowDays) bookingWinEl.value = s.bookingWindowDays;

    updateScheduleSettingsSummary();
  }

  // تحديث نص الملخص الذكي لإعدادات الجلسات
  function updateScheduleSettingsSummary() {
    const sessionDur = $('#settingSessionDuration')?.value || 45;
    const breakDur = $('#settingBreakDuration')?.value || 10;
    const maxDaily = $('#settingMaxDailySessions')?.value || 8;
    const minNotice = $('#settingMinNoticeHours')?.value || 2;
    const summaryEl = $('#scheduleSettingsSummaryText');

    if (summaryEl) {
      summaryEl.textContent = `وفق إعداداتك: كل جلسة مدتها ${sessionDur} دقيقة تليها ${breakDur} دقائق استراحة، بحد أقصى ${maxDaily} جلسات يومياً، وتتطلب مهلة حجز مسبقة لا تقل عن ${minNotice} ساعات.`;
    }
  }

  // توليد الفترات الزمنية لتاريخ محدد بناءً على جدول العمل والإجازات والمحجوز
  function generateSlotsForDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayIndex = dateObj.getDay(); // 0: Sunday, 6: Saturday
    const dayId = DAY_ID_MAP[dayIndex];
    const dayConfig = (state.schedule.days || []).find(x => x.id === dayId);

    // 1. فحص الإجازات المسجلة
    const vacations = state.schedule.vacations || [];
    const activeVacation = vacations.find(v => dateStr >= v.startDate && dateStr <= v.endDate);
    if (activeVacation) {
      return {
        status: 'vacation',
        reason: `إجازة مسجلة: ${activeVacation.title}`,
        slots: []
      };
    }

    // 2. فحص هل اليوم معطل
    if (!dayConfig || !dayConfig.enabled) {
      return {
        status: 'day_off',
        reason: 'يوم عطلة أسبوعية - الأخصائية غير متاحة لاستقبال الحجوزات',
        slots: []
      };
    }

    // 3. فحص هل اليوم لديه فترات عمل
    const periods = dayConfig.periods || [];
    if (periods.length === 0) {
      return {
        status: 'no_periods',
        reason: 'لم يتم تحديد فترات عمل لهذا اليوم',
        slots: []
      };
    }

    // 4. توليد الفترات بناءً على مدة الجلسة والاستراحة
    const sessionDuration = parseInt($('#settingSessionDuration')?.value || state.schedule.settings.sessionDuration, 10) || 45;
    const breakDuration = parseInt($('#settingBreakDuration')?.value || state.schedule.settings.breakDuration, 10) || 10;
    const maxDaily = parseInt($('#settingMaxDailySessions')?.value || state.schedule.settings.maxDailySessions, 10) || 8;
    const slotStep = sessionDuration + breakDuration;

    // استخراج المواعيد المحجوزة مسبقاً في نفس اليوم من `state.appointments`
    const bookedApptsOnDate = (state.appointments || []).filter(a => a.isoDate === dateStr && a.status !== 'cancelled');
    const bookedRawTimes = bookedApptsOnDate.map(a => a.rawTime);

    // إضافة بعض الأوقات المحجوزة التجريبية لتاريخ 2026-11-14 في حال خلوه حتى تظهر الواجهة حية
    if (dateStr === '2026-11-14') {
      bookedRawTimes.push('10:00', '17:00');
    } else if (dateStr === '2026-11-15') {
      bookedRawTimes.push('11:00', '18:00');
    }

    let slots = [];

    periods.forEach((period, pIdx) => {
      const pStart = timeToMinutes(period.startTime);
      const pEnd = timeToMinutes(period.endTime);

      let currentMin = pStart;
      while (currentMin + sessionDuration <= pEnd && slots.length < maxDaily) {
        const slotStartStr = minutesToTime(currentMin);
        const slotEndStr = minutesToTime(currentMin + sessionDuration);

        // هل هذه الفترة محجوزة؟
        const isBooked = bookedRawTimes.some(bt => {
          if (!bt) return false;
          const bMin = timeToMinutes(bt);
          return Math.abs(bMin - currentMin) < sessionDuration;
        });

        // تصنيف الفترة صباحية أو مسائية
        const isMorning = currentMin < 720; // قبل 12:00 ظهراً

        slots.push({
          timeStr: slotStartStr,
          endTimeStr: slotEndStr,
          formatted: formatTimeArabic(slotStartStr),
          formattedRange: `${formatTimeArabic(slotStartStr)} – ${formatTimeArabic(slotEndStr)}`,
          isAvailable: !isBooked,
          isBooked: isBooked,
          isMorning: isMorning,
          periodIndex: pIdx + 1
        });

        currentMin += slotStep;
      }
    });

    return {
      status: slots.length > 0 ? 'available' : 'no_slots',
      reason: slots.length > 0 ? '' : 'لا توجد فترات عمل متاحة',
      slots: slots
    };
  }

  // رسم المعاينة السريعة في الصفحة
  function renderQuickPreview(dateStr) {
    if (!dateStr) dateStr = state.schedule.selectedDate || '2026-11-14';
    state.schedule.selectedDate = dateStr;

    // تحديث نص التاريخ المعروض
    const displayEl = $('#scheduleSelectedDateDisplay');
    const hiddenPicker = $('#scheduleHiddenDatePicker');
    if (displayEl) displayEl.textContent = formatDateArabicFull(dateStr);
    if (hiddenPicker) hiddenPicker.value = dateStr;

    const gridEl = $('#scheduleQuickSlotsGrid');
    if (!gridEl) return;

    const res = generateSlotsForDate(dateStr);

    if (res.status === 'vacation') {
      gridEl.innerHTML = `
        <div class="doc-slots-empty-state">
          <div class="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <svg class="icon ic-22"><use href="#i-coffee"/></svg>
          </div>
          <h4 class="font-bold text-sm text-ink mb-1">إجازة رسمية مسجلة</h4>
          <p class="text-xs text-muted max-w-sm mx-auto mb-2">${res.reason}</p>
          <span class="doc-badge-pill is-off">جميع الفترات محجوبة ومغلقة</span>
        </div>
      `;
      return;
    }

    if (res.status === 'day_off') {
      gridEl.innerHTML = `
        <div class="doc-slots-empty-state">
          <div class="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
            <svg class="icon ic-22"><use href="#i-moon"/></svg>
          </div>
          <h4 class="font-bold text-sm text-ink mb-1">يوم عطلة أسبوعية</h4>
          <p class="text-xs text-muted max-w-sm mx-auto mb-2">الأخصائية غير متاحة في هذا اليوم وفق جدول ساعات الدوام المعتمد.</p>
          <span class="doc-badge-pill is-off">لا توجد فترات متاحة للحجز في هذا اليوم</span>
        </div>
      `;
      return;
    }

    if (!res.slots || res.slots.length === 0) {
      gridEl.innerHTML = `
        <div class="doc-slots-empty-state">
          <div class="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-2">
            <svg class="icon ic-22"><use href="#i-calendar"/></svg>
          </div>
          <h4 class="font-bold text-sm text-ink mb-1">لا توجد فترات عمل محددة</h4>
          <p class="text-xs text-muted mb-2">يرجى مراجعة ساعات بداية ونهاية الدوام وإعدادات الجلسات لتوليد الفترات.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = res.slots.map(slot => {
      if (slot.isAvailable) {
        return `
          <div class="doc-slot-chip is-avail" title="فترة متاحة للحجز">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="doc-slot-chip-time font-extrabold">${slot.formatted}</span>
            </div>
            <span class="doc-slot-chip-status">متاح</span>
          </div>
        `;
      } else {
        return `
          <div class="doc-slot-chip is-booked" title="فترة محجوزة مسبقاً">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span class="doc-slot-chip-time line-through text-slate-500">${slot.formatted}</span>
            </div>
            <span class="doc-slot-chip-status">محجوز</span>
          </div>
        `;
      }
    }).join('');
  }

  // رسم وتوليد الفترات في نافذة المعاينة الكبيرة (Modal Detailed Preview)
  function renderModalDetailedSlots(dateStr) {
    if (!dateStr) dateStr = state.schedule.modalDate || state.schedule.selectedDate || '2026-11-14';
    state.schedule.modalDate = dateStr;

    const displayEl = $('#modalPreviewDateDisplay');
    const hiddenPicker = $('#modalPreviewHiddenDatePicker');
    const statusBadge = $('#modalPreviewDayStatusBadge');
    const statsBadge = $('#modalPreviewStatsBadge');
    const container = $('#modalPreviewSlotsContainer');

    if (displayEl) displayEl.textContent = formatDateArabicFull(dateStr);
    if (hiddenPicker) hiddenPicker.value = dateStr;

    if (!container) return;

    const res = generateSlotsForDate(dateStr);

    if (res.status === 'vacation') {
      if (statusBadge) {
        statusBadge.className = 'doc-badge-pill is-off';
        statusBadge.textContent = 'إجازة مسجلة';
      }
      if (statsBadge) statsBadge.textContent = '0 فترات متاحة';

      container.innerHTML = `
        <div class="doc-slots-empty-state">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <svg class="icon ic-24"><use href="#i-coffee"/></svg>
          </div>
          <h4 class="font-bold text-base text-ink mb-1">${res.reason}</h4>
          <p class="text-xs text-muted max-w-md mx-auto mb-3">
            لن يتمكن أي مستفيد من حجز موعد في هذا التاريخ نظراً لتسجيل إجازة مسبقة.
          </p>
        </div>
      `;
      return;
    }

    if (res.status === 'day_off') {
      if (statusBadge) {
        statusBadge.className = 'doc-badge-pill is-off';
        statusBadge.textContent = 'عطلة أسبوعية';
      }
      if (statsBadge) statsBadge.textContent = '0 فترات متاحة';

      container.innerHTML = `
        <div class="doc-slots-empty-state">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
            <svg class="icon ic-24"><use href="#i-moon"/></svg>
          </div>
          <h4 class="font-bold text-base text-ink mb-1">لا توجد فترات متاحة للحجز في هذا اليوم</h4>
          <p class="text-xs text-muted max-w-md mx-auto mb-3">
            هذا اليوم معطل في جدول أوقات العمل الأسبوعي. يمكنك تفعيله من قائمة «أيام وساعات العمل» في الواجهة الرئيسية.
          </p>
        </div>
      `;
      return;
    }

    const availableSlots = res.slots.filter(s => s.isAvailable);
    const bookedSlots = res.slots.filter(s => s.isBooked);

    if (statusBadge) {
      statusBadge.className = 'doc-badge-pill is-avail';
      statusBadge.textContent = 'يوم عمل متاح للحجز';
    }
    if (statsBadge) {
      statsBadge.textContent = `${availableSlots.length} فترات متاحة • ${bookedSlots.length} محجوزة`;
    }

    const morningSlots = res.slots.filter(s => s.isMorning);
    const eveningSlots = res.slots.filter(s => !s.isMorning);

    container.innerHTML = `
      <!-- الفترات الصباحية -->
      ${morningSlots.length > 0 ? `
        <div class="mb-4">
          <div class="doc-preview-section-title">
            <svg class="icon ic-18 text-amber-500"><use href="#i-sun"/></svg>
            <span>الفترات الصباحية (قبل الظهر)</span>
          </div>
          <div class="doc-modal-slots-grid">
            ${morningSlots.map(slot => `
              <div class="doc-slot-chip ${slot.isAvailable ? 'is-avail' : 'is-booked'}">
                <div>
                  <div class="doc-slot-chip-time font-extrabold">${slot.formatted}</div>
                  <div class="text-[11px] text-muted">${slot.formattedRange}</div>
                </div>
                <span class="doc-slot-chip-status">${slot.isAvailable ? 'متاح للحجز' : 'محجوز'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- الفترات المسائية -->
      ${eveningSlots.length > 0 ? `
        <div>
          <div class="doc-preview-section-title">
            <svg class="icon ic-18 text-indigo-500"><use href="#i-moon"/></svg>
            <span>الفترات المسائية (بعد الظهر والمساء)</span>
          </div>
          <div class="doc-modal-slots-grid">
            ${eveningSlots.map(slot => `
              <div class="doc-slot-chip ${slot.isAvailable ? 'is-avail' : 'is-booked'}">
                <div>
                  <div class="doc-slot-chip-time font-extrabold">${slot.formatted}</div>
                  <div class="text-[11px] text-muted">${slot.formattedRange}</div>
                </div>
                <span class="doc-slot-chip-status">${slot.isAvailable ? 'متاح للحجز' : 'محجوز'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  // فتح نافذة المعاينة الكبيرة
  function openDetailedSchedulePreviewModal(dateStr) {
    if (!dateStr) dateStr = state.schedule.selectedDate || '2026-11-14';
    state.schedule.modalDate = dateStr;
    renderModalDetailedSlots(dateStr);
    openModal('#scheduleDetailPreviewModal');
  }

  // فتح نافذة تأكيد حفظ التغييرات
  function openScheduleSaveConfirmModal() {
    if (!validateScheduleTimes()) {
      renderScheduleDaysList();
      showToast('يرجى تصحيح أخطاء أوقات الدوام الموضحة باللون الأحمر قبل الحفظ');
      return;
    }

    const stats = calculateScheduleStats();
    const sessionDur = $('#settingSessionDuration')?.value || 45;
    const breakDur = $('#settingBreakDuration')?.value || 10;

    const daysEl = $('#confirmModalWorkDays');
    const hoursEl = $('#confirmModalTotalHours');
    const rulesEl = $('#confirmModalSessionRules');

    if (daysEl) daysEl.textContent = `${stats.workDays} أيام أسبوعياً`;
    if (hoursEl) hoursEl.textContent = `${stats.totalHours} ساعة / أسبوعياً`;
    if (rulesEl) rulesEl.textContent = `${sessionDur} دقيقة (+${breakDur} د استراحة)`;

    openModal('#scheduleConfirmSaveModal');
  }

  // تنفيذ حفظ جدول التوفر في LocalStorage
  function executeScheduleSave() {
    // قراءة قيم الإعدادات وتحديثها
    state.schedule.settings = {
      sessionDuration: parseInt($('#settingSessionDuration')?.value, 10) || 45,
      breakDuration: parseInt($('#settingBreakDuration')?.value, 10) || 10,
      maxDailySessions: parseInt($('#settingMaxDailySessions')?.value, 10) || 8,
      minNoticeHours: parseInt($('#settingMinNoticeHours')?.value, 10) || 2,
      bookingWindowDays: parseInt($('#settingBookingWindowDays')?.value, 10) || 30
    };

    setStorage(KEYS.SCHEDULE, state.schedule);
    closeModal('#scheduleConfirmSaveModal');

    // مزامنة جدول التوفر مع Supabase
    const docId = (state.doctor.id && state.doctor.id !== 'sp1' && state.doctor.id !== 'usr_local')
      ? state.doctor.id
      : '11cea870-41e3-49e4-903c-6a2588520967';

    if (window.MaladhDB && window.MaladhDB.schedule) {
      window.MaladhDB.schedule.save(docId, {
        days: state.schedule.days,
        settings: state.schedule.settings
      }).catch(e => console.warn('[Supabase Schedule Sync]:', e.message));
    }

    renderScheduleStats();
    renderQuickPreview(state.schedule.selectedDate);
    updateScheduleSettingsSummary();
    showToast('تم حفظ جدول التوفر بنجاح');
  }

  // تهيئة وعرض واجهة جدول التوفر بالكامل
  function renderScheduleView() {
    renderScheduleStats();
    renderScheduleDaysList();
    syncScheduleSettingsUI();
    renderScheduleVacationsList();
    renderQuickPreview(state.schedule.selectedDate || '2026-11-14');
  }

  // إعداد الأحداث الخاصة بواجهة جدول التوفر
  function initScheduleEvents() {
    // 1. أزرار حفظ التغييرات
    $('#scheduleHeaderSaveBtn')?.addEventListener('click', openScheduleSaveConfirmModal);
    $('#scheduleSaveSettingsBtn')?.addEventListener('click', openScheduleSaveConfirmModal);
    $('#executeScheduleSaveBtn')?.addEventListener('click', executeScheduleSave);

    // 2. أزرار معاينة الجدول الكبيرة
    $('#scheduleHeaderPreviewBtn')?.addEventListener('click', () => openDetailedSchedulePreviewModal(state.schedule.selectedDate));
    $('#scheduleDetailedModalBtn')?.addEventListener('click', () => openDetailedSchedulePreviewModal(state.schedule.selectedDate));

    // 3. زر إضافة فترة عمل إضافية من رأس بطاقة الدوام
    $('#scheduleAddPeriodBtn')?.addEventListener('click', () => {
      openModal('#scheduleQuickAddPeriodModal');
    });

    // 4. نموذج إضافة فترة عمل سريعة
    $('#scheduleQuickAddPeriodForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dayId = $('#quickAddDaySelect')?.value;
      const startTime = $('#quickAddStartTime')?.value;
      const endTime = $('#quickAddEndTime')?.value;
      const errBox = $('#quickAddPeriodError');

      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        if (errBox) {
          errBox.textContent = 'وقت نهاية الفترة يجب أن يكون بعد وقت بدايتها.';
          errBox.classList.remove('hidden');
        }
        return;
      }

      const day = state.schedule.days.find(d => d.id === dayId);
      if (day) {
        day.enabled = true;
        if (!day.periods) day.periods = [];

        // فحص التداخل
        const isOverlap = day.periods.some(p => {
          const s1 = timeToMinutes(p.startTime);
          const e1 = timeToMinutes(p.endTime);
          const s2 = timeToMinutes(startTime);
          const e2 = timeToMinutes(endTime);
          return Math.max(s1, s2) < Math.min(e1, e2);
        });

        if (isOverlap) {
          if (errBox) {
            errBox.textContent = 'هذه الفترة تتداخل مع فترة عمل أخرى موجودة في نفس اليوم.';
            errBox.classList.remove('hidden');
          }
          return;
        }

        day.periods.push({
          id: Date.now(),
          startTime,
          endTime
        });

        closeModal('#scheduleQuickAddPeriodModal');
        if (errBox) errBox.classList.add('hidden');
        renderScheduleDaysList();
        renderScheduleStats();
        renderQuickPreview(state.schedule.selectedDate);
        showToast(`تمت إضافة فترة العمل ليوم ${day.name} بنجاح`);
      }
    });

    // 5. زر إضافة إجازة جديدة
    $('#scheduleAddVacationBtn')?.addEventListener('click', () => openVacationModal());
    $('#scheduleVacationForm')?.addEventListener('submit', handleVacationFormSubmit);
    $('#executeDeleteVacationBtn')?.addEventListener('click', executeDeleteVacation);

    // 6. تفاعل تغيير إعدادات الجلسات (تحديث المعاينة والملخص فورياً)
    ['settingSessionDuration', 'settingBreakDuration', 'settingMaxDailySessions', 'settingMinNoticeHours', 'settingBookingWindowDays'].forEach(id => {
      $(`#${id}`)?.addEventListener('change', () => {
        updateScheduleSettingsSummary();
        renderScheduleStats();
        renderQuickPreview(state.schedule.selectedDate);
        if ($('#scheduleDetailPreviewModal')?.classList.contains('is-open')) {
          renderModalDetailedSlots(state.schedule.modalDate);
        }
      });
    });

    // 7. شريط التنقل بالتاريخ في الصفحة
    $('#schedulePrevDayBtn')?.addEventListener('click', () => {
      const cur = state.schedule.selectedDate || '2026-11-14';
      const [y, m, d] = cur.split('-').map(Number);
      const prevDate = new Date(y, m - 1, d - 1);
      const iso = prevDate.toISOString().split('T')[0];
      renderQuickPreview(iso);
    });

    $('#scheduleNextDayBtn')?.addEventListener('click', () => {
      const cur = state.schedule.selectedDate || '2026-11-14';
      const [y, m, d] = cur.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 1);
      const iso = nextDate.toISOString().split('T')[0];
      renderQuickPreview(iso);
    });

    $('#scheduleTodayBtn')?.addEventListener('click', () => {
      renderQuickPreview(getTodayIsoDate());
      showToast('تم الانتقال إلى تاريخ اليوم');
    });

    $('#scheduleDatePickerTriggerBtn')?.addEventListener('click', () => {
      const picker = $('#scheduleHiddenDatePicker');
      if (picker && typeof picker.showPicker === 'function') {
        picker.showPicker();
      } else {
        picker?.focus();
      }
    });

    $('#scheduleHiddenDatePicker')?.addEventListener('change', (e) => {
      if (e.target.value) {
        renderQuickPreview(e.target.value);
      }
    });

    // 8. شريط التنقل بالتاريخ في نافذة المعاينة الكبيرة (Modal)
    $('#modalPreviewPrevDayBtn')?.addEventListener('click', () => {
      const cur = state.schedule.modalDate || '2026-11-14';
      const [y, m, d] = cur.split('-').map(Number);
      const prevDate = new Date(y, m - 1, d - 1);
      const iso = prevDate.toISOString().split('T')[0];
      renderModalDetailedSlots(iso);
    });

    $('#modalPreviewNextDayBtn')?.addEventListener('click', () => {
      const cur = state.schedule.modalDate || '2026-11-14';
      const [y, m, d] = cur.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 1);
      const iso = nextDate.toISOString().split('T')[0];
      renderModalDetailedSlots(iso);
    });

    $('#modalPreviewTodayBtn')?.addEventListener('click', () => {
      renderModalDetailedSlots(getTodayIsoDate());
    });

    $('#modalPreviewDatePickerTrigger')?.addEventListener('click', () => {
      const picker = $('#modalPreviewHiddenDatePicker');
      if (picker && typeof picker.showPicker === 'function') {
        picker.showPicker();
      } else {
        picker?.focus();
      }
    });

    $('#modalPreviewHiddenDatePicker')?.addEventListener('change', (e) => {
      if (e.target.value) {
        renderModalDetailedSlots(e.target.value);
      }
    });
  }

  // ---------- مزامنة بيانات الأخصائي الحية مع Supabase ----------
  async function syncDoctorWithSupabase() {
    if (!window.MaladhDB) return;
    try {
      const docUser = getStorage(KEYS.DOCTOR_USER, null);
      const specialistId = (docUser && docUser.id && docUser.id !== 'sp1' && docUser.id !== 'usr_local')
        ? docUser.id
        : '11cea870-41e3-49e4-903c-6a2588520967';

      // 1. مزامنة الملف الشخصي والترخيص
      if (window.MaladhDB.auth) {
        const profile = await window.MaladhDB.auth.getProfile(specialistId);
        if (profile) {
          state.doctor.username = profile.full_name || state.doctor.username;
          state.doctor.email = profile.email || state.doctor.email;
          state.doctor.phone = profile.phone || state.doctor.phone;
          setStorage(KEYS.DOCTOR_USER, state.doctor);
          syncDoctorProfileUI();
        }
      }

      // 2. مزامنة المواعيد وجدول اليوم
      if (window.MaladhDB.appointments) {
        const appts = await window.MaladhDB.appointments.getAll({ role: 'specialist', userId: specialistId });
        if (appts && appts.length > 0) {
          state.appointments = appts.map(a => ({
            id: a.id,
            patientName: (a.beneficiary && a.beneficiary.full_name) || a.patientName || 'مستفيد',
            patientPhone: (a.beneficiary && a.beneficiary.phone) || a.patientPhone || '05XXXXXXXX',
            date: a.appointment_date,
            isoDate: a.appointment_date,
            time: a.appointment_time,
            rawTime: a.appointment_time,
            type: a.type || 'عن بُعد',
            status: a.status,
            notes: a.notes || ''
          }));
          setStorage(KEYS.APPOINTMENTS, state.appointments);

      // مزامنة اكتمال الجلسة مع Supabase
      if (window.MaladhDB && window.MaladhDB.appointments && a.id) {
        window.MaladhDB.appointments.updateStatus(a.id, 'completed', a.clinicalReport).catch(e => console.warn(e));
      }
          renderStats();
          renderTodayAppointments();
        }
      }

      // 3. مزامنة جدول التوفر
      if (window.MaladhDB.schedule) {
        const sched = await window.MaladhDB.schedule.get(specialistId);
        if (sched && sched.days && sched.days.length > 0) {
          state.schedule.days = sched.days;
          if (sched.settings) state.schedule.settings = sched.settings;
          if (sched.vacations) state.schedule.vacations = sched.vacations;
          setStorage(KEYS.SCHEDULE, state.schedule);
          renderScheduleStats();
          renderScheduleDaysList();
        }
      }
    } catch (err) {
      console.warn('[Specialist Portal] Supabase sync notice:', err.message);
    }
  }

  // ---------- تهيئة وإعداد الأحداث العامة ----------
  function init() {
    syncDoctorProfileUI();
    renderStats();
    renderTodayAppointments();
    updateNotifBadge();
    syncDoctorWithSupabase();

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
    $$('[data-doc-logout], #doctorSidebarLogoutBtn').forEach(btn => {
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

    // ربط أحداث واجهة جدول التوفر
    initScheduleEvents();

    // إغلاق النوافذ المنبثقة بمفتاح Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModalEl = $('.doc-modal-overlay.is-open');
        if (openModalEl) {
          openModalEl.classList.remove('is-open');
        }
      }
    });

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
