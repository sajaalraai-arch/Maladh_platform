/* ===== تسجيل الدخول / إنشاء حساب (واجهة فقط — اربطها بالخادم لاحقًا) ===== */
const MIN_AGE = 16, MAX_AGE = 100;           // غيّر الحدود هنا
const USER_KEY = 'maladh:user';

const authDialog = $('#authDialog');
const loginForm = $('#loginForm');
const registerForm = $('#registerForm');
let authMode = 'login';

// ---------- حالة المستخدم (لا تُخزَّن كلمة المرور أبدًا) ----------
function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
function setUser(u) { try { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); } catch (e) {} }

function renderAuthState() {
  const u = getUser();
  $('#loginIcon').classList.toggle('hidden', !u);
  const label = $('#loginLabel');
  if (u) {
    label.removeAttribute('data-i18n');
    label.textContent = u.username;
    $('#umName').textContent = u.username;
    $('#umEmail').textContent = u.email || '';
  } else {
    label.setAttribute('data-i18n', 'n.login');
    label.textContent = currentLang === 'en' ? EN['n.login'] : 'تسجيل الدخول';
    PANELS.user.el.classList.remove('is-open');
  }
}

// ---------- فتح / إغلاق النافذة ----------
function setAuthMode(mode) {
  authMode = mode;
  loginForm.hidden = mode !== 'login';
  registerForm.hidden = mode !== 'register';
  $$('[data-auth-tab].seg-btn').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.authTab === mode)));
  $$('.seg-btn[data-auth-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.authTab === mode)));
  $('#authTitle').textContent = t('auth.' + mode + '.title');
  $('#authSub').textContent = t('auth.' + mode + '.sub');
}
function openAuth(mode, withNotice) {
  closePanels();
  setAuthMode(mode || 'login');
  $('#authNotice').hidden = !withNotice;
  if (!authDialog.open) authDialog.showModal();
  root.classList.add('modal-open');
  const first = (mode === 'register' ? registerForm : loginForm).querySelector('input');
  setTimeout(() => first && first.focus(), 50);
}
function closeAuth() { if (authDialog.open) authDialog.close(); }
authDialog.addEventListener('close', () => root.classList.remove('modal-open'));
authDialog.addEventListener('click', (e) => { if (e.target === authDialog) closeAuth(); }); // النقر على الخلفية
$('#authClose').addEventListener('click', closeAuth);

// الأزرار: تبديل التبويب / فتح التسجيل / زر الدخول في الشريط
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-auth-tab]');
  if (tab) { setAuthMode(tab.dataset.authTab); return; }
  const open = e.target.closest('[data-open-auth]');
  if (open) { e.preventDefault(); openAuth(open.dataset.openAuth); return; }
  const book = e.target.closest('[data-book]');
  if (book) { e.preventDefault(); requestBooking(book.dataset.book); }
});
$('#loginBtn').addEventListener('click', () => { getUser() ? togglePanel('user') : openAuth('login'); });
$('#logoutBtn').addEventListener('click', () => { setUser(null); renderAuthState(); closePanels(); showToast(t('toast.bye')); });
$('#forgotLink').addEventListener('click', (e) => { e.preventDefault(); showToast(t('toast.forgot')); });

// الحجز يتطلب حسابًا: نفتح نافذة الدخول مع تنبيه، أو نعرض رسالة مؤقتة إن كان مسجلًا
function requestBooking(kind) {
  if (getUser()) showToast(t('toast.book'));   // TODO: وجّه المستخدم إلى صفحة الحجز: booking-<kind>.html
  else openAuth('login', true);
}

// ---------- التحقق من الحقول ----------
const RULES = {
  required:   (v) => v.trim() !== '' || 'required',
  identifier: (v) => v.trim().length >= 3 || (v.trim() === '' ? 'required' : 'identifier'),
  username:   (v) => v.trim() === '' ? 'required' : (/^[\p{L}\p{N}_.-]{3,20}$/u.test(v.trim()) || 'username'),
  email:      (v) => v.trim() === '' ? 'required' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'email'),
  age:        (v) => v.trim() === '' ? 'required' : ((Number.isInteger(+v) && +v >= MIN_AGE && +v <= MAX_AGE) || 'age'),
  password:   (v) => v === '' ? 'required' : ((v.length >= 8 && /[A-Za-z\u0600-\u06FF]/.test(v) && /\d/.test(v)) || 'password'),
  confirm:    (v, form) => v === '' ? 'required' : (v === form.elements.password.value || 'confirm'),
  terms:      (v, form, el) => el.checked || 'terms'
};

