/* =====================================================================
   ملاذ | Maladh — محرك واجهات المستفيد (Beneficiary Portal Logic)
   JavaScript نقي 100% بدون أي مكتبات خارجية
   ===================================================================== */

(function () {
  'use strict';

  // ---------- مفاتيح التخزين المحلي (LocalStorage) ----------
  const KEYS = {
    USER: 'maladh:user',
    PREFS: 'maladh:prefs',
    APPOINTMENTS: 'maladh:beneficiary_appts',
    MULTI_CHATS: 'maladh:multi_chats',
    NOTIFS: 'maladh:beneficiary_notifs',
    RECOVERY: 'maladh:beneficiary_recovery',
    MOOD: 'maladh:beneficiary_mood'
  };

  // ---------- الأدوات المساعدة ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function getStorage(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  function showToast(msg) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMessageText(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  function getUserDisplayName(fullName) {
    if (!fullName) return 'المستفيد';
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2 && (parts[0] === 'عبد' || parts[0] === 'أبو' || parts[0] === 'ابن')) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0] || fullName;
  }

  function getCurrentArabicTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  }

  function formatArabicDate(dateStr) {
    if (!dateStr) return '1 أكتوبر 2025';
    if (typeof dateStr === 'object') {
      if (dateStr.formattedDate) return dateStr.formattedDate;
      if (dateStr.date) return dateStr.date;
    }
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12) {
          return `${d} ${months[m]} ${y}`;
        }
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ---------- البيانات الأولية للمستفيد (Mock Data) ----------
  const initialUser = getStorage(KEYS.USER, null) || {
    username: 'مستفيد',
    email: '',
    phone: '',
    age: '',
    recoveryStart: '2024-09-15',
    dailySavings: 100,
    emergencyContact: '',
    incognito: true
  };

  const INITIAL_APPOINTMENTS = [
    {
      id: 'apt-1',
      day: 'السبت',
      date: '8 نوفمبر 2025',
      rawDate: '2025-11-08',
      time: '05:00 مساءً',
      status: 'confirmed',
      statusText: 'موعد مؤكد',
      specialistId: 'sara',
      specialistName: 'د. سارة العتيبي',
      specialistRole: 'أخصائية نفسية - علاج معرفي سلوكي',
      specialistPhoto: 'assets/specialist-sara.jpg',
      sessionTitle: 'جلسة استشارية نفسية',
      type: 'عن بُعد',
      notes: 'جلسة متابعة دورية لليقظة الذهنية والتحكم في محفزات التوتر والضغوط اليومية.'
    },
    {
      id: 'apt-2',
      day: 'الاثنين',
      date: '10 نوفمبر 2025',
      rawDate: '2025-11-10',
      time: '04:00 مساءً',
      status: 'pending',
      statusText: 'قيد الانتظار',
      specialistId: 'ahmed',
      specialistName: 'د. أحمد البلوي',
      specialistRole: 'استشاري دعم وإرشاد نفسي وسلوكي',
      specialistPhoto: 'assets/specialist-ahmed.jpg',
      sessionTitle: 'جلسة دعم وإرشاد',
      type: 'عن بُعد',
      notes: 'جلسة إرشادية حول تعزيز العادات الإيجابية والتخطيط للمستقبل.'
    },
    {
      id: 'apt-past-1',
      day: 'الخميس',
      date: '23 أكتوبر 2025',
      rawDate: '2025-10-23',
      time: '06:00 مساءً',
      status: 'completed',
      statusText: 'مكتمل',
      specialistId: 'sara',
      specialistName: 'د. سارة العتيبي',
      specialistRole: 'أخصائية نفسية',
      specialistPhoto: 'assets/specialist-sara.jpg',
      sessionTitle: 'جلسة استشارية نفسية',
      type: 'عن بُعد',
      notes: 'مناقشة أساليب التعامل مع القلق وضغوط العمل.',
      summary: 'تمت مراجعة خطة الرعاية الذاتية. المستفيد يبدي التزاماً ملحوظاً ويُوصى بالاستمرار في كتابة اليوميات.'
    },
    {
      id: 'apt-past-2',
      day: 'الأحد',
      date: '12 أكتوبر 2025',
      rawDate: '2025-10-12',
      time: '04:30 مساءً',
      status: 'cancelled',
      statusText: 'ملغي',
      specialistId: 'ahmed',
      specialistName: 'د. أحمد البلوي',
      specialistRole: 'استشاري دعم وإرشاد',
      specialistPhoto: 'assets/specialist-ahmed.jpg',
      sessionTitle: 'جلسة دعم وإرشاد',
      type: 'عن بُعد',
      notes: 'تم إلغاء الموعد بناءً على طلب المستفيد لظروف طارئة.',
      summary: 'تم إشعار الأخصائي بالإلغاء وإعادة فتح التوقيت في جدول المواعيد.'
    },
    {
      id: 'apt-past-3',
      day: 'الأربعاء',
      date: '1 أكتوبر 2025',
      rawDate: '2025-10-01',
      time: '05:00 مساءً',
      status: 'no_show',
      statusText: 'لم يتم الحضور',
      specialistId: 'noura',
      specialistName: 'د. نورة القحطاني',
      specialistRole: 'استشارية الدعم النفسي والأسري',
      specialistPhoto: 'assets/service-counseling.jpg',
      sessionTitle: 'جلسة تقييم نفسي أولي',
      type: 'عن بُعد',
      notes: 'تعذر حضور الجلسة بسبب خلل في الاتصال بالإنترنت.',
      summary: 'تم التواصل مع المستفيد لإعادة جدولة الجلسة في موعد مناسب آخر.'
    }
  ];

  const INITIAL_MULTI_CHATS = {
    sara: {
      id: 'sara',
      name: 'د. سارة العتيبي',
      role: 'أخصائية نفسية',
      avatar: 'assets/specialist-sara.jpg',
      isOnline: true,
      unreadCount: 1,
      time: 'اليوم 10:24 ص',
      messages: [
        {
          id: 'msg-s1',
          sender: 'user',
          text: 'السلام عليكم دكتورة،\nأشعر بالقلق والتوتر مؤخراً، ماذا تنصحيني؟',
          time: '10:20 ص',
          status: 'read'
        },
        {
          id: 'msg-s2',
          sender: 'specialist',
          text: 'وعليكم السلام،\nمن الطبيعي أن تشعر بالقلق أحياناً يا عبد الرحمن.\nلنبدأ معاً ببعض التمارين البسيطة للاسترخاء،\nوأنا هنا دائماً لمساعدتك ❤️',
          time: '10:23 ص'
        }
      ],
      autoReplies: [
        'أشكرك على مشاركتك الصادقة معي يا عبد الرحمن. خذ الآن شهيقاً عميقاً لـ 4 ثوانٍ واحبس النفس ثانيتين ثم ازفر ببطء، وسنواصل خطوتنا التالية معاً بكل طمأنينة 🌸',
        'مشاعرك طبيعية جداً ومقدرة يا عبد الرحمن. تذكر أن القلق فكرة عابرة ولا تمثّل حقيقتك، ونحن نحقق تقدماً رائعاً في مسار تعافيك 🕊️',
        'ممتاز جداً! تدوين أفكارك عند الشعور بالتوتر يساعد كثيراً في تفريغ شحنة الدماغ وتهدئة الجهاز العصبي، استمر في هذا الوعي الرائع 🤍'
      ]
    },
    noura: {
      id: 'noura',
      name: 'د. نورة القحطاني',
      role: 'أخصائية نفسية',
      avatar: 'assets/service-counseling.jpg',
      isOnline: false,
      unreadCount: 0,
      time: 'أمس 8:15 م',
      messages: [
        {
          id: 'msg-n1',
          sender: 'user',
          text: 'مساء الخير دكتورة نورة، أود التأكد من موعد جلستنا الإرشادية القادمة لمتابعة التمارين السلوكية.',
          time: 'أمس 07:45 م',
          status: 'read'
        },
        {
          id: 'msg-n2',
          sender: 'specialist',
          text: 'أهلاً بك يا عبد الرحمن. موعدنا مؤكد بإذن الله يوم الثلاثاء الساعة 5:00 مساءً عبر الجلسة الافتراضية المشفرة. استمر في تطبيق جدول الامتنان اليومي ✨',
          time: 'أمس 08:15 م'
        }
      ],
      autoReplies: [
        'أهلاً عبد الرحمن، تسعدني متابعتك المستمرة. سأراجع جدول التمارين ونناقش المحاور بالتفصيل في جلستنا القادمة.',
        'وعليكم السلام ورحمة الله. خطتك الإرشادية تسير بشكل متوازن جداً، حافظ على هذا الزخم الإيجابي 🌿'
      ]
    },
    'support-team': {
      id: 'support-team',
      name: 'فريق الدعم',
      role: 'مساعد الدعم الفني',
      avatar: null,
      isOnline: true,
      unreadCount: 0,
      time: 'الأحد 5:30 م',
      messages: [
        {
          id: 'msg-t1',
          sender: 'user',
          text: 'مرحباً، أود التأكد من تفعيل أعلى معايير الخصوصية والتشفير التام لبيانات الجلسات الخاصة بي.',
          time: 'الأحد 05:15 م',
          status: 'read'
        },
        {
          id: 'msg-t2',
          sender: 'specialist',
          text: 'مرحباً بك يا عبد الرحمن في منصة ملاذ. نؤكد لك أن جميع المحادثات والاتصالات محمية بتشفير طبي شامل (End-to-End Encryption)، ولا يمكن لأي طرف ثالث الاطلاع عليها أبداً. نحن في خدمتك دائماً.',
          time: 'الأحد 05:30 م'
        }
      ],
      autoReplies: [
        'مرحباً بك يا عبد الرحمن. تم استلام استفسارك بنجاح وسيقوم أحد ممثلي الدعم الفني بالرد الفوري لمساعدتك.',
        'نحن هنا دائماً لضمان راحتك وسلاسة تجربتك في منصة ملاذ. هل تحتاج لأي مساعدة إضافية بخصوص حسابك؟'
      ]
    }
  };

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'تذكير بموعد استشارتك القادمة',
      desc: 'لديك جلسة فيديو مع د. سارة العريفي يوم الجمعة القادم في تمام الساعة 06:00 مساءً.',
      time: 'منذ ساعتين',
      read: false,
      type: 'calendar'
    },
    {
      id: 'notif-2',
      title: 'محطة إنجاز جديدة في رحلة التعافي!',
      desc: 'تهانينا! لقد حققت اليوم 142 يوماً من التعافي والالتزام بمسارك الصحي.',
      time: 'منذ 5 ساعات',
      read: false,
      type: 'award'
    },
    {
      id: 'notif-3',
      title: 'رسالة دعم جديدة من الأخصائي',
      desc: 'أرسلت د. سارة العريفي رسالة تفقدية في المحادثة السرية الخاصة بك.',
      time: 'أمس',
      read: true,
      type: 'message'
    }
  ];

  const SPECIALISTS_LIST = [
    {
      id: 'sara',
      name: 'د. سارة العريفي',
      title: 'أخصائية في علم النفس العلاجي والعلاج المعرفي السلوكي',
      qualification: 'ماجستير علم النفس العيادي - جامعة الملك سعود',
      experience: 'أكثر من 8 سنوات من الخبرة الإكلينيكية',
      photo: 'assets/specialist-sara.jpg',
      rating: '4.9',
      reviewsCount: 148,
      specialty: 'counseling',
      specialtyName: 'العلاج المعرفي السلوكي (CBT)',
      tags: ['القلق والتوتر', 'الاكتئاب', 'اضطرابات التكيف', 'جلسات أسبوعية'],
      slots: ['04:00 م', '05:30 م', '06:00 م', '08:30 م']
    },
    {
      id: 'ahmed',
      name: 'د. أحمد السقاف',
      title: 'استشاري دعم التعافي من الإدمان وإعادة التأهيل النفسي',
      qualification: 'دكتوراه في الإرشاد النفسي وعلاج الإدمان',
      experience: 'أكثر من 10 سنوات من الخبرة المتخصصة',
      photo: 'assets/specialist-ahmed.jpg',
      rating: '4.95',
      reviewsCount: 210,
      specialty: 'recovery',
      specialtyName: 'دعم التعافي من الإدمان',
      tags: ['برامج التعافي', 'الوقاية من الانتكاسة', 'التأهيل السلوكي', 'دعم الخطوات'],
      slots: ['03:30 م', '04:30 م', '07:00 م', '09:00 م']
    },
    {
      id: 'noura',
      name: 'د. نورة القحطاني',
      title: 'أخصائية استشارات أسرية ودعم صدمات الفقد والضغوط',
      qualification: 'ماجستير الإرشاد النفسي والأسري',
      experience: 'أكثر من 7 سنوات',
      photo: 'assets/service-counseling.jpg',
      rating: '4.88',
      reviewsCount: 92,
      specialty: 'family',
      specialtyName: 'الدعم الأسري والعلاقات',
      tags: ['الاستشارات الأسرية', 'صدمات الحياة', 'العلاقات الداعمة'],
      slots: ['05:00 م', '06:30 م', '08:00 م']
    }
  ];

  // الاقتباسات التحفيزية (5 رسائل ملهمة ومفعمة بالحيوية والتفاؤل)
  const DAILY_QUOTES = [
    { quote: '«الشجاعة لا تعني ألا تخاف، بل تعني أن تواصل التقدم رغم الخوف. أنت تصنع فارقاً حقيقياً في حياتك اليوم.»', author: 'فريق الإرشاد والدعم في منصة ملاذ' },
    { quote: '«أعظم انتصار في الحياة هو أن تعيد بناء ذاتك من جديد كل صباح بكل حب وصبر وتفاؤل.»', author: 'د. سارة العريفي - أخصائية علم النفس العلاجي' },
    { quote: '«لا تقارن بدايتك بمواسم حصاد الآخرين؛ كل خطوة تخطوها بوعي اليوم هي بذرة الغد الأجمل.»', author: 'د. أحمد السقاف - استشاري دعم التعافي' },
    { quote: '«التعافي ليس مجرد وجهة نصل إليها، بل هو أسلوب حياة يومي مليء بالكرامة والحرية والسلام الداخلي.»', author: 'حكمة ملهمة في رحلة التعافي' },
    { quote: '«كل نفس عميق تأخذه بوعي يمنحك فرصة جديدة لصناعة التوازن، أنت أقوى مما تظن وأقرب مما تتخيل.»', author: 'د. نورة القحطاني - استشارية الدعم النفسي' }
  ];

  // البيانات الأولية لرحلة التعافي (42 يوماً من أصل 60 يوماً = 70% وتوفير 4,800 ريال)
  const INITIAL_RECOVERY = {
    startDate: '2025-10-01',
    targetDays: 60,
    dailySpending: 114.2857,
    manualDays: 42
  };

  const storedAppts = getStorage(KEYS.APPOINTMENTS, null);
  const initialAppts = (storedAppts && storedAppts.length && storedAppts.some(a => a.id === 'apt-1' || a.id === 'apt-2'))
    ? storedAppts
    : INITIAL_APPOINTMENTS;

  // ---------- الحالة العامة للوحة التحكم ----------
  let state = {
    user: initialUser,
    recovery: getStorage(KEYS.RECOVERY, INITIAL_RECOVERY),
    appointments: initialAppts,
    multiChats: getStorage(KEYS.MULTI_CHATS, INITIAL_MULTI_CHATS),
    notifications: getStorage(KEYS.NOTIFS, INITIAL_NOTIFICATIONS),
    currentView: 'home',
    bookingSpecialist: null,
    quoteIdx: 0,
    recoveryQuoteIdx: 0,
    activeChatId: 'sara',
    selectedFile: null
  };

  // ---------- إدارة اللوحات المنبثقة (الإعدادات / الإشعارات / قائمة الهاتف) ----------
  const PANELS = {
    settings: { btn: $('#settingsBtn'), el: $('#settingsCard') },
    notif:    { btn: $('#notifBtn'),    el: $('#notifCard') },
    menu:     { btn: $('#menuBtn'),     el: $('#mobileMenu') }
  };

  function closePanels(except) {
    for (const name in PANELS) {
      if (name === except) continue;
      const p = PANELS[name];
      if (p && p.el) {
        p.el.classList.remove('is-open');
        if (p.btn && p.btn.hasAttribute('aria-expanded')) {
          p.btn.setAttribute('aria-expanded', 'false');
        }
      }
    }
    const menuIcon = $('#menuIcon use');
    if (menuIcon && PANELS.menu && PANELS.menu.el) {
      menuIcon.setAttribute('href', PANELS.menu.el.classList.contains('is-open') ? '#i-x' : '#i-menu');
    }
  }

  function togglePanel(name) {
    const p = PANELS[name];
    if (!p || !p.el) return;
    const open = !p.el.classList.contains('is-open');
    closePanels(open ? name : null);
    p.el.classList.toggle('is-open', open);
    if (p.btn && p.btn.hasAttribute('aria-expanded')) {
      p.btn.setAttribute('aria-expanded', String(open));
    }
    const menuIcon = $('#menuIcon use');
    if (menuIcon && PANELS.menu && PANELS.menu.el) {
      menuIcon.setAttribute('href', PANELS.menu.el.classList.contains('is-open') ? '#i-x' : '#i-menu');
    }
    if (open && name === 'notif') {
      renderNotifications();
    }
  }

  // مستمعات النقر للوحات
  document.addEventListener('click', (e) => {
    const pBtn = e.target.closest('[data-panel-btn]');
    if (pBtn) {
      e.stopPropagation();
      togglePanel(pBtn.dataset.panelBtn);
      return;
    }

    if (e.target.closest('[data-close-panel]')) {
      closePanels();
      return;
    }

    if (!e.target.closest('.pop, .drop, [data-panel-btn]')) {
      closePanels();
    }
  });

  // ---------- إدارة التنقل وعرض المشاهد (Router) ----------
  function getCurrentPageName() {
    const p = window.location.pathname.toLowerCase();
    if (p.endsWith('support.html')) return 'support';
    if (p.endsWith('appointments.html')) return 'appointments';
    if (p.endsWith('recovery.html')) return 'recovery';
    if (p.endsWith('consultations.html')) return 'consultations';
    if (p.endsWith('profile.html')) return 'profile';
    return 'dashboard';
  }

  function switchView(viewName) {
    const currentPage = getCurrentPageName();
    if (!viewName) {
      viewName = (currentPage !== 'dashboard') ? currentPage : 'home';
    }

    const target = $(`#view-${viewName}`);
    if (!target) {
      // المشهد غير موجود في الصفحة الحالية: نوجه المتصفح للصفحة المستقلة
      if (viewName === 'support' && currentPage !== 'support') {
        window.location.href = 'support.html';
        return;
      }
      if (viewName === 'appointments' && currentPage !== 'appointments') {
        window.location.href = 'appointments.html';
        return;
      }
      if (viewName === 'profile' && currentPage !== 'profile') {
        window.location.href = 'profile.html';
        return;
      }
      if (viewName === 'home' && currentPage !== 'dashboard') {
        window.location.href = 'dashboard.html';
        return;
      }
      if (currentPage !== 'dashboard') {
        window.location.href = `dashboard.html#${viewName}`;
        return;
      }
      viewName = 'home';
    }

    state.currentView = viewName;
    if (currentPage === 'dashboard') {
      window.location.hash = viewName;
    }

    // إخفاء كل المشاهد وإظهار المشهد المطلوب
    $$('.dash-view').forEach(v => v.classList.remove('is-active'));
    const activeView = $(`#view-${viewName}`);
    if (activeView) activeView.classList.add('is-active');

    // تحديث روابط النافبار العلوي والقائمة المنسدلة
    $$('.nav-link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.nav === viewName);
    });
    $$('.mobile-link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.nav === viewName);
    });

    // تمييز زر المستخدم إن كان المشهد الحالي هو الملف الشخصي
    const userBtn = $('#userProfileBtn');
    if (userBtn) {
      userBtn.classList.toggle('ring-2', viewName === 'profile');
      userBtn.classList.toggle('ring-sky-400', viewName === 'profile');
    }

    // إغلاق أي لوحة منبثقة أو قائمة مفتوحة
    closePanels();

    // تحديث عنوان الصفحة ديناميكياً
    const VIEW_TITLES = {
      home: 'ملاذ | لوحة تحكم المستفيد',
      consultations: 'ملاذ | نخبة الأخصائيين النفسيين',
      recovery: 'ملاذ | رحلة التعافي وحاسبة الادخار',
      appointments: 'ملاذ | مواعيدي واستشاراتي',
      support: 'ملاذ | الدعم الخاص والمحادثة السرية',
      profile: 'ملاذ | الملف الشخصي للمستفيد'
    };
    if (VIEW_TITLES[viewName]) {
      document.title = VIEW_TITLES[viewName];
    }

    // تشغيل التحديثات الخاصة بالمشهد
    if (viewName === 'recovery') updateRecoveryStats();
    if (viewName === 'appointments') renderAppointments();
    if (viewName === 'profile') renderUserData();
    if (viewName === 'support') {
      renderConversationList($('#convSearchInput')?.value || '');
      renderChat(state.activeChatId);
      scrollChatToBottom();
    } else {
      document.body.classList.remove('mobile-view-chat');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ظل شريط التنقل عند التمرير مثل الصفحة الرئيسية تماماً
  const siteHeader = $('#siteHeader');
  window.addEventListener('scroll', () => {
    if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ربط جميع أزرار وروابط التنقل
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      const targetNav = navBtn.dataset.nav;
      const currentPage = getCurrentPageName();

      if (targetNav === 'support' && currentPage !== 'support') {
        window.location.href = 'support.html';
        return;
      }
      if (targetNav === 'appointments' && currentPage !== 'appointments') {
        window.location.href = 'appointments.html';
        return;
      }
      if (targetNav === 'profile' && currentPage !== 'profile') {
        window.location.href = 'profile.html';
        return;
      }
      if (targetNav === 'home' && currentPage !== 'dashboard') {
        window.location.href = 'dashboard.html';
        return;
      }
      if ((targetNav === 'consultations' || targetNav === 'recovery') && currentPage !== 'dashboard') {
        window.location.href = `dashboard.html#${targetNav}`;
        return;
      }

      const targetEl = $(`#view-${targetNav}`);
      if (targetEl) {
        e.preventDefault();
        switchView(targetNav);
      }
    }
  });

  // ---------- بيانات المستخدم والترحيب ----------
  function renderUserData() {
    const u = state.user;
    const displayName = getUserDisplayName(u.username);
    if ($('#userNameHeading')) $('#userNameHeading').textContent = displayName;
    if ($('#dashUserBadge')) $('#dashUserBadge').textContent = displayName;
    if ($('#moodGreetingHeading')) $('#moodGreetingHeading').textContent = `كيف تشعر اليوم يا ${displayName}؟`;
    if ($('#headerAvatarText')) $('#headerAvatarText').textContent = (u.username || 'م').charAt(0);

    // بطاقة الملف الشخصي
    if ($('#profileDisplayName')) $('#profileDisplayName').textContent = u.username;
    if ($('#profileDisplayEmail')) $('#profileDisplayEmail').textContent = u.email || 'لا يوجد بريد مسجل';
    if ($('#profileUsername')) $('#profileUsername').value = u.username || '';
    if ($('#profileEmail')) $('#profileEmail').value = u.email || '';
    if ($('#profilePhone')) $('#profilePhone').value = u.phone || '';
    if ($('#profileAge')) $('#profileAge').value = u.age || '';
    if ($('#profileRecoveryDate')) $('#profileRecoveryDate').value = u.recoveryStart || '';
    if ($('#profileEmergency')) $('#profileEmergency').value = u.emergencyContact || '';

    if ($('#profileRecoveryDaysDisplay')) {
      const days = getRecoveryDays();
      $('#profileRecoveryDaysDisplay').textContent = `${days} يوماً`;
    }

    // إدارة صورة المستخدم
    const avatarImg = $('#profileAvatarImg');
    const avatarFallback = $('#profileAvatarFallback');
    const removeBtn = $('#removeAvatarBtn');
    const userBtn = $('#userProfileBtn');

    if (u.avatar) {
      if (avatarImg) {
        avatarImg.src = u.avatar;
        avatarImg.classList.remove('hidden');
      }
      if (avatarFallback) avatarFallback.classList.add('hidden');
      if (removeBtn) removeBtn.style.display = 'block';

      if (userBtn) {
        let navImg = userBtn.querySelector('.navbar-user-avatar');
        if (!navImg) {
          navImg = document.createElement('img');
          navImg.className = 'navbar-user-avatar w-5 h-5 rounded-full object-cover';
          const icon = userBtn.querySelector('.icon');
          if (icon) icon.replaceWith(navImg);
        }
        navImg.src = u.avatar;
      }
    } else {
      if (avatarImg) {
        avatarImg.src = '';
        avatarImg.classList.add('hidden');
      }
      if (avatarFallback) {
        avatarFallback.textContent = (u.username || 'ع').charAt(0);
        avatarFallback.classList.remove('hidden');
      }
      if (removeBtn) removeBtn.style.display = 'none';

      if (userBtn && userBtn.querySelector('.navbar-user-avatar')) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'icon ic-18');
        const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useEl.setAttribute('href', '#i-user');
        svg.appendChild(useEl);
        userBtn.querySelector('.navbar-user-avatar').replaceWith(svg);
      }
    }

    const incognito = $('#incognitoSwitch');
    if (incognito) {
      incognito.setAttribute('aria-checked', String(!!u.incognito));
      incognito.classList.toggle('is-on', !!u.incognito);
    }
  }

  // ---------- مقياس المزاج اليومي ----------
  const MOOD_MESSAGES = {
    great: 'رائع جداً! حافظ على هذه الطاقة الإيجابية وشارك سلامك مع من تحب ',
    calm: 'الحمد لله على راحة البال والسكينة، استمتع بهذا التوازن الداخلي ',
    distracted: 'من الطبيعي تشتت الذهن أحياناً؛ خذ استراحة قصيرة واشرب كوب ماء ',
    anxious: 'نحن معك، خذ 4 أنفاس عميقة وتذكر أن هذا الشعور مؤقت وسيزول قريباً ',
    tired: 'جسدك ونفسك يحتاجان لبعض الراحة، لا تضغط على نفسك واسترح قليلاً '
  };

  document.addEventListener('click', (e) => {
    const moodBtn = e.target.closest('[data-mood]');
    if (!moodBtn) return;
    const mood = moodBtn.dataset.mood;
    $$('[data-mood]').forEach(b => b.classList.remove('is-active'));
    moodBtn.classList.add('is-active');
    setStorage(KEYS.MOOD, { mood, date: new Date().toISOString() });
    const msg = MOOD_MESSAGES[mood] || 'تم تسجيل حالتك المزاجية بنجاح.';
    const feedbackText = $('#moodFeedbackText');
    if (feedbackText) feedbackText.textContent = msg;
    showToast(msg);
  });

  // ---------- إدارة رحلة التعافي وحاسبة الادخار (Enhanced Recovery System) ----------
  const ACHIEVEMENTS_DATA = [
    { id: 'a1', days: 1, title: 'بداية الرحلة', desc: 'كسر حاجز الخوف والبدء الفعلي في مسار الحرية والتعافي.', icon: 'i-trophy' },
    { id: 'a2', days: 7, title: 'أول أسبوع', desc: '7 أيام من الثبات والصفاء وتخطي التحدي الأول.', icon: 'i-star' },
    { id: 'a3', days: 30, title: 'أول شهر', desc: 'شهر كامل من بناء العادات الإيجابية وإعادة برمجة الوعي.', icon: 'i-award' },
    { id: 'a4', days: 60, title: '60 يوماً', desc: 'شهران من الاستقرار النفسي والتوازن والسكينة.', icon: 'i-trophy' },
    { id: 'a5', days: 90, title: '90 يوماً', desc: 'ثلاثة أشهر من القوة واليقظة وترسيخ الوقاية من الانتكاسة.', icon: 'i-award' },
    { id: 'a6', days: 180, title: '180 يوماً', desc: 'نصف عام من الحرية التامة والتمكين المستدام.', icon: 'i-star' }
  ];

  const RECOVERY_QUOTES = [
    '«أنت أقوى من الإدمان.. ومستقبلك أجمل بدونها».',
    '«كل يوم تقضيه في التعافي هو انتصار حقيقي لروحك وكرامتك وعائلتك».',
    '«الشجاعة ليست غياب الصعاب، بل قرارك الواعي بأن تتجاوزها كل صباح».',
    '«لقد بنيت جسوراً جديدة من النقاء، واليوم أنت تصنع حياة تستحق أن تعاش».',
    '«تذكر أنك لست وحدك، كل خطوة تخطوها تصنع فرقاً حقيقياً في حاضرك ومستقبلك».',
    '«السلام الداخلي يبدأ عندما تختار ذاتك وصحتك فوق كل رغبة عابرة».',
    '«أعظم استثمار قمت به في حياتك هو استعادة صفاء ذهنك وعافية جسدك».'
  ];

  function getRecoveryDays() {
    if (state.recovery.startDate === '2025-10-01' && state.recovery.manualDays !== undefined) {
      return state.recovery.manualDays;
    }
    const start = new Date(state.recovery.startDate || '2025-10-01');
    const now = new Date();
    const diff = now - start;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function getMilestonesList(days, target) {
    return [
      {
        id: 'm1',
        name: 'بداية الرحلة',
        dateText: '1 أكتوبر',
        status: 'completed',
        statusText: 'مكتملة',
        icon: 'i-check',
        color: '#1965B3',
        desc: 'الخطوة الأولى والشجاعة في اتخاذ قرار التعافي، كسر حلقة الإدمان وبدء بناء الذات.',
        quote: '«بداية الألف ميل تبدأ بخطوة شجاعة؛ وأنت اتخذت أعظم خطوة في حياتك.»'
      },
      {
        id: 'm2',
        name: 'شهر من التعافي',
        dateText: '1 نوفمبر',
        status: days >= 30 ? 'completed' : (days >= 1 ? 'next' : 'future'),
        statusText: days >= 30 ? 'مكتملة' : 'المرحلة القادمة',
        icon: days >= 30 ? 'i-check' : 'i-sparkles',
        color: '#10B981',
        desc: '30 يوماً متتالية من النقاء وإعادة التوازن للخلايا العصبية والتخلص التام من السموم.',
        quote: '«شهر كامل من النقاء يؤكد قدرتك على الانتصار وتجديد خلايا الأمل والحياة.»'
      },
      {
        id: 'm3',
        name: 'نصف الطريق',
        dateText: '1 ديسمبر',
        status: days >= Math.round(target / 2) ? (days >= target ? 'completed' : 'next') : 'future',
        statusText: days >= target ? 'مكتملة' : (days >= Math.round(target / 2) ? 'المرحلة القادمة' : 'قيد التقدم'),
        icon: 'i-star',
        color: '#3B82F6',
        desc: 'بلوغ منتصف المسار؛ مرحلة ترسيخ العادات المستقرة والوقاية المتقدمة من الانتكاسة.',
        quote: '«أنت الآن في نقطة التحول الكبرى؛ ما مضى كان الأصعب، وما بقي هو الأجمل والأكثر ثباتاً.»'
      },
      {
        id: 'm4',
        name: 'الهدف القادم – حياة أفضل',
        dateText: `${target} يوماً`,
        status: days >= target ? 'completed' : 'future',
        statusText: days >= target ? 'مكتملة بنجاح' : 'لم يتم الوصول إليها بعد',
        icon: 'i-flag',
        color: '#94A3B8',
        desc: 'تحقيق الهدف المنشود والوصول إلى الاستقرار النفسي والاجتماعي الشامل والتمكين المستدام.',
        quote: '«الحياة الأفضل ليست حلماً بعيداً، بل هي واقع تصنعه بيدك كل صباح بكل فخر وكرامة.»'
      }
    ];
  }

  function updateRecoveryStats() {
    const days = getRecoveryDays();
    const target = Number(state.recovery.targetDays) || 60;
    const dailySpend = Number(state.recovery.dailySpending) || 114.2857;
    const percent = Math.min(100, Math.round((days / target) * 100));
    const totalSaved = Math.round(days * dailySpend);

    // 1. بطاقة الهيرو الأفقية
    const heroDate = $('#heroRecoveryDate');
    if (heroDate) heroDate.textContent = formatArabicDate(state.recovery.startDate);

    const heroPct = $('#heroProgressPercent');
    if (heroPct) heroPct.textContent = `${percent}%`;

    const heroBar = $('#recoveryHeroProgressBar') || $('#heroProgressBar');
    if (heroBar) heroBar.style.width = `${percent}%`;

    const heroSaved = $('#heroTotalSaved');
    if (heroSaved) heroSaved.textContent = `${totalSaved.toLocaleString()} ريال`;

    // 2. بطاقة إنجازاتك
    const completedCount = ACHIEVEMENTS_DATA.filter(a => days >= a.days).length;
    const achieveSummary = $('#achievementsCardSummary');
    if (achieveSummary) achieveSummary.textContent = `لقد حققت ${completedCount} من 6 إنجازات`;

    const badgesContainer = $('#achievementsBadgesPreview');
    if (badgesContainer) {
      badgesContainer.innerHTML = ACHIEVEMENTS_DATA.map(a => {
        const isDone = days >= a.days;
        return `
          <button type="button" class="achievement-badge-pill ${isDone ? 'is-unlocked' : 'is-locked'}" data-open-achievements title="${a.title} (${isDone ? 'مكتمل' : 'متبقي ' + (a.days - days) + ' يوم'})">
            <div class="badge-icon-box">
              <svg class="icon ic-18"><use href="#${a.icon}"/></svg>
            </div>
            <span class="badge-pill-lbl">${a.title}</span>
          </button>
        `;
      }).join('');
    }

    // 3. بطاقة أيام التعافي (دائرة التقدم)
    const circBadge = $('#circleTargetBadge');
    if (circBadge) circBadge.textContent = `الهدف: ${target} يوم`;

    const circPct = $('#circlePercentVal');
    if (circPct) circPct.textContent = `${percent}%`;

    const circDays = $('#circleDaysCount');
    if (circDays) circDays.textContent = `${days} يوم`;

    const circTargetText = $('#circleTargetDaysText');
    if (circTargetText) circTargetText.textContent = `${target} يوم`;

    const circFill = $('#circularProgressFill');
    if (circFill) {
      const circ = 314.16; // 2 * PI * 50
      const offset = circ * (1 - Math.min(100, percent) / 100);
      circFill.style.strokeDashoffset = String(offset);
    }

    // 4. بطاقة رسالتك اليوم
    const quoteEl = $('#recoveryDailyQuoteText');
    if (quoteEl) {
      const qIdx = state.recoveryQuoteIdx !== undefined ? state.recoveryQuoteIdx : (new Date().getDate() % RECOVERY_QUOTES.length);
      quoteEl.textContent = RECOVERY_QUOTES[qIdx % RECOVERY_QUOTES.length];
    }

    // 5. بطاقة حاسبة الادخار السفلية
    const bottomSaved = $('#bottomCalcTotalSaved');
    if (bottomSaved) bottomSaved.textContent = `${totalSaved.toLocaleString()} ريال`;

    // 6. بطاقة مراحل رحلتك (الخط الزمني الأفقي)
    const milestones = getMilestonesList(days, target);
    const timelineEl = $('#milestonesHorizontalTrack');
    if (timelineEl) {
      timelineEl.innerHTML = milestones.map(m => `
        <div class="milestone-node is-${m.status}" data-view-milestone="${m.id}" role="button" tabindex="0" title="اضغط لعرض تفاصيل ${m.name}">
          <div class="milestone-node-circle">
            <svg class="icon ic-20"><use href="#${m.icon}"/></svg>
          </div>
          <span class="milestone-node-name">${m.name}</span>
          <span class="milestone-node-date">${m.dateText}</span>
          <span class="milestone-node-status">${m.statusText}</span>
        </div>
      `).join('');
    }

    // 7. تحديث نوافذ المودال المرتبطة
    updateAchievementsModal(days, completedCount);
    updateSavingsModal(days, dailySpend, totalSaved, target);

    // 8. تحديث العناصر المتواجدة في صفحة الرئيسية للاتساق التام
    const hClean = $('#homeCleanDays');
    if (hClean) hClean.textContent = days;
    const rClean = $('#recoveryCleanDays');
    if (rClean) rClean.textContent = days;
    const hHours = $('#homeHoursSaved');
    if (hHours) hHours.textContent = (days * 24).toLocaleString();
    const briefSaved = $('#calcTotalSavedBrief');
    if (briefSaved) briefSaved.textContent = `${totalSaved.toLocaleString()} ر.س`;
  }

  function updateAchievementsModal(days, completedCount) {
    const sumText = $('#achievementsModalSummaryText');
    if (sumText) sumText.textContent = `لقد حققت ${completedCount} من 6 إنجازات`;

    const fullList = $('#achievementsFullList');
    if (!fullList) return;

    fullList.innerHTML = ACHIEVEMENTS_DATA.map(a => {
      const isDone = days >= a.days;
      return `
        <div class="p-4 rounded-2xl border ${isDone ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 'bg-surface border-line opacity-75'} flex items-start gap-3">
          <div class="w-12 h-12 rounded-2xl flex-shrink-0 grid place-items-center ${isDone ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' : 'bg-bg-soft text-muted'}">
            <svg class="icon ic-24"><use href="#${a.icon}"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-1">
              <h4 class="font-bold text-sm text-ink">${a.title}</h4>
              <span class="badge ${isDone ? 'badge-success' : 'badge-neutral'}" style="font-size:10px;">
                ${isDone ? 'مكتمل بنجاح ✓' : `متبقٍ ${a.days - days} يوم`}
              </span>
            </div>
            <p class="text-xs t-body leading-relaxed">${a.desc}</p>
            <div class="text-[11px] t-muted mt-2 font-semibold">
              ${isDone ? 'تم تحقيق هذا الوسام في سجل رحلتك 🌟' : `يتحقق تلقائياً عند إكمال ${a.days} يوماً`}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateSavingsModal(days, dailySpend, totalSaved, target) {
    const daysVal = $('#savingsModalDaysVal');
    if (daysVal) daysVal.textContent = `${days} يوماً`;

    const totalVal = $('#savingsModalTotalVal');
    if (totalVal) totalVal.textContent = `${totalSaved.toLocaleString()} ريال`;

    const weekly = Math.round(dailySpend * 7);
    const weeklyVal = $('#savingsModalWeeklyVal');
    if (weeklyVal) weeklyVal.textContent = `${weekly.toLocaleString()} ريال / أسبوع`;

    const monthly = Math.round(dailySpend * 30);
    const monthlyVal = $('#savingsModalMonthlyVal');
    if (monthlyVal) monthlyVal.textContent = `${monthly.toLocaleString()} ريال / شهر`;

    const yearly = Math.round(dailySpend * 365);
    const yearlyVal = $('#savingsModalYearlyVal');
    if (yearlyVal) yearlyVal.textContent = `${yearly.toLocaleString()} ريال / سنة`;

    const input = $('#savingsModalDailyInput');
    if (input && document.activeElement !== input) input.value = Math.round(dailySpend);

    const slider = $('#savingsModalDailySlider');
    if (slider && document.activeElement !== slider) slider.value = Math.round(dailySpend);

    // 6. رسم بياني يوضح نمو المدخرات بمرور الوقت
    const chartBox = $('#savingsChartContainer');
    if (chartBox) {
      const chartPoints = [
        { label: 'اليوم 1', d: 1 },
        { label: 'أسبوع 1', d: 7 },
        { label: 'شهر 1', d: 30 },
        { label: 'الحالي', d: days, isCurrent: true },
        { label: `الهدف (${target})`, d: target },
        { label: '90 يوم', d: 90 },
        { label: '180 يوم', d: 180 }
      ];
      // ترتيب النقاط بالترتيب التصاعدي
      const uniquePoints = [];
      const seenDays = new Set();
      chartPoints.sort((a, b) => a.d - b.d).forEach(p => {
        if (!seenDays.has(p.d)) {
          seenDays.add(p.d);
          uniquePoints.push(p);
        }
      });

      const maxVal = Math.max(...uniquePoints.map(p => p.d * dailySpend));

      chartBox.innerHTML = uniquePoints.map(p => {
        const val = Math.round(p.d * dailySpend);
        const heightPct = Math.max(12, Math.round((val / maxVal) * 100));
        return `
          <div class="savings-bar-col">
            <span class="savings-bar-val">${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}</span>
            <div class="savings-bar-pill ${p.isCurrent ? 'is-current' : ''}" style="height: ${heightPct}%;"></div>
            <span class="savings-bar-lbl ${p.isCurrent ? 'font-extrabold text-primary' : ''}">${p.label}</span>
          </div>
        `;
      }).join('');
    }
  }

  // التفاعل مع سلايدر ومدخلات حاسبة الادخار في المودال
  function handleSavingsChange(newDaily) {
    const val = Math.max(5, Math.min(5000, Number(newDaily) || 100));
    state.recovery.dailySpending = val;
    state.user.dailySavings = val;
    setStorage(KEYS.USER, state.user);
    setStorage(KEYS.RECOVERY, state.recovery);
    updateRecoveryStats();
  }

  $('#savingsModalDailyInput')?.addEventListener('input', (e) => handleSavingsChange(e.target.value));
  $('#savingsModalDailySlider')?.addEventListener('input', (e) => handleSavingsChange(e.target.value));

  // فتح نافذة جميع الإنجازات
  $('#openAllAchievementsBtn')?.addEventListener('click', () => {
    $('#achievementsModal')?.classList.add('is-open');
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-achievements]')) {
      $('#achievementsModal')?.classList.add('is-open');
    }
  });

  // فتح نافذة تفاصيل حاسبة الادخار
  $('#openSavingsDetailsBtn')?.addEventListener('click', () => {
    $('#savingsModal')?.classList.add('is-open');
  });

  // فتح نافذة إعدادات رحلة التعافي
  function openRecoverySettingsModal() {
    const modal = $('#recoverySettingsModal');
    if (!modal) return;
    if ($('#settingsRecoveryStartDate')) $('#settingsRecoveryStartDate').value = state.recovery.startDate || '2025-10-01';
    if ($('#settingsRecoveryTargetDays')) $('#settingsRecoveryTargetDays').value = state.recovery.targetDays || 60;
    if ($('#settingsRecoveryDailySpend')) $('#settingsRecoveryDailySpend').value = Math.round(state.recovery.dailySpending || 114);
    modal.classList.add('is-open');
  }

  $('#openRecoverySettingsBtn')?.addEventListener('click', openRecoverySettingsModal);
  $('#quickEditDateBtn')?.addEventListener('click', openRecoverySettingsModal);

  // أزرار تحديد الأهداف السريعة في نافذة الإعدادات
  document.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('[data-set-target]');
    if (targetBtn) {
      const val = targetBtn.dataset.setTarget;
      const input = $('#settingsRecoveryTargetDays');
      if (input && val) {
        input.value = val;
        $$('[data-set-target]').forEach(b => {
          b.classList.remove('btn-solid');
          b.classList.add('btn-outline');
        });
        targetBtn.classList.add('btn-solid');
        targetBtn.classList.remove('btn-outline');
      }
    }
  });

  // حفظ نموذج إعدادات رحلة التعافي مع التحقق من صحة المدخلات
  $('#recoverySettingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newDate = $('#settingsRecoveryStartDate')?.value;
    const newTarget = Number($('#settingsRecoveryTargetDays')?.value) || 60;
    const newSpend = Number($('#settingsRecoveryDailySpend')?.value) || 100;

    if (!newDate) {
      showToast('يرجى تحديد تاريخ بداية التعافي.');
      return;
    }
    if (newTarget < 7) {
      showToast('يجب ألا يقل الهدف عن 7 أيام.');
      return;
    }
    if (newSpend <= 0) {
      showToast('يرجى إدخال مبلغ إنفاق يومي صحيح.');
      return;
    }

    state.recovery.startDate = newDate;
    state.recovery.targetDays = Math.max(7, newTarget);
    state.recovery.dailySpending = Math.max(1, newSpend);

    // حساب الأيام الفعلي بناءً على التاريخ الجديد
    const start = new Date(newDate);
    const now = new Date();
    const diffDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    state.recovery.manualDays = diffDays;

    // مزامنة مع ملف المستخدم
    state.user.recoveryStart = newDate;
    state.user.dailySavings = state.recovery.dailySpending;
    setStorage(KEYS.USER, state.user);
    setStorage(KEYS.RECOVERY, state.recovery);

    updateRecoveryStats();
    $('#recoverySettingsModal')?.classList.remove('is-open');
    showToast('تم حفظ وتحديث بيانات رحلة التعافي بنجاح ✓');
  });

  // عرض تفاصيل أي مرحلة عند النقر عليها في الخط الزمني
  document.addEventListener('click', (e) => {
    const node = e.target.closest('[data-view-milestone]');
    if (node) {
      const mId = node.dataset.viewMilestone;
      const days = getRecoveryDays();
      const target = state.recovery.targetDays || 60;
      const milestones = getMilestonesList(days, target);
      const m = milestones.find(x => x.id === mId);
      if (m) {
        if ($('#milestoneModalStageName')) $('#milestoneModalStageName').textContent = m.name;
        if ($('#milestoneModalDesc')) $('#milestoneModalDesc').textContent = m.desc;
        if ($('#milestoneModalDate')) $('#milestoneModalDate').textContent = m.dateText;
        if ($('#milestoneModalStatusText')) $('#milestoneModalStatusText').textContent = m.statusText;
        if ($('#milestoneModalStatusBadge')) {
          const badge = $('#milestoneModalStatusBadge');
          badge.textContent = m.statusText;
          badge.className = 'badge mt-0.5 ' + (m.status === 'completed' ? 'badge-success' : (m.status === 'next' ? 'badge-primary' : 'badge-neutral'));
        }
        if ($('#milestoneModalQuote')) $('#milestoneModalQuote').textContent = m.quote;
        $('#milestoneDetailModal')?.classList.add('is-open');
      }
    }
  });

  // تحديث وتدوير الرسالة التحفيزية
  $('#refreshDailyQuoteBtn')?.addEventListener('click', () => {
    state.recoveryQuoteIdx = ((state.recoveryQuoteIdx || 0) + 1) % RECOVERY_QUOTES.length;
    const quoteEl = $('#recoveryDailyQuoteText');
    if (quoteEl) {
      quoteEl.textContent = RECOVERY_QUOTES[state.recoveryQuoteIdx];
    }
    showToast('تم تحديث الرسالة التحفيزية ');
  });

  // إدارة إغلاق جميع النوافذ المنبثقة بشكل عام
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      const modalId = closeBtn.dataset.closeModal;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('is-open');
      return;
    }
    if (e.target.classList.contains('dash-modal') && e.target.classList.contains('is-open')) {
      e.target.classList.remove('is-open');
    }
  });

  // ---------- تدوير رسالة اليوم الملهمة في الهيرو سكشن تلقائياً كل 5 ثوانٍ ----------
  let heroQuoteTimer = null;

  function renderHeroQuote(idx) {
    const textEl = $('#heroQuoteText');
    const authorEl = $('#heroQuoteAuthor');
    const counterEl = $('#heroQuoteCounter');
    const progressEl = $('#heroProgressBar');
    if (!textEl) return;

    state.quoteIdx = (idx + DAILY_QUOTES.length) % DAILY_QUOTES.length;
    const q = DAILY_QUOTES[state.quoteIdx];

    textEl.classList.add('is-changing');
    setTimeout(() => {
      textEl.textContent = q.quote;
      if (authorEl) authorEl.textContent = q.author;
      if (counterEl) counterEl.textContent = `${state.quoteIdx + 1} من ${DAILY_QUOTES.length}`;
      textEl.classList.remove('is-changing');
    }, 220);

    // إعادة تشغيل شريط التقدم 5 ثوانٍ
    if (progressEl) {
      progressEl.style.transition = 'none';
      progressEl.style.width = '0%';
      setTimeout(() => {
        progressEl.style.transition = 'width 5s linear';
        progressEl.style.width = '100%';
      }, 50);
    }
  }

  function startHeroQuoteTimer() {
    clearInterval(heroQuoteTimer);
    if (!$('#heroQuoteText')) return;
    renderHeroQuote(state.quoteIdx);
    heroQuoteTimer = setInterval(() => {
      renderHeroQuote(state.quoteIdx + 1);
    }, 5000);
  }

  $('#nextHeroQuoteBtn')?.addEventListener('click', () => {
    startHeroQuoteTimer();
  });

  $('#prevHeroQuoteBtn')?.addEventListener('click', () => {
    state.quoteIdx = (state.quoteIdx - 2 + DAILY_QUOTES.length) % DAILY_QUOTES.length;
    startHeroQuoteTimer();
  });

  const heroQuoteCard = $('#heroQuoteSection');
  heroQuoteCard?.addEventListener('mouseenter', () => clearInterval(heroQuoteTimer));
  heroQuoteCard?.addEventListener('mouseleave', () => startHeroQuoteTimer());

  // ---------- الاستشارات النفسية وقائمة الأخصائيين ----------
  function renderSpecialists(filterSpecialty = '', searchKeyword = '') {
    const grid = $('#specialistsPortalGrid');
    if (!grid) return;

    searchKeyword = searchKeyword.trim().toLowerCase();

    const filtered = SPECIALISTS_LIST.filter(s => {
      const matchSpecialty = !filterSpecialty || s.specialty === filterSpecialty;
      const matchSearch = !searchKeyword || 
        s.name.toLowerCase().includes(searchKeyword) || 
        s.title.toLowerCase().includes(searchKeyword) ||
        s.tags.some(t => t.toLowerCase().includes(searchKeyword));
      return matchSpecialty && matchSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="col-span-full empty-dash-state">
          <svg class="empty-dash-icon"><use href="#i-search"/></svg>
          <h3 class="text-lg font-bold mb-2">لا توجد نتائج مطابقة لبحثك</h3>
          <p class="text-sm">جرّب تغيير كلمات البحث أو إزالة التصفية لاستعراض جميع الأخصائيين.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(s => `
      <div class="specialist-portal-card">
        <div class="spec-header-flex">
          <img src="${s.photo}" alt="${s.name}" class="spec-avatar-portal" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-bold text-lg text-ink truncate">${s.name}</h3>
              <span class="inline-flex items-center gap-1 text-sm font-bold text-amber-500">
                ★ ${s.rating} <span class="text-xs text-muted">(${s.reviewsCount})</span>
              </span>
            </div>
            <p class="text-sm font-semibold text-primary mt-0.5">${s.specialtyName}</p>
            <p class="text-xs t-muted mt-1">${s.experience}</p>
          </div>
        </div>

        <p class="text-sm t-body line-clamp-2">${s.qualification}</p>

        <div class="flex flex-wrap gap-1.5 my-1">
          ${s.tags.map(t => `<span class="badge" style="background:var(--bg-soft);color:var(--ink-body);font-size:.78rem">${t}</span>`).join('')}
        </div>

        <div class="mt-auto pt-3 border-t border-line flex items-center justify-between gap-2">
          <div class="text-xs t-muted">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
            متاح للحجز اليوم
          </div>
          <div class="flex gap-2">
            <a href="booking.html?specialist=${encodeURIComponent(s.id)}" class="btn btn-solid btn-sm" data-open-booking="${s.id}">
              <svg class="icon ic-18"><use href="#i-calendar"/></svg>
              <span>حجز جلسة</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // فلترة الأخصائيين
  $('#specCategoryFilter')?.addEventListener('change', (e) => {
    renderSpecialists(e.target.value, $('#specSearchInput')?.value || '');
  });

  $('#specSearchInput')?.addEventListener('input', (e) => {
    renderSpecialists($('#specCategoryFilter')?.value || '', e.target.value);
  });

  // ---------- نافذة حجز الاستشارة (Booking Flow Modal) ----------
  const bookingModal = $('#bookingModal');

  function openBookingModal(specialistId) {
    const s = SPECIALISTS_LIST.find(x => x.id === specialistId) || SPECIALISTS_LIST[0];
    state.bookingSpecialist = s;

    $('#bookingSpecName').textContent = s.name;
    $('#bookingSpecTitle').textContent = s.title;
    $('#bookingSpecPhoto').src = s.photo;
    
    // المواعيد المتاحة
    const slotsContainer = $('#bookingSlotsContainer');
    slotsContainer.innerHTML = s.slots.map((slot, i) => `
      <label class="cursor-pointer">
        <input type="radio" name="bookingSlot" value="${slot}" class="sr-only peer" ${i === 0 ? 'checked' : ''} />
        <div class="px-3 py-2 rounded-xl text-center font-bold text-sm border border-line peer-checked:border-primary peer-checked:bg-blue-50 dark:peer-checked:bg-slate-800 peer-checked:text-primary transition">
          ${slot}
        </div>
      </label>
    `).join('');

    // التاريخ التلقائي (غداً)
    const d = new Date();
    d.setDate(d.getDate() + 2);
    $('#bookingDatePicker').value = d.toISOString().split('T')[0];

    bookingModal.classList.add('is-open');
  }

  function closeBookingModal() {
    bookingModal.classList.remove('is-open');
  }

  document.addEventListener('click', (e) => {
    const bookBtn = e.target.closest('[data-open-booking]');
    if (bookBtn) {
      e.preventDefault();
      const specId = bookBtn.dataset.openBooking;
      window.location.href = `booking.html?specialist=${encodeURIComponent(specId)}`;
    }
  });

  $('#closeBookingModalBtn')?.addEventListener('click', closeBookingModal);
  $('#cancelBookingBtn')?.addEventListener('click', closeBookingModal);

  // تأكيد حجز الموعد
  $('#confirmBookingForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = state.bookingSpecialist;
    const selectedDate = $('#bookingDatePicker').value;
    const selectedSlot = $('input[name="bookingSlot"]:checked')?.value || '05:00 م';
    const sessionType = $('input[name="sessionType"]:checked')?.value || 'جلسة فيديو مرئية مشفرة';
    const notes = $('#bookingNotes').value.trim();

    const { day, formattedDate } = getArabicDayAndDate(selectedDate);
    const newAppointment = {
      id: `apt-${Date.now()}`,
      day: day,
      date: formattedDate,
      rawDate: selectedDate,
      time: selectedSlot,
      type: sessionType,
      status: 'confirmed',
      statusText: 'موعد مؤكد',
      specialistId: s.id,
      specialistName: s.name,
      specialistRole: s.title,
      specialistPhoto: s.photo,
      sessionTitle: sessionType || 'جلسة استشارية نفسية',
      notes: notes || 'استشارة استرشادية سرية'
    };

    state.appointments.unshift(newAppointment);
    setStorage(KEYS.APPOINTMENTS, state.appointments);

    // ربط الحجز مع Supabase
    if (window.MaladhDB && window.MaladhDB.appointments) {
      window.MaladhDB.appointments.create({
        beneficiary_id: state.user.id || 'b1',
        specialist_id: s.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        session_title: sessionType || 'جلسة استشارية نفسية',
        type: 'عن بُعد',
        notes: notes || ''
      }).catch(e => console.warn('[Supabase Appointment Sync]:', e.message));
    }

    // إضافة إشعار
    state.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'تم تأكيد حجز جلستك',
      desc: `تم تأكيد موعدك مع ${s.name} في ${formattedDate} الساعة ${selectedSlot}.`,
      time: 'الآن',
      read: false,
      type: 'calendar'
    });
    setStorage(KEYS.NOTIFS, state.notifications);
    updateNotifBadge();

    closeBookingModal();
    showToast(`تم تأكيد موعدك بنجاح مع ${s.name} في ${formattedDate} ✨`);
    
    // إعادة رسم قائمة المواعيد
    renderAppointments();

    // الانتقال إلى مواعيدي
    setTimeout(() => {
      switchView('appointments');
    }, 600);
  });

  // ---------- دالة استخراج اليوم والتاريخ العربي للمواعيد ----------
  function getArabicDayAndDate(dateStr) {
    try {
      if (!dateStr) return { day: 'الموعد', formattedDate: '' };
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dt = new Date(y, m, d);
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return {
          day: days[dt.getDay()],
          formattedDate: `${d} ${months[m]} ${y}`
        };
      }
    } catch (e) {}
    return { day: 'اليوم', formattedDate: dateStr };
  }

  // ---------- مواعيدي (Appointments Manager) ----------
  let currentApptTab = 'upcoming';

  function updateAppointmentTabCounters() {
    const upcomingCount = state.appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
    const pastCount = state.appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show').length;
    $$('[data-appt-counter="upcoming"]').forEach(el => el.textContent = upcomingCount);
    $$('[data-appt-counter="past"]').forEach(el => el.textContent = pastCount);
  }

  function renderAppointments() {
    const container = $('#appointmentsList');
    if (!container) return;
    updateAppointmentTabCounters();

    const isUpcoming = currentApptTab === 'upcoming';
    const list = state.appointments.filter(a => {
      if (isUpcoming) {
        return a.status === 'confirmed' || a.status === 'pending';
      } else {
        return a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show';
      }
    });

    if (!list.length) {
      if (isUpcoming) {
        container.innerHTML = `
          <div class="appt-empty-state">
            <div class="appt-empty-icon">
              <svg class="icon ic-24"><use href="#i-calendar"/></svg>
            </div>
            <h3 class="appt-empty-title">لا توجد مواعيد قادمة مجدولة</h3>
            <p class="appt-empty-desc">يمكنك استعراض نخبة الأخصائيين المعتمدين وحجز جلستك بكل سرية وأمان في الوقت الذي يناسبك.</p>
            <a href="dashboard.html#consultations" class="btn btn-solid btn-sm inline-flex items-center gap-2">
              <svg class="icon ic-18"><use href="#i-calendar"/></svg>
              <span>حجز استشارة جديدة</span>
            </a>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="appt-empty-state">
            <div class="appt-empty-icon">
              <svg class="icon ic-24"><use href="#i-calendar"/></svg>
            </div>
            <h3 class="appt-empty-title">لا توجد مواعيد سابقة حتى الآن</h3>
            <p class="appt-empty-desc">جميع استشاراتك السابقة وجلسات المتابعة المنتهية ستظهر هنا مع سجل التوصيات الكامل.</p>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = list.map(a => {
      let statusBadgeHtml = '';
      if (a.status === 'confirmed') {
        statusBadgeHtml = `
          <span class="appt-status-badge is-confirmed">
            <svg class="icon ic-18"><use href="#i-check"/></svg>
            <span>${a.statusText || 'موعد مؤكد'}</span>
          </span>
        `;
      } else if (a.status === 'pending') {
        statusBadgeHtml = `
          <span class="appt-status-badge is-pending">
            <svg class="icon ic-18"><use href="#i-clock"/></svg>
            <span>${a.statusText || 'قيد الانتظار'}</span>
          </span>
        `;
      } else if (a.status === 'completed') {
        statusBadgeHtml = `
          <span class="appt-status-badge is-completed">
            <svg class="icon ic-18"><use href="#i-check"/></svg>
            <span>${a.statusText || 'جلسة مكتملة'}</span>
          </span>
        `;
      } else if (a.status === 'cancelled') {
        statusBadgeHtml = `
          <span class="appt-status-badge is-cancelled">
            <svg class="icon ic-18"><use href="#i-x"/></svg>
            <span>${a.statusText || 'ملغي'}</span>
          </span>
        `;
      } else if (a.status === 'no_show') {
        statusBadgeHtml = `
          <span class="appt-status-badge is-no_show">
            <svg class="icon ic-18"><use href="#i-clock"/></svg>
            <span>${a.statusText || 'لم يحضر'}</span>
          </span>
        `;
      } else {
        statusBadgeHtml = `
          <span class="appt-status-badge is-confirmed">
            <span>${escapeHtml(a.statusText || a.status)}</span>
          </span>
        `;
      }

      let actionsHtml = '';
      if (isUpcoming) {
        actionsHtml = `
          <button type="button" class="appt-action-btn btn-reschedule" data-open-reschedule="${a.id}">
            <svg class="icon ic-18"><use href="#i-calendar"/></svg>
            <span>إعادة الجدولة</span>
          </button>
          <button type="button" class="appt-action-btn btn-cancel" data-open-cancel="${a.id}">
            <svg class="icon ic-18"><use href="#i-x"/></svg>
            <span>إلغاء الموعد</span>
          </button>
        `;
      } else {
        actionsHtml = `
          <button type="button" class="appt-action-btn btn-details" data-open-past-detail="${a.id}">
            <svg class="icon ic-18"><use href="#i-shield"/></svg>
            <span>عرض التفاصيل</span>
          </button>
          <button type="button" class="appt-action-btn btn-rebook" data-rebook-spec="${a.specialistId || 'sara'}">
            <svg class="icon ic-18"><use href="#i-calendar"/></svg>
            <span>حجز موعد مشابه</span>
          </button>
        `;
      }

      return `
        <div class="appt-horizontal-card" id="card-${a.id}">
          <!-- الجزء الأول: بيانات الموعد – الجهة اليمنى -->
          <div class="appt-col-datetime">
            <div class="appt-datetime-row">
              <div class="appt-icon-circle">
                <svg class="icon ic-18"><use href="#i-calendar"/></svg>
              </div>
              <div>
                <span class="appt-day-label">${a.day || 'اليوم'}</span>
                <h4 class="appt-date-heading">${a.date}</h4>
              </div>
            </div>
            <div class="appt-datetime-row">
              <div class="appt-icon-circle">
                <svg class="icon ic-18"><use href="#i-clock"/></svg>
              </div>
              <div>
                <span class="appt-time-label">التوقيت</span>
                <h4 class="appt-time-heading">${a.time}</h4>
              </div>
            </div>
            <div>
              ${statusBadgeHtml}
            </div>
          </div>

          <!-- الجزء الثاني: معلومات الجلسة – منتصف البطاقة -->
          <div class="appt-col-session">
            <div class="appt-spec-avatar-wrap">
              <img src="${a.specialistPhoto || 'assets/specialist-sara.jpg'}" alt="${escapeHtml(a.specialistName)}" class="appt-spec-avatar-img" />
              <span class="appt-consult-type-badge">
                <svg class="icon" style="width:12px;height:12px;"><use href="#i-video"/></svg>
                <span>عن بُعد</span>
              </span>
            </div>
            <div class="appt-session-details">
              <span class="appt-session-subtag">${escapeHtml(a.sessionTitle || 'جلسة استشارية نفسية')}</span>
              <h3 class="appt-spec-name">
                <span>${escapeHtml(a.specialistName)}</span>
                <svg class="icon ic-18 text-emerald-500" title="أخصائي موثق ومصرح"><use href="#i-check-circle"/></svg>
              </h3>
              <p class="appt-spec-role">${escapeHtml(a.specialistRole || 'أخصائي معتمد في منصة ملاذ')}</p>
            </div>
          </div>

          <!-- الجزء الثالث: أزرار التحكم – الجهة اليسرى -->
          <div class="appt-col-actions">
            ${actionsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // تبديل تبويب المواعيد (القادمة vs السابقة)
  $$('[data-appt-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.apptTab;
      currentApptTab = targetTab;
      $$('[data-appt-tab]').forEach(b => {
        const isMatch = b.dataset.apptTab === targetTab;
        b.classList.toggle('is-active', isMatch);
        b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
      renderAppointments();
    });
  });

  // ---------- تفاعلات نافذة إعادة جدولة الموعد (Reschedule Modal) ----------
  let selectedRescheduleSlot = '05:00 مساءً';
  let activeRescheduleAppt = null;

  function openRescheduleModal(apptId) {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;
    activeRescheduleAppt = appt;

    const idInput = $('#rescheduleApptId');
    if (idInput) idInput.value = appt.id;

    const photoEl = $('#rescheduleSpecPhoto');
    if (photoEl) photoEl.src = appt.specialistPhoto || 'assets/specialist-sara.jpg';

    const nameEl = $('#rescheduleSpecName');
    if (nameEl) nameEl.textContent = appt.specialistName;

    const titleEl = $('#rescheduleSessionTitle');
    if (titleEl) titleEl.textContent = `${appt.sessionTitle || 'جلسة استشارية'} - عن بُعد`;

    const dateLabelEl = $('#rescheduleCurrentDateLabel');
    if (dateLabelEl) dateLabelEl.textContent = `${appt.day ? appt.day + '، ' : ''}${appt.date}`;

    const timeLabelEl = $('#rescheduleCurrentTimeLabel');
    if (timeLabelEl) timeLabelEl.textContent = appt.time;

    // منع اختيار التواريخ السابقة
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const dateInput = $('#rescheduleDatePicker');
    if (dateInput) {
      dateInput.min = todayStr;
      if (appt.rawDate && appt.rawDate >= todayStr) {
        dateInput.value = appt.rawDate;
      } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tmY = tomorrow.getFullYear();
        const tmM = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tmD = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.value = `${tmY}-${tmM}-${tmD}`;
      }
    }

    // بناء خيارات الأوقات التفاعلية
    const slots = ['03:00 مساءً', '04:00 مساءً', '05:00 مساءً', '06:00 مساءً', '07:00 مساءً', '08:00 مساءً'];
    selectedRescheduleSlot = slots.includes(appt.time) ? appt.time : slots[2];

    const slotsContainer = $('#rescheduleSlotsContainer');
    if (slotsContainer) {
      slotsContainer.innerHTML = slots.map(slot => `
        <button type="button" class="reschedule-slot-btn ${slot === selectedRescheduleSlot ? 'is-selected' : ''}" data-reschedule-slot="${slot}">
          ${slot}
        </button>
      `).join('');
    }

    const notesInput = $('#rescheduleNotes');
    if (notesInput) notesInput.value = '';

    $('#rescheduleModal')?.classList.add('is-open');
  }

  function closeRescheduleModal() {
    $('#rescheduleModal')?.classList.remove('is-open');
    activeRescheduleAppt = null;
  }

  // تبديل اختيار الوقت في نافذة إعادة الجدولة
  document.addEventListener('click', (e) => {
    const slotBtn = e.target.closest('[data-reschedule-slot]');
    if (slotBtn) {
      selectedRescheduleSlot = slotBtn.dataset.rescheduleSlot;
      $$('[data-reschedule-slot]').forEach(b => b.classList.remove('is-selected'));
      slotBtn.classList.add('is-selected');
    }
  });

  // تأكيد إعادة الجدولة
  $('#rescheduleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeRescheduleAppt) return;

    const dateVal = $('#rescheduleDatePicker')?.value;
    if (!dateVal) {
      showToast('يرجى اختيار التاريخ الجديد.');
      return;
    }

    const { day, formattedDate } = getArabicDayAndDate(dateVal);
    activeRescheduleAppt.date = formattedDate;
    activeRescheduleAppt.rawDate = dateVal;
    activeRescheduleAppt.day = day;
    activeRescheduleAppt.time = selectedRescheduleSlot;
    activeRescheduleAppt.status = 'confirmed';
    activeRescheduleAppt.statusText = 'موعد مؤكد';

    const notesVal = $('#rescheduleNotes')?.value.trim();
    if (notesVal) {
      activeRescheduleAppt.notes = (activeRescheduleAppt.notes ? activeRescheduleAppt.notes + ' | ' : '') + `إعادة جدولة: ${notesVal}`;
    }

    setStorage(KEYS.APPOINTMENTS, state.appointments);

    // مزامنة إعادة الجدولة مع Supabase
    if (window.MaladhDB && window.MaladhDB.appointments && activeRescheduleAppt && activeRescheduleAppt.id) {
      window.MaladhDB.appointments.reschedule(activeRescheduleAppt.id, selectedRescheduleDate, selectedRescheduleSlot).catch(e => console.warn(e));
    }
    renderAppointments();
    closeRescheduleModal();
    showToast('تمت إعادة جدولة موعدك بنجاح');
  });

  $('#closeRescheduleModalBtn')?.addEventListener('click', closeRescheduleModal);
  $('#cancelRescheduleBtn')?.addEventListener('click', closeRescheduleModal);

  // ---------- تفاعلات نافذة تأكيد إلغاء الموعد (Cancel Confirm Modal) ----------
  let activeCancelAppt = null;

  function openCancelConfirmModal(apptId) {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;
    activeCancelAppt = appt;

    const specEl = $('#cancelApptSpecName');
    if (specEl) specEl.textContent = appt.specialistName;

    const dateEl = $('#cancelApptDate');
    if (dateEl) dateEl.textContent = `${appt.day ? appt.day + '، ' : ''}${appt.date} (${appt.time})`;

    $('#cancelConfirmModal')?.classList.add('is-open');
  }

  function closeCancelConfirmModal() {
    $('#cancelConfirmModal')?.classList.remove('is-open');
    activeCancelAppt = null;
  }

  $('#confirmCancelActionBtn')?.addEventListener('click', () => {
    if (!activeCancelAppt) return;
    activeCancelAppt.status = 'cancelled';
    activeCancelAppt.statusText = 'ملغي';
    setStorage(KEYS.APPOINTMENTS, state.appointments);

    // مزامنة إلغاء الموعد مع Supabase
    if (window.MaladhDB && window.MaladhDB.appointments && activeCancelAppt.id) {
      window.MaladhDB.appointments.cancel(activeCancelAppt.id, 'تم الإلغاء من قبل المستفيد').catch(e => console.warn(e));
    }
    renderAppointments();
    closeCancelConfirmModal();
    showToast('تم إلغاء الموعد بنجاح');
  });

  $('#closeCancelModalBtn')?.addEventListener('click', closeCancelConfirmModal);
  $('#dismissCancelModalBtn')?.addEventListener('click', closeCancelConfirmModal);

  // ---------- تفاعلات نافذة تفاصيل الموعد السابق (Past Detail Modal) ----------
  let activePastAppt = null;

  function openPastDetailModal(apptId) {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;
    activePastAppt = appt;

    const photoEl = $('#pastDetailSpecPhoto');
    if (photoEl) photoEl.src = appt.specialistPhoto || 'assets/specialist-sara.jpg';

    const nameEl = $('#pastDetailSpecName');
    if (nameEl) nameEl.textContent = appt.specialistName;

    const roleEl = $('#pastDetailSpecRole');
    if (roleEl) roleEl.textContent = appt.specialistRole || 'أخصائي نفسي معتمد';

    const dateEl = $('#pastDetailDateTime');
    if (dateEl) dateEl.textContent = `${appt.day ? appt.day + '، ' : ''}${appt.date} - ${appt.time} (عن بُعد)`;

    const badgeEl = $('#pastDetailStatusBadge');
    if (badgeEl) {
      badgeEl.className = `appt-status-badge is-${appt.status}`;
      const iconHref = (appt.status === 'completed') ? '#i-check' : (appt.status === 'cancelled' ? '#i-x' : '#i-clock');
      badgeEl.innerHTML = `<svg class="icon ic-18"><use href="${iconHref}"/></svg><span>${appt.statusText || 'مكتمل'}</span>`;
    }

    const summaryEl = $('#pastDetailSummary');
    if (summaryEl) {
      summaryEl.textContent = appt.summary || 'تم استكمال محاور الجلسة بنجاح، ويوصى بمواصلة التمارين المحددة ومتابعة التقدم الدوري.';
    }

    const notesEl = $('#pastDetailNotes');
    if (notesEl) {
      notesEl.textContent = appt.notes || 'استشارة استرشادية سرية ضمن مسار التعافي والدعم النفسي.';
    }

    $('#pastApptDetailModal')?.classList.add('is-open');
  }

  function closePastDetailModal() {
    $('#pastApptDetailModal')?.classList.remove('is-open');
    activePastAppt = null;
  }

  $('#closePastDetailModalBtn')?.addEventListener('click', closePastDetailModal);
  $('#dismissPastDetailBtn')?.addEventListener('click', closePastDetailModal);

  $('#pastDetailRebookBtn')?.addEventListener('click', () => {
    if (activePastAppt) {
      const specId = activePastAppt.specialistId || 'sara';
      closePastDetailModal();
      openBookingModal(specId);
    }
  });

  // تفويض أحداث النقر العامة لأزرار المواعيد
  document.addEventListener('click', (e) => {
    const rescheduleBtn = e.target.closest('[data-open-reschedule]');
    if (rescheduleBtn) {
      e.preventDefault();
      openRescheduleModal(rescheduleBtn.dataset.openReschedule);
      return;
    }

    const cancelBtn = e.target.closest('[data-open-cancel]');
    if (cancelBtn) {
      e.preventDefault();
      openCancelConfirmModal(cancelBtn.dataset.openCancel);
      return;
    }

    const pastDetailBtn = e.target.closest('[data-open-past-detail]');
    if (pastDetailBtn) {
      e.preventDefault();
      openPastDetailModal(pastDetailBtn.dataset.openPastDetail);
      return;
    }

    const rebookBtn = e.target.closest('[data-rebook-spec]');
    if (rebookBtn) {
      e.preventDefault();
      openBookingModal(rebookBtn.dataset.rebookSpec);
      return;
    }

    const joinBtn = e.target.closest('[data-join-session]');
    if (joinBtn) {
      e.preventDefault();
      $('#sessionRoomModal')?.classList.add('is-open');
      return;
    }
  });

  $('#closeSessionRoomBtn')?.addEventListener('click', () => {
    $('#sessionRoomModal')?.classList.remove('is-open');
  });

  // ---------- المحادثة والدعم الخاص متعدد المحادثات (Confidential Multi-Chat System) ----------
  function scrollChatToBottom() {
    const box = $('#chatMessagesContainer');
    if (box) {
      setTimeout(() => { box.scrollTop = box.scrollHeight; }, 60);
    }
  }

  function renderConversationList(filterText = '') {
    const listEl = $('#conversationsList');
    if (!listEl) return;

    const q = (filterText || '').trim().toLowerCase();
    const chatKeys = Object.keys(state.multiChats);
    let visibleCount = 0;

    listEl.innerHTML = chatKeys.map(id => {
      const chat = state.multiChats[id];
      const matches = !q ||
        chat.name.toLowerCase().includes(q) ||
        chat.role.toLowerCase().includes(q) ||
        (chat.messages.length && chat.messages[chat.messages.length - 1].text.toLowerCase().includes(q));

      if (!matches) return '';
      visibleCount++;

      const isActive = state.activeChatId === id;
      const lastMsg = chat.messages[chat.messages.length - 1];
      const timeDisplay = chat.time || (lastMsg ? lastMsg.time : '');

      return `
        <button class="conversation-item ${isActive ? 'is-active' : ''}" data-chat-id="${chat.id}" role="tab" aria-selected="${isActive}">
          <div class="conv-avatar-wrap">
            ${chat.avatar ? `
              <img src="${chat.avatar}" alt="${escapeHtml(chat.name)}" class="conv-avatar-img" />
            ` : `
              <div class="conv-avatar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
            `}
            ${chat.isOnline ? `<span class="online-dot-badge" title="متصل الآن"></span>` : ''}
          </div>
          <div class="conv-info">
            <div class="conv-top-row">
              <span class="conv-name">${escapeHtml(chat.name)}</span>
              <span class="conv-time">${escapeHtml(timeDisplay)}</span>
            </div>
            <div class="conv-bottom-row">
              <span class="conv-role">${escapeHtml(chat.role)}</span>
              ${chat.unreadCount > 0 ? `
                <span class="conv-unread-badge" id="badge-${chat.id}">${chat.unreadCount}</span>
              ` : `
                <span class="conv-unread-badge" id="badge-${chat.id}" hidden>0</span>
              `}
            </div>
          </div>
        </button>
      `;
    }).join('');

    if (visibleCount === 0) {
      listEl.innerHTML = `
        <div class="text-center py-8 text-xs t-muted">
          <svg class="icon ic-24 mx-auto mb-2 opacity-50"><use href="#i-search"/></svg>
          <p>لا توجد محادثات مطابقة للبحث</p>
        </div>
      `;
    }

    const badge = $('#convCountBadge');
    if (badge) badge.textContent = String(chatKeys.length);
  }

  function renderChatHeader(chatId) {
    const chat = state.multiChats[chatId];
    if (!chat) return;

    const nameEl = $('#chatHeaderName');
    const roleEl = $('#chatHeaderRole');
    const avatarWrapEl = $('.chat-header-avatar-wrap');
    const statusPill = $('#chatHeaderStatusPill');

    if (nameEl) nameEl.textContent = chat.name;
    if (roleEl) roleEl.textContent = chat.role;

    if (avatarWrapEl) {
      if (chat.avatar) {
        avatarWrapEl.innerHTML = `
          <img id="chatHeaderAvatar" src="${chat.avatar}" alt="${escapeHtml(chat.name)}" class="chat-header-avatar" />
          ${chat.isOnline ? '<span class="online-dot-badge" id="chatHeaderOnlineDot"></span>' : ''}
        `;
      } else {
        avatarWrapEl.innerHTML = `
          <div class="conv-avatar-icon chat-header-avatar" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #10B981, #059669);color:#fff;width:44px;height:44px;border-radius:9999px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </div>
          ${chat.isOnline ? '<span class="online-dot-badge" id="chatHeaderOnlineDot"></span>' : ''}
        `;
      }
    }

    if (statusPill) {
      if (chat.isOnline) {
        statusPill.innerHTML = '<span class="pulse-dot"></span><span>متصلة الآن</span>';
        statusPill.style.display = 'inline-flex';
      } else {
        statusPill.innerHTML = '<span>غير متصلة حالياً</span>';
        statusPill.style.display = 'inline-flex';
      }
    }

    const typingAvatar = $('#typingAvatar');
    if (typingAvatar) {
      if (chat.avatar) {
        typingAvatar.src = chat.avatar;
        typingAvatar.style.display = 'block';
      } else {
        typingAvatar.src = 'assets/service-counseling.jpg';
      }
    }
  }

  function renderChat(chatId) {
    if (!chatId) chatId = state.activeChatId || 'sara';
    const chat = state.multiChats[chatId];
    if (!chat) return;

    renderChatHeader(chatId);

    const container = $('#chatMessagesContainer');
    if (!container) return;

    const currentUserName = state.user.username || 'المستفيد';
    const userFirstInitial = (currentUserName || 'م').trim().charAt(0) || 'م';
    const userDisplayName = getUserDisplayName(currentUserName);

    let html = `
      <div class="chat-date-separator">
        <span>اليوم</span>
      </div>
    `;

    html += chat.messages.map(msg => {
      if (msg.sender === 'user') {
        return `
          <div class="message-row is-user">
            <div class="message-avatar-wrap">
              <div class="message-avatar-monogram" title="${escapeHtml(currentUserName)}">
                ${escapeHtml(userFirstInitial)}
              </div>
            </div>
            <div class="message-bubble">
              <div class="message-sender-name">${escapeHtml(currentUserName)}</div>
              <div class="message-text">${formatMessageText(msg.text)}</div>
              ${msg.file ? `
                <div class="message-attached-file flex items-center gap-1.5 p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 text-xs font-bold mt-1 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  <span>${escapeHtml(msg.file.name)}</span>
                </div>
              ` : ''}
              <div class="message-meta">
                <span class="message-time">${escapeHtml(msg.time)}</span>
                <span class="check-marks" title="تمت القراءة">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-inline-start:-6px"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </div>
            </div>
          </div>
        `;
      } else {
        // رسالة الأخصائي أو الدعم مع مخاطبة المستفيد باسمه الحقيقي ديناميكياً
        let text = msg.text;
        if (text.includes('عبد الرحمن') && userDisplayName !== 'عبد الرحمن') {
          text = text.replace(/عبد الرحمن/g, userDisplayName);
        }

        return `
          <div class="message-row is-specialist">
            <div class="message-avatar-wrap">
              ${chat.avatar ? `
                <img src="${chat.avatar}" alt="${escapeHtml(chat.name)}" class="message-avatar-img" />
              ` : `
                <div class="message-avatar-monogram" style="background:linear-gradient(135deg, #10B981, #059669)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                </div>
              `}
            </div>
            <div class="message-bubble">
              <div class="message-sender-name" style="color: #17477F;">${escapeHtml(chat.name)}</div>
              <div class="message-text">${formatMessageText(text)}</div>
              <div class="message-meta">
                <span class="message-time">${escapeHtml(msg.time)}</span>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    container.innerHTML = html;
    scrollChatToBottom();
  }

  function switchConversation(chatId) {
    if (!state.multiChats[chatId]) return;
    state.activeChatId = chatId;
    state.multiChats[chatId].unreadCount = 0;
    setStorage(KEYS.MULTI_CHATS, state.multiChats);
    renderConversationList($('#convSearchInput')?.value || '');
    renderChat(chatId);
    document.body.classList.add('mobile-view-chat');
  }

  function sendChatMessage(text) {
    const chat = state.multiChats[state.activeChatId];
    if (!chat) return;

    const trimmed = (text || '').trim();
    if (!trimmed && !state.selectedFile) return;

    const timeStr = getCurrentArabicTime();
    const fileData = state.selectedFile ? {
      name: state.selectedFile.name,
      size: state.selectedFile.size
    } : null;

    chat.messages.push({
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: trimmed || (fileData ? `📎 ملف مرفق: ${fileData.name}` : ''),
      time: timeStr,
      status: 'read',
      file: fileData
    });
    chat.time = `اليوم ${timeStr}`;

    // تفريغ المدخلات والملف المرفق
    const input = $('#chatInput');
    if (input) input.value = '';
    state.selectedFile = null;
    const fileInput = $('#fileInput');
    if (fileInput) fileInput.value = '';
    const filePill = $('#attachedFilePill');
    if (filePill) filePill.classList.remove('is-active');

    setStorage(KEYS.MULTI_CHATS, state.multiChats);
    renderConversationList($('#convSearchInput')?.value || '');
    renderChat(state.activeChatId);

    // محاكاة مؤشر جاري الكتابة
    const indicator = $('#typingIndicator');
    setTimeout(() => {
      if (indicator) indicator.classList.add('is-active');
      scrollChatToBottom();
    }, 450);

    // محاكاة رد داعم مخصص من الأخصائي بمخاطبة المستفيد باسمه
    setTimeout(() => {
      if (indicator) indicator.classList.remove('is-active');

      const userDisplayName = getUserDisplayName(state.user.username);
      const templates = chat.autoReplies && chat.autoReplies.length ? chat.autoReplies : [
        'أسمعك بكل اهتمام يا عبد الرحمن، وتأكد أنني هنا دائماً لدعمك والوقوف بجانبك 🤍'
      ];
      const rawReply = templates[Math.floor(Math.random() * templates.length)];
      const reply = rawReply.replace(/عبد الرحمن/g, userDisplayName);

      const replyTime = getCurrentArabicTime();
      chat.messages.push({
        id: 'msg-' + (Date.now() + 1),
        sender: 'specialist',
        text: reply,
        time: replyTime
      });
      chat.time = `اليوم ${replyTime}`;

      setStorage(KEYS.MULTI_CHATS, state.multiChats);
      renderConversationList($('#convSearchInput')?.value || '');
      renderChat(state.activeChatId);
      showToast(`رسالة جديدة من ${chat.name} 💬`);
    }, 1700);
  }

  // مستمعات تبديل المحادثة
  document.addEventListener('click', (e) => {
    const convBtn = e.target.closest('[data-chat-id]');
    if (convBtn) {
      const chatId = convBtn.dataset.chatId;
      if (chatId) {
        switchConversation(chatId);
      }
    }
  });

  // زر العودة لقائمة المحادثات في وضع الجوال
  $('#mobileBackBtn')?.addEventListener('click', () => {
    document.body.classList.remove('mobile-view-chat');
  });

  // إرسال نموذج المحادثة
  $('#chatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#chatInput');
    if (input) {
      sendChatMessage(input.value);
    }
  });

  // إدارة الرموز التعبيرية
  const emojiBtn = $('#emojiBtn');
  const emojiPopover = $('#emojiPopover');
  emojiBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = emojiPopover?.classList.toggle('is-open');
    emojiBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-btn');
    if (btn) {
      const emoji = btn.dataset.emoji;
      const input = $('#chatInput');
      if (input && emoji) {
        input.value += emoji;
        input.focus();
      }
      return;
    }

    if (!e.target.closest('#emojiPopover, #emojiBtn')) {
      emojiPopover?.classList.remove('is-open');
      emojiBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // إدارة إرفاق الملفات
  const attachBtn = $('#attachBtn');
  const fileInput = $('#fileInput');
  const attachedFilePill = $('#attachedFilePill');
  const attachedFileName = $('#attachedFileName');
  const removeAttachBtn = $('#removeAttachBtn');

  attachBtn?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      state.selectedFile = fileInput.files[0];
      if (attachedFileName) attachedFileName.textContent = state.selectedFile.name;
      attachedFilePill?.classList.add('is-active');
      $('#chatInput')?.focus();
    }
  });

  removeAttachBtn?.addEventListener('click', () => {
    state.selectedFile = null;
    if (fileInput) fileInput.value = '';
    attachedFilePill?.classList.remove('is-active');
  });

  // قائمة خيارات المحادثة الثلاثية
  const chatOptionsBtn = $('#chatOptionsBtn');
  const chatOptionsMenu = $('#chatOptionsMenu');

  chatOptionsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = chatOptionsMenu?.classList.toggle('is-open');
    chatOptionsBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#chatOptionsMenu, #chatOptionsBtn')) {
      chatOptionsMenu?.classList.remove('is-open');
      chatOptionsBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  $('#optSpecialistInfo')?.addEventListener('click', () => {
    chatOptionsMenu?.classList.remove('is-open');
    const chat = state.multiChats[state.activeChatId];
    if (chat) {
      if (chat.id === 'sara' || chat.id === 'noura') {
        openBookingModal(chat.id);
      } else {
        showToast('فريق الدعم الفني متواجد 24/7 لضمان سرية وخصوصية بياناتكم.');
      }
    }
  });

  $('#optMuteChat')?.addEventListener('click', () => {
    chatOptionsMenu?.classList.remove('is-open');
    const chat = state.multiChats[state.activeChatId];
    if (chat) {
      chat.isMuted = !chat.isMuted;
      showToast(chat.isMuted ? 'تم كتم إشعارات المحادثة ' : 'تم تفعيل إشعارات المحادثة 🔔');
      setStorage(KEYS.MULTI_CHATS, state.multiChats);
    }
  });

  $('#optClearChat')?.addEventListener('click', () => {
    chatOptionsMenu?.classList.remove('is-open');
    const chat = state.multiChats[state.activeChatId];
    if (chat) {
      if (confirm('هل ترغب في مسح سجل هذه المحادثة؟')) {
        chat.messages = [];
        setStorage(KEYS.MULTI_CHATS, state.multiChats);
        renderChat(state.activeChatId);
        renderConversationList($('#convSearchInput')?.value || '');
        showToast('تم مسح سجل المحادثة بنجاح.');
      }
    }
  });

  // شريط البحث المباشر في قائمة المحادثات
  $('#convSearchInput')?.addEventListener('input', (e) => {
    renderConversationList(e.target.value);
  });

  // ---------- الإشعارات المنبثقة (Notifications Dropdown Manager) ----------
  function updateNotifBadge() {
    const unread = state.notifications.filter(n => !n.read).length;
    const badge = $('#headerNotifBadge');
    const popCount = $('#popNotifCount');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'grid' : 'none';
    }
    if (popCount) {
      popCount.textContent = unread > 0 ? `${unread} جديدة` : 'لا توجد جديدة';
    }
  }

  function renderNotifications() {
    const list = $('#notifCardList');
    if (!list) return;

    if (!state.notifications.length) {
      list.innerHTML = `
        <div class="text-center py-6 text-xs t-muted">
          <svg class="icon ic-32 mx-auto mb-2 opacity-50"><use href="#i-bell"/></svg>
          <p>لا توجد إشعارات حالياً.</p>
        </div>
      `;
      updateNotifBadge();
      return;
    }

    list.innerHTML = state.notifications.map(n => `
      <div class="notif-mini-item ${!n.read ? 'is-unread' : ''}" id="popNotif-${n.id}">
        <div class="notif-unread-dot" ${n.read ? 'style="opacity:0"' : ''}></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-bold text-xs text-ink truncate">${n.title}</h4>
            <span class="text-[10px] t-muted whitespace-nowrap">${n.time}</span>
          </div>
          <p class="text-xs t-body mt-0.5 line-clamp-2">${n.desc}</p>
        </div>
        <button class="icon-btn icon-btn-sm text-muted hover:text-rose-500 flex-shrink-0" data-delete-notif="${n.id}" title="حذف الإشعار">
          <svg class="icon ic-16"><use href="#i-x"/></svg>
        </button>
      </div>
    `).join('');

    updateNotifBadge();
  }

  $('#markAllNotifsReadBtn')?.addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true);
    setStorage(KEYS.NOTIFS, state.notifications);
    renderNotifications();
    showToast('تم تحديد جميع الإشعارات كمقروءة.');
  });

  document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-delete-notif]');
    if (delBtn) {
      const id = delBtn.dataset.deleteNotif;
      state.notifications = state.notifications.filter(n => n.id !== id);
      setStorage(KEYS.NOTIFS, state.notifications);
      renderNotifications();
    }
  });

  // ---------- حفظ الملف الشخصي وتغيير كلمة المرور وتحديث الصورة ----------
  let profileAutoSaveTimer = null;
  function handleProfileAutoSave() {
    clearTimeout(profileAutoSaveTimer);
    profileAutoSaveTimer = setTimeout(() => {
      saveProfileData(true);
    }, 450);
  }

  function saveProfileData(isAuto = false) {
    if (!$('#profileUsername')) return;

    state.user.username = $('#profileUsername').value.trim() || state.user.username;
    state.user.email = $('#profileEmail').value.trim();
    state.user.phone = $('#profilePhone').value.trim();
    state.user.age = $('#profileAge').value.trim();
    state.user.recoveryStart = $('#profileRecoveryDate').value;
    state.user.emergencyContact = $('#profileEmergency').value.trim();

    setStorage(KEYS.USER, state.user);
    renderUserData();
    updateRecoveryStats();
    renderChat(state.activeChatId);

    // تحديث مباشر في قاعدة بيانات Supabase
    if (window.MaladhDB && window.MaladhDB.auth && state.user.id) {
      window.MaladhDB.auth.updateProfile(state.user.id, {
        full_name: state.user.username,
        phone: state.user.phone,
        age: parseInt(state.user.age, 10) || null,
        emergency_contact: state.user.emergencyContact
      }).catch(err => console.warn('[Supabase Profile Update Error]:', err));
    }
    if (window.MaladhDB && window.MaladhDB.recovery && state.user.id && state.user.recoveryStart) {
      window.MaladhDB.recovery.save(state.user.id, {
        start_date: state.user.recoveryStart
      }).catch(err => console.warn(err));
    }

    const hint = $('#profileSaveStatusHint');
    if (hint) {
      const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      hint.innerHTML = `
        <svg class="icon ic-16 text-emerald-500 animate-pulse"><use href="#i-check" /></svg>
        <span class="text-emerald-600 font-bold">تم حفظ وتحديث المعلومات تلقائياً (${nowStr})</span>
      `;
    }

    if (!isAuto) {
      showToast('تم حفظ وتعديل كافة معلومات الملف الشخصي بنجاح ✨');
    }
  }

  $('#profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileData(false);
  });

  // حفظ تلقائي مباشر عند تعديل أي حقل من حقول الملف الشخصي
  ['profileUsername', 'profileEmail', 'profilePhone', 'profileAge', 'profileRecoveryDate', 'profileEmergency'].forEach(fId => {
    const el = document.getElementById(fId);
    if (el) {
      el.addEventListener('input', handleProfileAutoSave);
      el.addEventListener('change', handleProfileAutoSave);
    }
  });

  // إضافة وتغيير الصورة الشخصية للمستفيد
  $('#changeAvatarBtn')?.addEventListener('click', () => {
    $('#profileAvatarInput')?.click();
  });
  $('#triggerAvatarUploadBtn')?.addEventListener('click', () => {
    $('#profileAvatarInput')?.click();
  });

  $('#profileAvatarInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، الحد الأقصى 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      state.user.avatar = evt.target.result;
      setStorage(KEYS.USER, state.user);
      renderUserData();
      showToast('تمت إضافة وتحديث الصورة الشخصية بنجاح ✨');
    };
    reader.readAsDataURL(file);
  });

  // إزالة الصورة والعودة للحرف الرمزي
  $('#removeAvatarBtn')?.addEventListener('click', () => {
    delete state.user.avatar;
    setStorage(KEYS.USER, state.user);
    renderUserData();
    showToast('تمت إزالة الصورة الشخصية والعودة للافتراضي.');
  });

  $('#passwordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldP = $('#oldPass').value;
    const newP = $('#newPass').value;
    const confP = $('#confPass').value;

    if (!oldP || !newP || !confP) {
      showToast('يرجى تعبئة كافة حقول كلمة المرور.');
      return;
    }
    if (newP !== confP) {
      showToast('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (newP.length < 8) {
      showToast('يجب ألا تقل كلمة المرور عن 8 خانات.');
      return;
    }

    $('#oldPass').value = '';
    $('#newPass').value = '';
    $('#confPass').value = '';
    showToast('تم تغيير كلمة المرور بنجاح 🔒');
  });

  // وضع التصفح بهوية مجهولة
  $('#incognitoSwitch')?.addEventListener('click', () => {
    state.user.incognito = !state.user.incognito;
    setStorage(KEYS.USER, state.user);
    $('#incognitoSwitch').classList.toggle('is-on', state.user.incognito);
    $('#incognitoSwitch').setAttribute('aria-checked', String(state.user.incognito));
    showToast(state.user.incognito ? 'تم تفعيل وضع السرية وإخفاء الهوية الكامل 🛡️' : 'تم تعطيل وضع السرية.');
  });

  // ---------- إعدادات المنصة: المظهر والخط واللغة وتسجيل الخروج ----------
  const prefs = getStorage(KEYS.PREFS, {
    theme: document.documentElement.dataset.theme || 'light',
    lang: 'ar',
    font: 'normal'
  });

  function applyTheme(theme) {
    prefs.theme = theme;
    document.documentElement.dataset.theme = theme;
    setStorage(KEYS.PREFS, prefs);
    syncSettingsUI();
    showToast(theme === 'dark' ? 'تم تفعيل الوضع الداكن ' : 'تم تفعيل الوضع الفاتح ');
  }

  function applyFont(size) {
    prefs.font = size;
    document.documentElement.dataset.font = size;
    setStorage(KEYS.PREFS, prefs);
    syncSettingsUI();
    showToast('تم تحديث حجم الخط.');
  }

  function applyLang(lang) {
    prefs.lang = lang;
    setStorage(KEYS.PREFS, prefs);
    syncSettingsUI();
    showToast(lang === 'ar' ? 'تم اختيار اللغة العربية' : 'Language set to English');
  }

  function syncSettingsUI() {
    $$('[data-set-theme]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setTheme === prefs.theme)));
    $$('[data-set-font]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setFont === prefs.font)));
    $$('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === prefs.lang)));
    const icon = $('#themeLabelIcon use');
    if (icon) icon.setAttribute('href', prefs.theme === 'dark' ? '#i-moon' : '#i-sun');
  }

  document.addEventListener('click', (e) => {
    const themeBtn = e.target.closest('[data-set-theme]');
    if (themeBtn) {
      applyTheme(themeBtn.dataset.setTheme);
      return;
    }
    const fontBtn = e.target.closest('[data-set-font]');
    if (fontBtn) {
      applyFont(fontBtn.dataset.setFont);
      return;
    }
    const langBtn = e.target.closest('[data-set-lang]');
    if (langBtn) {
      applyLang(langBtn.dataset.setLang);
      return;
    }
  });

  // تسجيل الخروج (من بطاقة الإعدادات أو القائمة المنسدلة)
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-dash-logout]')) {
      e.preventDefault();
      if (confirm('هل ترغب حقاً في تسجيل الخروج من مساحتك في ملاذ؟')) {
        showToast('إلى اللقاء، ننتظر عودتك دائماً بكل حب');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      }
    }
  });

  // تفاصيل الأخصائي وإعادة الجدولة
  document.addEventListener('click', (e) => {
    const profBtn = e.target.closest('[data-spec-profile]');
    if (profBtn) {
      const id = profBtn.dataset.specProfile;
      const s = SPECIALISTS_LIST.find(x => x.id === id);
      if (s) {
        openBookingModal(s.id);
      }
    }

    const reschedBtn = e.target.closest('[data-reschedule]');
    if (reschedBtn) {
      const id = reschedBtn.dataset.reschedule;
      const a = state.appointments.find(x => x.id === id);
      if (a) {
        openBookingModal(a.specialistId);
        showToast('حدد موعداً جديداً لإعادة الجدولة.');
      }
    }
  });

  // ---------- الاستجابة لتغير الـ Hash في الرابط ----------
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (h && h !== state.currentView) {
      switchView(h);
    }
  });

  // ---------- مزامنة بيانات المستفيد ديناميكياً مع Supabase ----------
  async function syncWithSupabase() {
    if (!window.MaladhDB) return;
    try {
      const u = getStorage(KEYS.USER, null);
      if (u && u.id && window.MaladhDB.auth) {
        // 1. مزامنة الملف الشخصي
        const profile = await window.MaladhDB.auth.getProfile(u.id);
        if (profile) {
          state.user.username = profile.full_name || state.user.username;
          state.user.email = profile.email || state.user.email;
          state.user.phone = profile.phone || state.user.phone;
          state.user.age = profile.age || state.user.age;
          state.user.emergencyContact = profile.emergency_contact || state.user.emergencyContact;
          setStorage(KEYS.USER, state.user);
          renderUserData();
        }

        // 2. مزامنة رحلة التعافي
        if (window.MaladhDB.recovery) {
          const rec = await window.MaladhDB.recovery.get(u.id);
          if (rec) {
            state.recovery.startDate = rec.start_date || state.recovery.startDate;
            state.recovery.dailySpending = Number(rec.daily_savings) || state.recovery.dailySpending;
            state.recovery.targetDays = rec.target_days || state.recovery.targetDays;
            setStorage(KEYS.RECOVERY, state.recovery);
            updateRecoveryStats();
          }
        }

        // 3. مزامنة المواعيد
        if (window.MaladhDB.appointments) {
          const appts = await window.MaladhDB.appointments.getAll({ role: 'beneficiary', userId: u.id });
          if (appts && appts.length > 0) {
            state.appointments = appts.map(a => ({
              id: a.id,
              day: 'اليوم',
              date: a.appointment_date,
              rawDate: a.appointment_date,
              time: a.appointment_time,
              status: a.status,
              statusText: a.status === 'confirmed' ? 'موعد مؤكد' : (a.status === 'completed' ? 'مكتمل' : (a.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار')),
              specialistId: a.specialist_id,
              specialistName: (a.specialist && a.specialist.profile && a.specialist.profile.full_name) || 'الأخصائي النفسي',
              specialistRole: (a.specialist && a.specialist.specialty) || 'استشارات نفسية',
              specialistPhoto: (a.specialist && a.specialist.profile && a.specialist.profile.avatar_url) || 'assets/specialist-sara.jpg',
              sessionTitle: a.session_title || 'جلسة استشارية نفسية',
              type: a.type || 'عن بُعد',
              notes: a.notes || ''
            }));
            setStorage(KEYS.APPOINTMENTS, state.appointments);
            renderAppointments();
          }
        }
      }

      // 4. جلب قائمة الأخصائيين المعتمدين ديناميكياً
      if (window.MaladhDB.specialists) {
        const liveSpecialists = await window.MaladhDB.specialists.getAll({ verifiedOnly: true });
        if (liveSpecialists && liveSpecialists.length > 0) {
          SPECIALISTS_LIST.length = 0;
          liveSpecialists.forEach(item => {
            SPECIALISTS_LIST.push({
              id: item.id,
              name: (item.profiles && item.profiles.full_name) || item.name || 'د. سارة العتيبي',
              title: item.title || item.specialty || 'أخصائية نفسية',
              qualifications: item.qualification || 'ماجستير في علم النفس',
              experience: item.experience_years || '8+ سنوات خبرة',
              rating: Number(item.rating) || 4.9,
              photo: (item.profiles && item.profiles.avatar_url) || item.avatar || 'assets/specialist-sara.jpg',
              specialty: (item.specialty && item.specialty.includes('إدمان')) ? 'recovery' : 'therapy'
            });
          });
          renderSpecialists();
        }
      }
    } catch (err) {
      console.warn('[Beneficiary Portal] Supabase sync notice:', err.message);
    }
  }

  // ---------- بدء تشغيل الواجهة (Initialization) ----------
  function init() {
    renderUserData();
    updateRecoveryStats();
    renderSpecialists();
    renderAppointments();
    renderConversationList();
    renderChat(state.activeChatId);
    renderNotifications();
    updateNotifBadge();
    syncSettingsUI();
    startHeroQuoteTimer();

    // تشغيل مزامنة Supabase في الخلفية
    syncWithSupabase();

    // فحص الصفحة والعنوان الحالي
    const currentPage = getCurrentPageName();
    const initialHash = window.location.hash.replace('#', '');
    const defaultView = (currentPage !== 'dashboard') ? currentPage : 'home';
    switchView(initialHash || defaultView);
  }

  // تشغيل عند اكتمال تحميل DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
