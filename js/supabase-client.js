/**
 * =====================================================================
 * عميل قاعدة بيانات Supabase المركزي لمنصة ملاذ (Maladh Supabase Client)
 * - يدير كافة الاتصالات، المصادقة، والعمليات السحابية (CRUD)
 * - يدعم التخزين السحابي (Supabase Storage) والتحديث اللحظي (Realtime)
 * - يتضمن نظام حماية احتياطي (Fallback Layer) للاستمرار بالعمل في حال
 *   عدم إدخال مفاتيح المشروع السحابي بعد.
 * =====================================================================
 */

(function () {
  'use strict';

  // 1. إعدادات الاتصال بمشروع Supabase
  // يمكنك وضع رابط مشروعك ومفتاح anon_key هنا مباشرة أو عبر window.ENV أو LocalStorage
  const DEFAULT_CONFIG = {
    // ضع هنا رابط مشروعك من لوحة تحكم Supabase: Project Settings -> API
    url: 'https://xyzcompany.supabase.co',
    // ضع هنا المفتاح العام (anon / public key) من لوحة تحكم Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder'
  };

  // فحص هل توجد إعدادات محفوظة في LocalStorage
  const savedUrl = localStorage.getItem('maladh:supabase_url');
  const savedKey = localStorage.getItem('maladh:supabase_key');

  const SUPABASE_URL = savedUrl || (window.ENV && window.ENV.SUPABASE_URL) || DEFAULT_CONFIG.url;
  const SUPABASE_ANON_KEY = savedKey || (window.ENV && window.ENV.SUPABASE_ANON_KEY) || DEFAULT_CONFIG.anonKey;

  // فحص هل المفاتيح حقيقية وليست placeholder افتراضي
  const isRealCredentials = SUPABASE_URL &&
    !SUPABASE_URL.includes('xyzcompany') &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('placeholder');

  let client = null;

  // تهيئة عميل Supabase الرسمي إذا توفرت مكتبة supabase-js في المتصفح
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      });
      console.log('✅ [MaladhDB] تم تهيئة عميل Supabase بنجاح:', isRealCredentials ? 'متصل بقاعدة البيانات الحقيقية' : 'وضع المعاينة والربط الجاهز');
    } catch (err) {
      console.warn('⚠️ [MaladhDB] تعذر تهيئة عميل Supabase:', err.message);
    }
  }

  // دوال مساعدة للتخزين الاحتياطي (LocalStorage Fallback)
  function getLocal(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setLocal(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  // =====================================================================
  // الواجهة البرمجية الموحدة (window.MaladhDB)
  // =====================================================================
  window.MaladhDB = {
    client: client,
    isConfigured: () => isRealCredentials,

    // ضبط المفاتيح برمجياً في أي وقت
    setConfig: function (url, anonKey) {
      if (url && anonKey) {
        localStorage.setItem('maladh:supabase_url', url);
        localStorage.setItem('maladh:supabase_key', anonKey);
        console.log('✨ [MaladhDB] تم حفظ إعدادات Supabase، جاري إعادة تحميل الصفحة...');
        window.location.reload();
      }
    },

    // -------------------------------------------------------------------
    // 1. نظام المصادقة والمستخدمين (Authentication & Profiles)
    // -------------------------------------------------------------------
    auth: {
      // إنشاء حساب جديد في Supabase Auth + Profiles
      async signUp({ email, password, username, phone, age, role, title, license, specialty }) {
        role = role || 'beneficiary';
        const metadata = {
          full_name: username,
          username: username,
          phone: phone || null,
          age: age ? parseInt(age, 10) : null,
          role: role,
          title: title || (role === 'specialist' ? 'أخصائي في علم النفس العلاجي' : null),
          license: license || null,
          specialty: specialty || null
        };

        if (isRealCredentials && client) {
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
              data: metadata
            }
          });

          if (error) throw error;

          // تحديث أو إنشاء سجل في profiles
          if (data.user) {
            await client.from('profiles').upsert({
              id: data.user.id,
              full_name: username,
              email: email,
              phone: phone,
              role: role,
              age: age ? parseInt(age, 10) : null,
              is_active: true
            });
          }

          return data;
        } else {
          // محاكاة محلية آمنة
          const fakeUser = {
            id: 'usr_' + Date.now(),
            email,
            username,
            phone,
            age,
            role
          };
          setLocal('maladh:current_role', role);
          setLocal('maladh:user', fakeUser);
          if (role === 'specialist') {
            setLocal('maladh:doctor_user', { ...fakeUser, title, license, specialty });
          } else if (role === 'admin') {
            setLocal('maladh:admin_user', fakeUser);
          }
          return { user: fakeUser };
        }
      },

      // تسجيل الدخول بالبريد وكلمة المرور
      async signIn({ email, password }) {
        if (isRealCredentials && client) {
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          // جلب بيانات الدور والملف الشخصي
          const profile = await window.MaladhDB.auth.getProfile(data.user.id);
          const role = (profile && profile.role) || 'beneficiary';
          setLocal('maladh:current_role', role);

          return { user: data.user, session: data.session, profile };
        } else {
          // التحقق المحلي السريع المعتمد في المشروع
          const p = (password || '').trim().toLowerCase();
          const e = (email || '').trim().toLowerCase();
          let role = 'beneficiary';
          let username = email.includes('@') ? email.split('@')[0] : email;

          if (p === 'admin' || e === 'admin' || e === 'admin@maladh.com') {
            role = 'admin';
            username = 'أ. عبد الله الشمري';
          } else if (p === 'doctor' || e === 'doctor' || e.includes('doctor') || e === 'sara.otaibi@maladh.com') {
            role = 'specialist';
            username = 'د. سارة العتيبي';
          }

          const user = {
            id: 'usr_local',
            email,
            username,
            role
          };
          setLocal('maladh:current_role', role);
          setLocal('maladh:user', user);

          if (role === 'specialist') {
            setLocal('maladh:doctor_user', {
              username: 'د. سارة العتيبي',
              email: 'sara.otaibi@maladh.com',
              role: 'specialist',
              title: 'أخصائية في علم النفس العلاجي',
              license: 'PSY-88492',
              avatar: 'assets/specialist-sara.jpg'
            });
          } else if (role === 'admin') {
            setLocal('maladh:admin_user', {
              username: 'أ. عبد الله الشمري',
              email: 'admin@maladh.com',
              role: 'admin',
              title: 'مدير النظام'
            });
          }

          return { user, profile: { role, full_name: username } };
        }
      },

      // تسجيل الخروج
      async signOut() {
        if (isRealCredentials && client) {
          try {
            await client.auth.signOut();
          } catch (e) {
            console.warn(e);
          }
        }
        localStorage.removeItem('maladh:current_role');
        localStorage.removeItem('maladh:user');
      },

      // جلب الجلسة الحالية
      async getSession() {
        if (isRealCredentials && client) {
          const { data } = await client.auth.getSession();
          return data.session;
        }
        return null;
      },

      // جلب الملف الشخصي لمستخدم
      async getProfile(userId) {
        if (isRealCredentials && client && userId) {
          const { data, error } = await client
            .from('profiles')
            .select('*, specialist_profiles(*)')
            .eq('id', userId)
            .single();

          if (error) {
            console.warn('Error fetching profile:', error);
            return null;
          }
          return data;
        }
        return getLocal('maladh:user', null);
      },

      // تعديل الملف الشخصي
      async updateProfile(userId, profileData) {
        if (isRealCredentials && client && userId) {
          const { data, error } = await client
            .from('profiles')
            .update(profileData)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          const u = getLocal('maladh:user', {});
          const updated = { ...u, ...profileData };
          setLocal('maladh:user', updated);
          return updated;
        }
      }
    },

    // -------------------------------------------------------------------
    // 2. إدارة الأخصائيين النفسيين (Specialists)
    // -------------------------------------------------------------------
    specialists: {
      async getAll({ search = '', specialty = '', service = '', remoteOnly = false, verifiedOnly = false } = {}) {
        if (isRealCredentials && client) {
          let query = client
            .from('specialist_profiles')
            .select(`
              id, title, license_number, specialty, qualification, experience_years, bio, rating, total_sessions, is_verified, is_available, hourly_rate,
              profiles:id ( id, full_name, email, phone, avatar_url )
            `);

          if (verifiedOnly) query = query.eq('is_verified', true);
          if (specialty) query = query.ilike('specialty', `%${specialty}%`);

          const { data, error } = await query;
          if (error) throw error;

          // معالجة البيانات وتصفية البحث
          let list = data || [];
          if (search) {
            const s = search.toLowerCase();
            list = list.filter(item =>
              (item.profiles?.full_name && item.profiles.full_name.toLowerCase().includes(s)) ||
              (item.specialty && item.specialty.toLowerCase().includes(s))
            );
          }
          return list;
        } else {
          // استرجاع القائمة المحلية التجريبية
          return getLocal('maladh:admin_specialists_v1', [
            { id: 'sp1', name: 'د. سارة العتيبي', specialty: 'استشارات نفسية وعلاج معرفي سلوكي', license: 'PSY-88492', email: 'sara.otaibi@maladh.com', phone: '0512345678', verified: true, available: true, rating: 4.9, sessions: 184, avatar: 'assets/specialist-sara.jpg' },
            { id: 'sp2', name: 'د. خالد الشمري', specialty: 'علاج الإدمان ودعم التعافي', license: 'MED-77142', email: 'khaled.sh@maladh.com', phone: '0523456789', verified: true, available: true, rating: 4.85, sessions: 156, avatar: 'assets/specialist-ahmed.jpg' },
            { id: 'sp3', name: 'د. نورة القحطاني', specialty: 'إرشاد أسري وعلاقات زوجية', license: 'FAM-66321', email: 'noura.q@maladh.com', phone: '0534567890', verified: true, available: false, rating: 4.92, sessions: 122, avatar: 'assets/specialist-sara.jpg' },
            { id: 'sp4', name: 'د. عبد الله الدوسري', specialty: 'اضطرابات القلق والمخاوف السلوكية', license: 'PSY-55901', email: 'a.dossari@maladh.com', phone: '0545678901', verified: true, available: true, rating: 4.8, sessions: 98, avatar: 'assets/specialist-ahmed.jpg' },
            { id: 'sp5', name: 'د. فيصل السبيعي', specialty: 'استشارات نفسية وتأهيل سلوكي', license: 'PSY-99120', email: 'f.subaie@maladh.com', phone: '0556789012', verified: false, available: true, rating: 4.7, sessions: 12, avatar: 'assets/specialist-sara.jpg' }
          ]);
        }
      },

      async verifySpecialist(id, isVerified) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('specialist_profiles')
            .update({ is_verified: isVerified })
            .eq('id', id);
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:admin_specialists_v1', []);
          const s = list.find(x => x.id === id);
          if (s) s.verified = isVerified;
          setLocal('maladh:admin_specialists_v1', list);
          return s;
        }
      },

      async setAvailability(id, isAvailable) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('specialist_profiles')
            .update({ is_available: isAvailable })
            .eq('id', id);
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:admin_specialists_v1', []);
          const s = list.find(x => x.id === id);
          if (s) s.available = isAvailable;
          setLocal('maladh:admin_specialists_v1', list);
          return s;
        }
      }
    },

    // -------------------------------------------------------------------
    // 3. إدارة الخدمات (Services)
    // -------------------------------------------------------------------
    services: {
      async getAll() {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('services')
            .select('*')
            .order('created_at', { ascending: true });
          if (error) throw error;
          return data || [];
        } else {
          return getLocal('maladh:admin_services_v1', [
            { id: 'srv1', title: 'الاستشارات النفسية الفردية', desc: 'جلسات علاجية متخصصة لعلاج الاكتئاب، اضطرابات القلق، الصدمات والضغوط النفسية مع مختصين مرخصين.', icon: 'i-heart', specialistsCount: 18, sessionsCount: 680, active: true },
            { id: 'srv2', title: 'مسار دعم التعافي من الإدمان', desc: 'برنامج علاجي وتأهيلي شامل للمتعافين من الإدمان وإدارة محفزات الانتكاسة مع خطة متابعة يومية.', icon: 'i-sprout', specialistsCount: 12, sessionsCount: 502, active: true },
            { id: 'srv3', title: 'الإرشاد الأسري والعلاقات', desc: 'استشارات متخصصة للتعامل مع الخلافات الأسرية والزوجية وبناء بيئة داعمة ومستقرة للأبناء.', icon: 'i-users', specialistsCount: 9, sessionsCount: 292, active: true },
            { id: 'srv4', title: 'جلسات الدعم النفسي الجمعي', desc: 'مجموعات دعم نفسية مقننة تحت إشراف أخصائي معتمد لمشاركة التجارب الإيجابية وبناء المرونة.', icon: 'i-coffee', specialistsCount: 6, sessionsCount: 146, active: true },
            { id: 'srv5', title: 'التدخل النفسي الطارئ', desc: 'قناة تدخل سريع ومباشر للتعامل مع الأزمات النفسية الحادة ونوبات الهلع على مدار الساعة.', icon: 'i-shield', specialistsCount: 8, sessionsCount: 94, active: true },
            { id: 'srv6', title: 'التقييم والمقاييس النفسية', desc: 'إجراء المقاييس والاختبارات الإكلينيكية المعتمدة لتشخيص دقيق وتحديد الخطة العلاجية الملائمة.', icon: 'i-file-text', specialistsCount: 14, sessionsCount: 210, active: true }
          ]);
        }
      },

      async create(serviceData) {
        if (isRealCredentials && client) {
          const { data, error } = await client.from('services').insert([serviceData]).select().single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:admin_services_v1', []);
          const newS = { id: 'srv_' + Date.now(), ...serviceData, specialistsCount: 1, sessionsCount: 0, active: true };
          list.push(newS);
          setLocal('maladh:admin_services_v1', list);
          return newS;
        }
      },

      async update(id, updates) {
        if (isRealCredentials && client) {
          const { data, error } = await client.from('services').update(updates).eq('id', id).select().single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:admin_services_v1', []);
          const idx = list.findIndex(x => x.id === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates };
            setLocal('maladh:admin_services_v1', list);
            return list[idx];
          }
          return null;
        }
      }
    },

    // -------------------------------------------------------------------
    // 4. المواعيد والحجوزات (Appointments)
    // -------------------------------------------------------------------
    appointments: {
      async getAll({ role = 'beneficiary', userId = null, status = 'all', date = null } = {}) {
        if (isRealCredentials && client) {
          let query = client
            .from('appointments')
            .select(`
              *,
              beneficiary:beneficiary_id ( id, full_name, email, phone, avatar_url ),
              specialist:specialist_id (
                id, title, specialty, license_number,
                profile:id ( full_name, avatar_url )
              ),
              service:service_id ( id, title, icon )
            `)
            .order('appointment_date', { ascending: false });

          if (role === 'beneficiary' && userId) {
            query = query.eq('beneficiary_id', userId);
          } else if (role === 'specialist' && userId) {
            query = query.eq('specialist_id', userId);
          }

          if (status && status !== 'all') {
            query = query.eq('status', status);
          }
          if (date) {
            query = query.eq('appointment_date', date);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        } else {
          // جلب المواعيد المحلية
          let list = role === 'specialist'
            ? getLocal('maladh:doctor_appts_v2', [])
            : getLocal('maladh:beneficiary_appts', []);
          return list;
        }
      },

      async create(apptData) {
        if (isRealCredentials && client) {
          // فحص هل الموعد محجوز مسبقاً لمنع التداخل
          const { data: existing } = await client
            .from('appointments')
            .select('id')
            .eq('specialist_id', apptData.specialist_id)
            .eq('appointment_date', apptData.appointment_date)
            .eq('appointment_time', apptData.appointment_time)
            .neq('status', 'cancelled');

          if (existing && existing.length > 0) {
            throw new Error('هذا الوقت محجوز مسبقاً، يرجى اختيار فترة توفر أخرى.');
          }

          const code = 'APT-' + Math.floor(1000 + Math.random() * 9000);
          const payload = {
            appointment_code: code,
            ...apptData,
            status: apptData.status || 'upcoming'
          };

          const { data, error } = await client.from('appointments').insert([payload]).select().single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:beneficiary_appts', []);
          const newAppt = {
            id: 'apt-' + Date.now(),
            code: 'APT-' + Math.floor(1000 + Math.random() * 9000),
            ...apptData,
            status: 'upcoming'
          };
          list.unshift(newAppt);
          setLocal('maladh:beneficiary_appts', list);
          return newAppt;
        }
      },

      async cancel(id, reason = '') {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('appointments')
            .update({ status: 'cancelled', cancellation_reason: reason })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:beneficiary_appts', []);
          const a = list.find(x => x.id === id);
          if (a) {
            a.status = 'cancelled';
            a.cancellationReason = reason;
            setLocal('maladh:beneficiary_appts', list);
          }
          return a;
        }
      },

      async reschedule(id, newDate, newTime) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('appointments')
            .update({ appointment_date: newDate, appointment_time: newTime, status: 'upcoming' })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:beneficiary_appts', []);
          const a = list.find(x => x.id === id);
          if (a) {
            a.date = newDate;
            a.time = newTime;
            setLocal('maladh:beneficiary_appts', list);
          }
          return a;
        }
      }
    },

    // -------------------------------------------------------------------
    // 5. جدول التوفر والإجازات (Availability Schedule & Vacations)
    // -------------------------------------------------------------------
    schedule: {
      async get(specialistId) {
        if (isRealCredentials && client && specialistId) {
          const { data: schedule } = await client
            .from('specialist_schedules')
            .select('*')
            .eq('specialist_id', specialistId)
            .single();

          const { data: vacations } = await client
            .from('specialist_vacations')
            .select('*')
            .eq('specialist_id', specialistId);

          return {
            days: (schedule && schedule.days) || [],
            settings: (schedule && schedule.settings) || {},
            vacations: vacations || []
          };
        } else {
          return getLocal('maladh:doctor_schedule', null);
        }
      },

      async save(specialistId, { days, settings }) {
        if (isRealCredentials && client && specialistId) {
          const { data, error } = await client
            .from('specialist_schedules')
            .upsert({
              specialist_id: specialistId,
              days,
              settings
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const sched = { days, settings, vacations: [] };
          setLocal('maladh:doctor_schedule', sched);
          return sched;
        }
      },

      async addVacation(specialistId, vacationData) {
        if (isRealCredentials && client && specialistId) {
          const { data, error } = await client
            .from('specialist_vacations')
            .insert([{ specialist_id: specialistId, ...vacationData }])
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const sched = getLocal('maladh:doctor_schedule', { vacations: [] });
          const newV = { id: 'vac_' + Date.now(), ...vacationData };
          if (!sched.vacations) sched.vacations = [];
          sched.vacations.push(newV);
          setLocal('maladh:doctor_schedule', sched);
          return newV;
        }
      },

      async deleteVacation(vacationId) {
        if (isRealCredentials && client) {
          const { error } = await client.from('specialist_vacations').delete().eq('id', vacationId);
          if (error) throw error;
          return true;
        } else {
          const sched = getLocal('maladh:doctor_schedule', { vacations: [] });
          if (sched.vacations) {
            sched.vacations = sched.vacations.filter(x => x.id !== vacationId);
            setLocal('maladh:doctor_schedule', sched);
          }
          return true;
        }
      }
    },

    // -------------------------------------------------------------------
    // 6. رحلة التعافي من الإدمان (Recovery Journey)
    // -------------------------------------------------------------------
    recovery: {
      async get(beneficiaryId) {
        if (isRealCredentials && client && beneficiaryId) {
          const { data } = await client
            .from('recovery_journey')
            .select('*')
            .eq('beneficiary_id', beneficiaryId)
            .single();
          return data;
        }
        return getLocal('maladh:beneficiary_recovery', {
          start_date: '2024-09-15',
          daily_savings: 100,
          target_days: 90
        });
      },

      async save(beneficiaryId, recoveryData) {
        if (isRealCredentials && client && beneficiaryId) {
          const { data, error } = await client
            .from('recovery_journey')
            .upsert({ beneficiary_id: beneficiaryId, ...recoveryData })
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          setLocal('maladh:beneficiary_recovery', recoveryData);
          return recoveryData;
        }
      }
    },

    // -------------------------------------------------------------------
    // 7. الدعم الخاص والمحادثات (Support & Chats)
    // -------------------------------------------------------------------
    support: {
      async getTickets(beneficiaryId = null) {
        if (isRealCredentials && client) {
          let query = client
            .from('support_tickets')
            .select('*, messages:support_messages(*)')
            .order('updated_at', { ascending: false });

          if (beneficiaryId) query = query.eq('beneficiary_id', beneficiaryId);

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        } else {
          return getLocal('maladh:admin_support_v1', []);
        }
      },

      async sendMessage(ticketId, senderId, senderRole, text, attachmentUrl = null) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('support_messages')
            .insert([{
              ticket_id: ticketId,
              sender_id: senderId,
              sender_role: senderRole,
              message_text: text,
              attachment_url: attachmentUrl
            }])
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          const tickets = getLocal('maladh:admin_support_v1', []);
          const t = tickets.find(x => x.id === ticketId);
          if (t) {
            const msg = { sender: senderRole, text, time: 'الآن' };
            t.messages.push(msg);
            setLocal('maladh:admin_support_v1', tickets);
            return msg;
          }
          return null;
        }
      }
    },

    // -------------------------------------------------------------------
    // 8. رفع الملفات إلى Supabase Storage
    // -------------------------------------------------------------------
    storage: {
      async upload(bucketName, filePath, fileObj) {
        if (isRealCredentials && client) {
          const { data, error } = await client.storage
            .from(bucketName)
            .upload(filePath, fileObj, { upsert: true });

          if (error) throw error;

          const { data: publicData } = client.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          return publicData.publicUrl;
        } else {
          // محاكاة تحويل إلى Object URL
          return URL.createObjectURL(fileObj);
        }
      }
    }
  };

})();