function showError(input, code) {
  const field = input.closest('.field');
  const msg = field.querySelector('.field-error');
  field.classList.toggle('has-error', !!code);
  input.setAttribute('aria-invalid', code ? 'true' : 'false');
  msg.textContent = code ? t('err.' + code, { min: MIN_AGE, max: MAX_AGE }) : '';
  if (code) msg.dataset.code = code; else delete msg.dataset.code;
}
function validate(input) {
  const rule = RULES[input.dataset.rule];
  if (!rule) return true;
  const res = rule(input.value, input.form, input);
  showError(input, res === true ? '' : res);
  return res === true;
}

[loginForm, registerForm].forEach((form) => {
  $$('input[data-rule]', form).forEach((input) => {
    input.addEventListener('blur', () => { if (input.value !== '' || input.dataset.touched) validate(input); input.dataset.touched = '1'; });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validate(input); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = $$('input[data-rule]', form);
    const results = inputs.map((i) => validate(i));
    const bad = inputs[results.indexOf(false)];
    if (bad) { bad.focus(); return; }
    submitForm(form);
  });
});
// تأكيد كلمة المرور يُعاد فحصه عند تغيير كلمة المرور
$('#r-pass').addEventListener('input', () => { if ($('#r-confirm').value) validate($('#r-confirm')); });

// ---------- قوة كلمة المرور ----------
$('#r-pass').addEventListener('input', (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Za-z\u0600-\u06FF]/.test(v) && /\d/.test(v)) score++;
  if (v.length >= 12 || /[^\p{L}\p{N}]/u.test(v)) score++;
  if (!v) score = 0;
  $('#strength').dataset.score = score;
  $('#r-strength').textContent = t('pw.' + score);
});

// ---------- إظهار / إخفاء كلمة المرور ----------
document.addEventListener('click', (e) => {
  const eye = e.target.closest('[data-eye]');
  if (!eye) return;
  const input = eye.closest('.input-wrap').querySelector('input');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  eye.querySelector('use').setAttribute('href', show ? '#i-eye-off' : '#i-eye');
  eye.setAttribute('aria-label', t(show ? 'pw.hide' : 'pw.show'));
});

// ---------- الإرسال (تجريبي) ----------
function submitForm(form) {
  // TODO: أرسل البيانات إلى الخادم عبر fetch('/api/...') ثم عالج الاستجابة.
  // الواجهة هنا تجريبية: لا تتحقق من الحساب فعليًا ولا تحفظ كلمة المرور.
  let user;
  if (form.dataset.form === 'register') {
    user = { username: form.elements.username.value.trim(), email: form.elements.email.value.trim(), age: +form.elements.age.value };
  } else {
    const id = form.elements.identifier.value.trim();
    user = { username: id.includes('@') ? id.split('@')[0] : id, email: id.includes('@') ? id : '' };
  }
  setUser(user);
  renderAuthState();
  closeAuth();
  form.reset();
  $('#strength').dataset.score = 0; $('#r-strength').textContent = '';
  showToast(t(form.dataset.form === 'register' ? 'toast.created' : 'toast.welcome', { name: user.username }));
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
}

window.addEventListener('langchange', () => {
  setAuthMode(authMode);
  renderAuthState();
  $$('.field.has-error').forEach((f) => { const m = f.querySelector('.field-error'); if (m.dataset.code) m.textContent = t('err.' + m.dataset.code, { min: MIN_AGE, max: MAX_AGE }); });
  const pw = $('#r-pass').value; if (pw) $('#r-strength').textContent = t('pw.' + $('#strength').dataset.score);
});

renderAuthState();
setAuthMode('login');
