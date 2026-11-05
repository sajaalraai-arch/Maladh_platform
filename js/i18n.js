/* ===== أدوات مساعدة + التفضيلات + الترجمة (عربي / English) ===== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- التفضيلات (تُحفظ في المتصفح) ----------
const PREFS_KEY = 'maladh:prefs';
const prefs = Object.assign({ lang: 'ar', theme: null, font: 'normal', reduce: false }, (() => {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (e) { return {}; }
})());
function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} }

// ---------- النصوص الإنجليزية للعناصر الثابتة ----------
// النصوص العربية موجودة في index.html نفسه، وتُستعاد عند اختيار العربية.
const EN = {
  'brand': 'Maladh',
  'n.aria': 'Main navigation', 'n.home.aria': 'Maladh - Home',
  'n.home': 'Home', 'n.services': 'Services', 'n.specialists': 'Specialists', 'n.about': 'About Maladh',
  'n.login': 'Log in', 'n.search': 'Search', 'n.settings': 'Settings', 'n.menu': 'Menu',
  's.btn': 'Search',
  'h.alt': 'A psychologist holding a calm counselling session with a young woman in a cozy consultation room',
  'h.eyebrow': 'Your safe space starts here', 'h.title': 'Because you deserve to be well',
  'h.desc': 'At Maladh, we support your journey to peace of mind and stand by you in recovering from addiction.',
  'h.book': 'Book your consultation', 'h.services': 'Our services',
  'f.aria': 'Maladh features',
  'f.1': 'Trusted psychological<br />consultations online', 'f.2': 'Recovery support programs<br />for a better life',
  'f.3': 'Specialized professional<br />support, high standards', 'f.4': 'Privacy and security<br />in all our services',
  'sv.eyebrow': 'Your first step starts here', 'sv.title': 'Choose the support that fits your journey',
  'sv.desc': 'Whether you are looking for peace of mind or working toward recovery, Maladh gives you a safe space to begin your journey to a better life.',
  'sv.c1.t': 'Psychological Counselling',
  'sv.c1.d': 'Talk to a qualified psychologist and begin understanding your feelings and improving your mental health in a safe space that respects your privacy.',
  'sv.c1.aria': 'Show booking option: Psychological Counselling',
  'sv.c2.t': 'Addiction Recovery Support',
  'sv.c2.d': 'Take a new step toward recovery, with the right support and guidance to build healthy habits and move toward a better life.',
  'sv.c2.aria': 'Show booking option: Addiction Recovery Support',
  'sv.book': 'Book your consultation',
  'hw.eyebrow': 'How to begin?', 'hw.title': 'Three simple steps toward your comfort',
  'hw.1.t': 'Create your account', 'hw.1.d': 'Register your basic details in minutes, in complete confidentiality.',
  'hw.2.t': 'Choose your specialist', 'hw.2.d': 'Browse verified specialists and pick the one who fits your needs.',
  'hw.3.t': 'Begin your journey', 'hw.3.d': 'Book your online session and take your first step toward recovery.',
  'sp.eyebrow': 'Meet the specialists who support you', 'sp.title': 'Qualified specialists to support your journey',
  'sp.desc': 'Discover qualified mental health and recovery specialists, and choose the one who suits your needs:',
  'sp.search': 'Search for a specialist...', 'sp.search.l': 'Search for a specialist',
  'sp.specialty': 'Specialty', 'sp.opt.therapy': 'Clinical psychology', 'sp.opt.recovery': 'Addiction recovery support',
  'sp.service': 'Service type', 'sp.remote': 'Online consultations',
  'ab.eyebrow': 'About Maladh', 'ab.title': 'A safe space where your journey begins',
  'ab.text': 'Maladh is a platform dedicated to psychological counselling and addiction recovery support. We bring together verified specialists and support programs that help you regain your balance with privacy and safety.',
  'ab.v1.t': 'Complete privacy and confidentiality', 'ab.v1.d': 'Your data and sessions are protected by high security standards.',
  'ab.v2.t': 'Verified specialists', 'ab.v2.d': 'Experienced, qualified professionals in mental health and recovery.',
  'ab.v3.t': 'Support that stays with you', 'ab.v3.d': 'We support you at every step, with empathy and without judgment.',
  'ct.title': 'Start your journey toward a better you today',
  'ct.desc': 'One step away from a safe space that listens and supports you.',
  'ct.signup': 'Create account', 'ct.browse': 'Browse specialists',
  'ft.tagline': 'Your safe space toward peace of mind and recovery.',
  'ft.links': 'Quick links', 'ft.services': 'Our services', 'ft.contact': 'Contact us',
  'ft.emergency': 'Maladh is not an emergency service. In an emergency, contact your local emergency services.',
  'ft.rights': '© 2026 Maladh. All rights reserved.', 'ft.privacy': 'Your privacy and safety come first', 'ft.top': 'Back to top',
  'st.title': 'Settings', 'st.close': 'Close', 'st.lang': 'Language', 'st.theme': 'Appearance',
  'st.light': 'Light', 'st.dark': 'Dark', 'st.font': 'Font size', 'st.small': 'Small', 'st.normal': 'Normal', 'st.large': 'Large',
  'st.motion': 'Reduce motion', 'st.note': 'Your preferences are saved automatically on this device.',
  'a.logout': 'Log out', 'a.notice': 'Log in or create an account to book your consultation.',
  'a.login': 'Log in', 'a.register': 'Create account',
  'a.identifier': 'Username or email', 'a.username': 'Username', 'a.email': 'Email', 'a.age': 'Age',
  'a.password': 'Password', 'a.confirm': 'Confirm password', 'a.show': 'Show password',
  'a.forgot': 'Forgot your password?', 'a.terms': 'I agree to the terms and privacy policy',
  'a.submit.login': 'Log in', 'a.submit.register': 'Create account',
  'a.noacc': "Don't have an account?", 'a.haveacc': 'Already have an account?'
};

// ---------- نصوص ديناميكية (تُنشأ بالجافاسكربت) بالعربية والإنجليزية ----------
const DYN = {
  ar: {
    'title': 'ملاذ | Maladh',
    'auth.login.title': 'أهلًا بعودتك', 'auth.login.sub': 'سجّل الدخول لمتابعة رحلتك.',
    'auth.register.title': 'انضم إلى ملاذ', 'auth.register.sub': 'أنشئ حسابك وابدأ خطوتك الأولى بسرية تامة.',
    'err.required': 'هذا الحقل مطلوب.', 'err.identifier': 'أدخل اسم المستخدم أو البريد الإلكتروني.',
    'err.username': 'اسم المستخدم من 3 إلى 20 حرفًا (حروف أو أرقام أو _ . -).',
    'err.email': 'أدخل بريدًا إلكترونيًا صحيحًا.', 'err.age': 'أدخل عمرًا صحيحًا بين {min} و{max}.',
    'err.password': 'كلمة المرور 8 أحرف على الأقل وتحتوي على حروف وأرقام.',
    'err.confirm': 'كلمتا المرور غير متطابقتين.', 'err.terms': 'يجب الموافقة للمتابعة.',
    'pw.0': '', 'pw.1': 'ضعيفة', 'pw.2': 'متوسطة', 'pw.3': 'قوية',
    'pw.show': 'إظهار كلمة المرور', 'pw.hide': 'إخفاء كلمة المرور',
    'toast.welcome': 'مرحبًا {name}، تم تسجيل الدخول بنجاح.', 'toast.created': 'أهلًا بك في ملاذ {name}، تم إنشاء حسابك.',
    'toast.bye': 'تم تسجيل الخروج.', 'toast.soon': 'هذه الصفحة قيد الإنشاء.', 'toast.book': 'صفحة الحجز قيد الإنشاء.',
    'toast.forgot': 'استعادة كلمة المرور ستتوفر قريبًا.', 'toast.saved': 'تم حفظ الإعدادات.',
    'sp.verified': 'مختص موثق', 'sp.qual': 'المؤهل', 'sp.exp': 'الخبرة', 'sp.remoteTag': 'استشارات عن بُعد',
    'sp.book': 'احجز استشارتك', 'sp.profile': 'عرض الملف الشخصي', 'sp.photo': 'صورة',
    'sp.emptyT': 'لا يوجد مختصون مطابقون', 'sp.emptyD': 'جرّب تغيير كلمات البحث أو إعادة ضبط التصفية.',
    'sp.count': 'عدد المختصين المعروضين: {n}', 'pg.prev': 'الصفحة السابقة', 'pg.next': 'الصفحة التالية', 'pg.page': 'الصفحة {n}'
  },
  en: {
    'title': 'Maladh | ملاذ',
    'auth.login.title': 'Welcome back', 'auth.login.sub': 'Log in to continue your journey.',
    'auth.register.title': 'Join Maladh', 'auth.register.sub': 'Create your account and take your first step, in full confidentiality.',
    'err.required': 'This field is required.', 'err.identifier': 'Enter your username or email.',
    'err.username': 'Username must be 3–20 characters (letters, numbers, _ . -).',
    'err.email': 'Enter a valid email address.', 'err.age': 'Enter a valid age between {min} and {max}.',
    'err.password': 'Password must be at least 8 characters with letters and numbers.',
    'err.confirm': 'Passwords do not match.', 'err.terms': 'You must agree to continue.',
    'pw.0': '', 'pw.1': 'Weak', 'pw.2': 'Medium', 'pw.3': 'Strong',
    'pw.show': 'Show password', 'pw.hide': 'Hide password',
    'toast.welcome': 'Welcome {name}, you are now logged in.', 'toast.created': 'Welcome to Maladh, {name}. Your account was created.',
    'toast.bye': 'You have been logged out.', 'toast.soon': 'This page is under construction.', 'toast.book': 'The booking page is under construction.',
    'toast.forgot': 'Password recovery is coming soon.', 'toast.saved': 'Settings saved.',
    'sp.verified': 'Verified specialist', 'sp.qual': 'Qualification', 'sp.exp': 'Experience', 'sp.remoteTag': 'Online consultations',
    'sp.book': 'Book your consultation', 'sp.profile': 'View profile', 'sp.photo': 'Photo of',
    'sp.emptyT': 'No matching specialists', 'sp.emptyD': 'Try changing your search words or resetting the filters.',
    'sp.count': 'Specialists shown: {n}', 'pg.prev': 'Previous page', 'pg.next': 'Next page', 'pg.page': 'Page {n}'
  }
};

let currentLang = 'ar';
function t(key, vars) {
  let s = (DYN[currentLang] && DYN[currentLang][key]) ?? DYN.ar[key] ?? key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

// نحفظ النص العربي الأصلي لكل عنصر ليُستعاد عند الرجوع للعربية
const ORIGINAL = new WeakMap();
function original(el) {
  if (!ORIGINAL.has(el)) {
    ORIGINAL.set(el, {
      text: el.dataset.i18n ? el.textContent : null,
      html: el.dataset.i18nHtml ? el.innerHTML : null,
      ph: el.dataset.i18nPh ? el.getAttribute('placeholder') : null,
      aria: el.dataset.i18nAria ? el.getAttribute('aria-label') : null,
      alt: el.dataset.i18nAlt ? el.getAttribute('alt') : null
    });
  }
  return ORIGINAL.get(el);
}

function applyI18n() {
  const en = currentLang === 'en';
  const pick = (key, ar) => (en && EN[key] !== undefined ? EN[key] : ar);
  $$('[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-aria],[data-i18n-alt]').forEach((el) => {
    const o = original(el);
    if (o.text !== null)  el.textContent = pick(el.dataset.i18n, o.text);
    if (o.html !== null)  el.innerHTML = pick(el.dataset.i18nHtml, o.html);
    if (o.ph !== null)    el.setAttribute('placeholder', pick(el.dataset.i18nPh, o.ph));
    if (o.aria !== null)  el.setAttribute('aria-label', pick(el.dataset.i18nAria, o.aria));
    if (o.alt !== null)   el.setAttribute('alt', pick(el.dataset.i18nAlt, o.alt));
  });
}

function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';
  const root = document.documentElement;
  root.lang = currentLang;
  root.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('title');
  applyI18n();
  window.dispatchEvent(new CustomEvent('langchange', { detail: currentLang }));
}
