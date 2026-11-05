/* =====================================================================
   منصة ملاذ | Maladh — تفاعلات واجهة الدعم الخاص والمحادثات السرية
   Private Support Interactive JavaScript Engine
   Vanilla JavaScript نقي 100% بدون أي مكتبات أو أطر عمل
   ===================================================================== */

(function () {
  'use strict';

  // ---------- الأدوات المساعدة ----------
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // رسالة تنبيه سريعة (Toast)
  let toastTimer = null;
  function showToast(message) {
    const toast = $('#toastMsg');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-show');
    }, 3200);
  }

  // تنسيق الوقت العربي الحالي (مثال: 10:25 ص)
  function getCurrentArabicTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  // ---------- البيانات التجريبية للمحادثات (Sample Mock Data) ----------
  const CONVERSATIONS = {
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
          id: 'msg-1',
          sender: 'user',
          text: 'السلام عليكم دكتورة،\nأشعر بالقلق والتوتر مؤخراً، ماذا تنصحيني؟',
          time: '10:20 ص',
          status: 'read'
        },
        {
          id: 'msg-2',
          sender: 'specialist',
          text: 'وعليكم السلام،\nمن الطبيعي أن تشعري بالقلق أحياناً.\nلنبدأ معاً ببعض التمارين البسيطة للاسترخاء،\nوأنا هنا دائماً لمساعدتك ❤️',
          time: '10:23 ص'
        }
      ],
      autoReplies: [
        'أشكركِ على مشاركتك الصادقة معي سارة. خذي الآن شهيقاً عميقاً لـ 4 ثوانٍ واحبسي النفس ثانيتين ثم ازفري ببطء، وسنواصل خطوتنا التالية معاً بكل طمأنينة 🌸',
        'مشاعرك طبيعية جداً ومقدرة. تذكري أن القلق فكرة عابرة ولا تمثّل حقيقتك، نحن نصنع فارقاً مع كل يوم جديد 🕊️',
        'ممتاز جداً! تدوين أفكارك عند الشعور بالتوتر يساعد كثيراً في تفريغ شحنة الدماغ وتهدئة الجهاز العصبي، استمري في هذا الوعي الرائع 🤍'
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
          text: 'أهلاً بكِ عزيزتي سارة. موعدنا مؤكد بإذن الله يوم الثلاثاء الساعة 5:00 مساءً عبر الجلسة الافتراضية المشفرة. استمري في تطبيق جدول الامتنان اليومي ✨',
          time: 'أمس 08:15 م'
        }
      ],
      autoReplies: [
        'أهلاً سارة، تسعدني متابعتك المستمرة. سأراجع جدول التمارين ونناقش المحاور بالتفصيل في جلستنا القادمة.',
        'وعليكم السلام ورحمة الله. خطتك الإرشادية تسير بشكل متوازن جداً، حافظي على هذا الزخم الإيجابي 🌿'
      ]
    },
    'support-team': {
      id: 'support-team',
      name: 'فريق الدعم',
      role: 'مساعد الدعم الفني',
      avatar: null, // أيقونة سماعة دعم فني
      isOnline: true,
      unreadCount: 0,
      time: 'الأحد 5:30 م',
      messages: [
        {
          id: 'msg-s1',
          sender: 'user',
          text: 'مرحباً، أود التأكد من تفعيل أعلى معايير الخصوصية والتشفير التام لبيانات الجلسات الخاصة بي.',
          time: 'الأحد 05:15 م',
          status: 'read'
        },
        {
          id: 'msg-s2',
          sender: 'specialist',
          text: 'مرحباً بكِ في منصة ملاذ. نؤكد لكِ أن جميع المحادثات والاتصالات محمية بتشفير طبي شامل (End-to-End Encryption)، ولا يمكن لأي طرف ثالث الاطلاع عليها أبداً. نحن في خدمتكِ دائماً.',
          time: 'الأحد 05:30 م'
        }
      ],
      autoReplies: [
        'مرحباً بكِ سارة. تم استلام استفسارك بنجاح وسيقوم أحد ممثلي الدعم الفني بالرد الفوري لمساعدتك.',
        'نحن هنا دائماً لضمان راحتك وسلاسة تجربتك في منصة ملاذ. هل تحتاجين لأي مساعدة إضافية بخصوص حسابك؟'
      ]
    }
  };

  // الحالة العامة للتطبيق (State)
  const state = {
    activeChatId: 'sara',
    selectedFile: null,
    user: {
      name: 'سارة أحمد',
      avatar: 'assets/user-avatar.svg'
    }
  };

  // عناصر واجهة المستخدم الرئيسية (DOM Elements)
  const DOM = {
    conversationsList: $('#conversationsList'),
    chatMessagesContainer: $('#chatMessagesContainer'),
    chatHeaderName: $('#chatHeaderName'),
    chatHeaderRole: $('#chatHeaderRole'),
    chatHeaderAvatar: $('#chatHeaderAvatar'),
    chatHeaderOnlineDot: $('#chatHeaderOnlineDot'),
    chatHeaderStatusPill: $('#chatHeaderStatusPill'),
    chatForm: $('#chatForm'),
    messageInput: $('#messageInput'),
    sendBtn: $('#sendBtn'),
    attachBtn: $('#attachBtn'),
    fileInput: $('#fileInput'),
    attachedFilePill: $('#attachedFilePill'),
    attachedFileName: $('#attachedFileName'),
    removeAttachBtn: $('#removeAttachBtn'),
    emojiBtn: $('#emojiBtn'),
    emojiPopover: $('#emojiPopover'),
    emojiGrid: $('#emojiGrid'),
    userProfileBtn: $('#userProfileBtn'),
    userDropdown: $('#userDropdown'),
    chatOptionsBtn: $('#chatOptionsBtn'),
    chatOptionsMenu: $('#chatOptionsMenu'),
    mobileBackBtn: $('#mobileBackBtn'),
    convSearchInput: $('#convSearchInput'),
    typingIndicator: $('#typingIndicator'),
    typingAvatar: $('#typingAvatar')
  };

  // ---------- 1. دالة عرض الرسائل داخل نافذة المحادثة ----------
  function renderMessages(chatId) {
    const conv = CONVERSATIONS[chatId];
    if (!conv || !DOM.chatMessagesContainer) return;

    // علامتا صح باللون الأزرق لرسائل المستفيدة
    const doubleChecksSvg = `
      <span class="check-marks" title="تمت القراءة">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 6 9 17 4 12"></polyline>
          <polyline points="22 10 13 21 11 19"></polyline>
        </svg>
      </span>
    `;

    // فاصل التاريخ الزمني
    let html = `
      <div class="chat-date-separator">
        <span>اليوم</span>
      </div>
    `;

    conv.messages.forEach(msg => {
      const isUser = msg.sender === 'user';
      
      // تحديد صورة مرسل الرسالة
      let avatarSrc = state.user.avatar;
      let avatarAlt = state.user.name;

      if (!isUser) {
        if (conv.avatar) {
          avatarSrc = conv.avatar;
          avatarAlt = conv.name;
        } else {
          avatarSrc = 'assets/logo.png';
          avatarAlt = conv.name;
        }
      }

      // في حال وجود ملف مرفق مع الرسالة
      let fileAttachmentHtml = '';
      if (msg.file) {
        fileAttachmentHtml = `
          <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:rgba(23,71,127,0.08);border-radius:10px;margin-bottom:0.4rem;font-size:0.84rem;font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${msg.file.name}</span>
          </div>
        `;
      }

      // بناء فقاعة الرسالة
      html += `
        <div class="message-row ${isUser ? 'is-user' : 'is-specialist'}" id="${msg.id}">
          <div class="message-avatar-wrap">
            ${!isUser && !conv.avatar ? `
              <div class="conv-avatar-icon" style="width:36px;height:36px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
              </div>
            ` : `
              <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar-img" />
            `}
          </div>

          <div class="message-bubble">
            ${fileAttachmentHtml}
            ${msg.text ? `<div class="message-text">${escapeHtml(msg.text)}</div>` : ''}
            <div class="message-meta">
              <span>${msg.time}</span>
              ${isUser ? doubleChecksSvg : ''}
            </div>
          </div>
        </div>
      `;
    });

    DOM.chatMessagesContainer.innerHTML = html;
    scrollToBottom();
  }

  // التمرير التلقائي لأسفل المحادثة
  function scrollToBottom() {
    if (!DOM.chatMessagesContainer) return;
    setTimeout(() => {
      DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
    }, 40);
  }

  // تأمين النصوص البرمجية من الـ XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------- 2. دالة التبديل بين المحادثات ----------
  function switchConversation(chatId) {
    if (!CONVERSATIONS[chatId]) return;

    state.activeChatId = chatId;
    const conv = CONVERSATIONS[chatId];

    // تحديث المحادثة النشطة في القائمة
    $$('.conversation-item').forEach(btn => {
      const isSelected = btn.dataset.chatId === chatId;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', String(isSelected));
    });

    // تصفير وتحديث شارة الرسائل غير المقروءة للمحادثة المفتوحة
    conv.unreadCount = 0;
    const badge = $(`#badge-${chatId}`);
    if (badge) {
      badge.textContent = '0';
      badge.hidden = true;
    }

    // تحديث رأس نافذة المحادثة
    if (DOM.chatHeaderName) DOM.chatHeaderName.textContent = conv.name;
    if (DOM.chatHeaderRole) DOM.chatHeaderRole.textContent = conv.role;

    if (DOM.chatHeaderAvatar) {
      if (conv.avatar) {
        DOM.chatHeaderAvatar.src = conv.avatar;
        DOM.chatHeaderAvatar.style.display = 'block';
        if (DOM.chatHeaderAvatar.nextElementSibling && DOM.chatHeaderAvatar.nextElementSibling.classList.contains('conv-avatar-icon')) {
          DOM.chatHeaderAvatar.nextElementSibling.remove();
        }
      } else {
        // حالة فريق الدعم بدون صورة
        DOM.chatHeaderAvatar.src = 'assets/logo.png';
      }
    }

    // صورة مؤشر الكتابة
    if (DOM.typingAvatar) {
      DOM.typingAvatar.src = conv.avatar || 'assets/logo.png';
    }

    // تحديث نقطة الاتصال وحالة الاتصال
    if (DOM.chatHeaderOnlineDot) {
      DOM.chatHeaderOnlineDot.style.display = conv.isOnline ? 'block' : 'none';
    }

    if (DOM.chatHeaderStatusPill) {
      if (conv.isOnline) {
        DOM.chatHeaderStatusPill.innerHTML = `
          <span class="pulse-dot"></span>
          <span>متصلة الآن</span>
        `;
        DOM.chatHeaderStatusPill.style.color = 'var(--online-green)';
      } else {
        DOM.chatHeaderStatusPill.innerHTML = `
          <span style="width:7px;height:7px;border-radius:50%;background:#94A3B8;display:inline-block;"></span>
          <span style="color:#71849E;">غير متصلة</span>
        `;
      }
    }

    // عرض رسائل المحادثة المحددة
    renderMessages(chatId);

    // تفعيل وضع عرض الدردشة في شاشات الهواتف
    document.body.classList.add('mobile-view-chat');
  }

  // ---------- 3. دالة إرسال الرسائل ومحاكاة الرد التفاعلي ----------
  function sendMessage() {
    const text = DOM.messageInput.value.trim();
    const hasFile = !!state.selectedFile;

    if (!text && !hasFile) {
      DOM.messageInput.focus();
      return;
    }

    const conv = CONVERSATIONS[state.activeChatId];
    if (!conv) return;

    const timeStr = getCurrentArabicTime();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      time: timeStr,
      status: 'read'
    };

    if (hasFile) {
      newMsg.file = {
        name: state.selectedFile.name,
        size: state.selectedFile.size
      };
      // تفريغ الملف بعد الإرسال
      clearAttachedFile();
    }

    // إضافة الرسالة لسجل المحادثة
    conv.messages.push(newMsg);
    conv.time = `اليوم ${timeStr}`;

    // تحديث توقيت المحادثة في القائمة
    const timeEl = $(`.conversation-item[data-chat-id="${state.activeChatId}"] .conv-time`);
    if (timeEl) timeEl.textContent = `اليوم ${timeStr}`;

    // إعادة رسم الرسائل والتمرير للأسفل
    renderMessages(state.activeChatId);

    // تفريغ حقل الإدخال وإغلاق النوافذ المنبثقة
    DOM.messageInput.value = '';
    closeAllPopovers();
    DOM.messageInput.focus();

    // محاكاة رد تفاعلي من الأخصائية بعد ثانية ونصف
    simulateSpecialistReply(conv);
  }

  // محاكاة الرد من الأخصائية
  function simulateSpecialistReply(conv) {
    if (!DOM.typingIndicator) return;

    // إظهار مؤشر جاري الكتابة
    setTimeout(() => {
      DOM.typingIndicator.classList.add('is-active');
      scrollToBottom();
    }, 600);

    // إرسال الرد الفعلي
    setTimeout(() => {
      DOM.typingIndicator.classList.remove('is-active');

      const replies = conv.autoReplies || [
        'شكراً لكِ سارة، أنا هنا بجانبك وسنناقش هذا الأمر بكل راحة وطمأنينة ❤️'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = getCurrentArabicTime();

      conv.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'specialist',
        text: randomReply,
        time: replyTime
      });

      renderMessages(conv.id);
      showToast(`رسالة واردة جديدة من ${conv.name} 💬`);
    }, 1800);
  }

  // ---------- 4. إدارة إرفاق الملفات ----------
  function handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    state.selectedFile = file;
    if (DOM.attachedFileName) DOM.attachedFileName.textContent = file.name;
    if (DOM.attachedFilePill) DOM.attachedFilePill.classList.add('is-active');

    showToast(`تم إرفاق الملف: ${file.name}`);
    DOM.messageInput.focus();
  }

  function clearAttachedFile() {
    state.selectedFile = null;
    if (DOM.fileInput) DOM.fileInput.value = '';
    if (DOM.attachedFilePill) DOM.attachedFilePill.classList.remove('is-active');
  }

  // ---------- 5. إدارة الرموز التعبيرية (Emoji Picker) ----------
  function insertEmoji(emoji) {
    if (!DOM.messageInput) return;
    const input = DOM.messageInput;
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || input.value.length;
    const text = input.value;

    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.focus();
    const newPos = start + emoji.length;
    input.setSelectionRange(newPos, newPos);
  }

  // ---------- 6. إغلاق جميع القوائم واللوحات المنبثقة ----------
  function closeAllPopovers() {
    DOM.userDropdown?.classList.remove('is-open');
    DOM.userProfileBtn?.classList.remove('is-active');
    DOM.userProfileBtn?.setAttribute('aria-expanded', 'false');

    DOM.chatOptionsMenu?.classList.remove('is-open');
    DOM.chatOptionsBtn?.setAttribute('aria-expanded', 'false');

    DOM.emojiPopover?.classList.remove('is-open');
    DOM.emojiBtn?.setAttribute('aria-expanded', 'false');
  }

  // ---------- 7. تصفية وبحث المحادثات ----------
  function filterConversations(keyword) {
    keyword = (keyword || '').trim().toLowerCase();
    const items = $$('.conversation-item');

    items.forEach(item => {
      const name = ($('.conv-name', item)?.textContent || '').toLowerCase();
      const role = ($('.conv-role', item)?.textContent || '').toLowerCase();
      const matches = !keyword || name.includes(keyword) || role.includes(keyword);
      item.style.display = matches ? 'flex' : 'none';
    });
  }

  // ---------- 8. ربط الأحداث والمستمعات (Event Listeners) ----------
  function setupEventListeners() {

    // 1. إرسال الرسالة عبر نموذج النموذج (Submit) أو زر الإرسال
    DOM.chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage();
    });

    // 2. إرسال الرسالة باستخدام زر Enter من لوحة المفاتيح
    DOM.messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // 3. التبديل بين المحادثات عند النقر على القائمة
    DOM.conversationsList?.addEventListener('click', (e) => {
      const item = e.target.closest('.conversation-item');
      if (item && item.dataset.chatId) {
        e.preventDefault();
        switchConversation(item.dataset.chatId);
      }
    });

    // 4. زر الرجوع للهواتف المحمولة
    DOM.mobileBackBtn?.addEventListener('click', () => {
      document.body.classList.remove('mobile-view-chat');
    });

    // 5. زر إرفاق الملفات واختيار ملف من الجهاز
    DOM.attachBtn?.addEventListener('click', () => {
      DOM.fileInput?.click();
    });

    DOM.fileInput?.addEventListener('change', handleFileSelect);
    DOM.removeAttachBtn?.addEventListener('click', clearAttachedFile);

    // 6. زر الرموز التعبيرية
    DOM.emojiBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = DOM.emojiPopover?.classList.toggle('is-open');
      DOM.emojiBtn.setAttribute('aria-expanded', String(isOpen));
      DOM.userDropdown?.classList.remove('is-open');
      DOM.chatOptionsMenu?.classList.remove('is-open');
    });

    DOM.emojiGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.emoji-btn');
      if (btn && btn.dataset.emoji) {
        insertEmoji(btn.dataset.emoji);
      }
    });

    // 7. القائمة المنسدلة للمستخدمة (عند الضغط على الاسم أو السهم)
    DOM.userProfileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = DOM.userDropdown?.classList.toggle('is-open');
      DOM.userProfileBtn.classList.toggle('is-active', isOpen);
      DOM.userProfileBtn.setAttribute('aria-expanded', String(isOpen));
      DOM.chatOptionsMenu?.classList.remove('is-open');
      DOM.emojiPopover?.classList.remove('is-open');
    });

    // 8. قائمة الخيارات الثلاثية للأخصائي
    DOM.chatOptionsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = DOM.chatOptionsMenu?.classList.toggle('is-open');
      DOM.chatOptionsBtn.setAttribute('aria-expanded', String(isOpen));
      DOM.userDropdown?.classList.remove('is-open');
      DOM.emojiPopover?.classList.remove('is-open');
    });

    // خيارات القائمة الثلاثية
    $('#optSpecialistInfo')?.addEventListener('click', () => {
      const conv = CONVERSATIONS[state.activeChatId];
      showToast(`${conv.name} - ${conv.role} معتمدة في العلاج المعرفي السلوكي`);
      closeAllPopovers();
    });

    $('#optMuteChat')?.addEventListener('click', () => {
      showToast('تم كتم إشعارات هذه المحادثة.');
      closeAllPopovers();
    });

    $('#optClearChat')?.addEventListener('click', () => {
      if (confirm('هل أنتِ متأكدة من رغبتك في مسح سجل المحادثة؟')) {
        CONVERSATIONS[state.activeChatId].messages = [];
        renderMessages(state.activeChatId);
        showToast('تم مسح سجل المحادثة بنجاح.');
      }
      closeAllPopovers();
    });

    $('#privacySettingsOpt')?.addEventListener('click', () => {
      showToast('وضع التشفير الطبي التام مفعّل دائماً لحماية خصوصيتك 🔒');
      closeAllPopovers();
    });

    $('#notifBtn')?.addEventListener('click', () => {
      showToast('لديك إشعاران جديدان بخصوص موعد جلستك القادمة.');
    });

    // إغلاق اللوحات والقوائم المنسدلة عند النقر بالخارج
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#userProfileBtn, #userDropdown, #chatOptionsBtn, #chatOptionsMenu, #emojiBtn, #emojiPopover')) {
        closeAllPopovers();
      }
    });

    // البحث في المحادثات
    DOM.convSearchInput?.addEventListener('input', (e) => {
      filterConversations(e.target.value);
    });

  }

  // ---------- 9. بدء تشغيل الصفحة والتهيئة (Initialization) ----------
  function init() {
    renderMessages(state.activeChatId);
    setupEventListeners();
  }

  // التشغيل فور اكتمال تحميل هيكل المستند
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

