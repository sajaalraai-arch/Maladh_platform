/**
 * =====================================================================
 * عميل قاعدة بيانات Supabase المركزي لمنصة ملاذ (Maladh Supabase Client)
 * - متصل مباشرة بمشروع Supabase السحابي: MaladhPlatform
 * - يدير كافة العمليات الديناميكية: المصادقة، الأخصائيين، الخدمات،
 *   المواعيد، رحلة التعافي، الدعم الخاص، المحادثات، والتخزين السحابي.
 * - يتضمن نظام تخزين احتياطي آمن (Local Fallback) لضمان عدم توقف الواجهات.
 * =====================================================================
 */

(function () {
  'use strict';

  // 1. إعدادات الاتصال بمشروع Supabase المعتمد لمنصة ملاذ
  const DEFAULT_CONFIG = {
    url: 'https://aegoestllnwuzlmupqds.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZ29lc3RsbG53dXpsbXVwcWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MjIwNjQsImV4cCI6MjExMDI5ODA2NH0.TF5dqxUgEFHhD70mW5Wi-0toV_t9a-KevAdqEnHFMeM'
  };

  // فحص هل توجد إعدادات مخصصة محفوظة في LocalStorage
  const savedUrl = localStorage.getItem('maladh:supabase_url');
  const savedKey = localStorage.getItem('maladh:supabase_key');

  const SUPABASE_URL = savedUrl || (window.ENV && window.ENV.SUPABASE_URL) || DEFAULT_CONFIG.url;
  const SUPABASE_ANON_KEY = savedKey || (window.ENV && window.ENV.SUPABASE_ANON_KEY) || DEFAULT_CONFIG.anonKey;

  const isRealCredentials = Boolean(
    SUPABASE_URL &&
    !SUPABASE_URL.includes('xyzcompany') &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('placeholder')
  );

  let client = null;

  // تهيئة عميل Supabase الرسمي
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
      console.log('✅ [MaladhDB] متصل بقاعدة بيانات Supabase السحابية بنجاح:', SUPABASE_URL);
    } catch (err) {
      console.warn('⚠️ [MaladhDB] خطأ أثناء تهيئة العميل:', err.message);
    }
  }

  // دوال مساعدة للتخزين المحلي الاحتياطي
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

  // المعرفات الافتراضية الثابتة لحسابات الاختبار في حال عدم تسجيل الدخول المسبق
  const KNOWN_USERS = {
    beneficiary: {
      id: 'bd9557fa-cd22-40a5-b515-56220445ca25',
      email: 'user@maladh.com',
      username: 'عبد الرحمن محمد',
      role: 'beneficiary',
      phone: '0501234567'
    },
    specialist: {
      id: '11cea870-41e3-49e4-903c-6a2588520967',
      email: 'doctor@maladh.com',
      username: 'د. سارة العتيبي',
      role: 'specialist',
      title: 'أخصائية في علم النفس العلاجي',
      license: 'PSY-88492',
      specialty: 'استشارات نفسية وعلاج معرفي سلوكي',
      avatar: 'assets/specialist-sara.jpg'
    },
    admin: {
      id: '773d12c3-39b6-400a-ab85-2d1c99e1c97b',
      email: 'admin@maladh.com',
      username: 'أ. عبد الله الشمري',
      role: 'admin',
      title: 'مدير النظام'
    }
  };

  // =====================================================================
  // الواجهة البرمجية الموحدة للمنصة (window.MaladhDB)
  // =====================================================================
  window.MaladhDB = {
    client: client,
    isConfigured: () => isRealCredentials,

    // ضبط المفاتيح برمجياً في أي وقت
    setConfig: function (url, anonKey) {
      if (url && anonKey) {
        localStorage.setItem('maladh:supabase_url', url);
        localStorage.setItem('maladh:supabase_key', anonKey);
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
          title: title || (role === 'specialist' ? 'أخصائي نفسي مرخص' : null),
          license: license || null,
          specialty: specialty || null
        };

        if (isRealCredentials && client) {
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: { data: metadata }
          });

          if (error) throw error;

          if (data.user) {
            // ضمان وجود سجل بالملف الشخصي
            try {
              await client.from('profiles').upsert({
                id: data.user.id,
                full_name: username,
                email: email,
                phone: phone,
                role: role,
                age: age ? parseInt(age, 10) : null,
                is_active: true
              });
            } catch (pErr) {
              console.warn('[MaladhDB] Profile upsert notice:', pErr);
            }
          }

          return data;
        } else {
          const fakeUser = { id: 'usr_' + Date.now(), email, username, phone, age, role };
          setLocal('maladh:current_role', role);
          setLocal('maladh:user', fakeUser);
          return { user: fakeUser };
        }
      },

      // تسجيل الدخول بالبريد أو المعرف المختصر
      async signIn({ email, password }) {
        let cleanEmail = (email || '').trim().toLowerCase();
        let cleanPass = (password || '').trim();

        // تحويل الأسماء الشائعة إلى حسابات معتمدة
        if (cleanEmail === 'admin') {
          cleanEmail = 'admin@maladh.com';
          if (cleanPass === 'admin') cleanPass = 'admin123456';
        } else if (cleanEmail === 'doctor' || cleanEmail.includes('sara')) {
          cleanEmail = 'doctor@maladh.com';
          if (cleanPass === 'doctor') cleanPass = 'doctor123456';
        } else if (cleanEmail === 'user' || cleanEmail === 'patient') {
          cleanEmail = 'user@maladh.com';
          if (cleanPass === 'user' || cleanPass === 'user123') cleanPass = 'user123456';
        } else if (!cleanEmail.includes('@')) {
          cleanEmail = cleanEmail + '@maladh.com';
        }

        if (isRealCredentials && client) {
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass
          });

          if (error) throw error;

          const profile = await window.MaladhDB.auth.getProfile(data.user.id);
          const role = (profile && profile.role) || (data.user.user_metadata && data.user.user_metadata.role) || 'beneficiary';
          const name = (profile && profile.full_name) || (data.user.user_metadata && data.user.user_metadata.full_name) || cleanEmail.split('@')[0];

          const userObj = {
            id: data.user.id,
            email: data.user.email,
            username: name,
            role: role,
            phone: (profile && profile.phone) || '',
            age: (profile && profile.age) || (data.user.user_metadata && data.user.user_metadata.age) || '',
            emergencyContact: (profile && profile.emergency_contact) || '',
            recoveryStart: (profile && profile.recovery_start_date) || '',
            avatar: (profile && profile.avatar_url) || (role === 'specialist' ? 'assets/specialist-sara.jpg' : 'assets/user-avatar.svg')
          };

          setLocal('maladh:current_role', role);
          setLocal('maladh:user', userObj);

          if (role === 'specialist') {
            const specData = profile && profile.specialist_profiles;
            setLocal('maladh:doctor_user', {
              ...userObj,
              title: (specData && specData.title) || 'أخصائية في علم النفس العلاجي',
              license: (specData && specData.license_number) || 'PSY-88492',
              specialty: (specData && specData.specialty) || 'استشارات نفسية وعلاج معرفي سلوكي'
            });
          } else if (role === 'admin') {
            setLocal('maladh:admin_user', { ...userObj, title: 'مدير النظام' });
          }

          return { user: data.user, session: data.session, profile };
        } else {
          // نمط محلي احتياطي
          let role = 'beneficiary';
          if (cleanEmail.includes('admin')) role = 'admin';
          else if (cleanEmail.includes('doctor')) role = 'specialist';

          const demoUser = KNOWN_USERS[role] || { id: 'usr_local', email: cleanEmail, username: cleanEmail.split('@')[0], role };
          setLocal('maladh:current_role', role);
          setLocal('maladh:user', demoUser);
          if (role === 'specialist') setLocal('maladh:doctor_user', demoUser);
          if (role === 'admin') setLocal('maladh:admin_user', demoUser);

          return { user: demoUser, profile: demoUser };
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
        localStorage.removeItem('maladh:doctor_user');
        localStorage.removeItem('maladh:admin_user');
      },

      // الجلسة الحالية
      async getSession() {
        if (isRealCredentials && client) {
          const { data } = await client.auth.getSession();
          return data ? data.session : null;
        }
        return null;
      },

      // جلب الملف الشخصي
      async getProfile(userId) {
        if (isRealCredentials && client && userId) {
          const { data, error } = await client
            .from('profiles')
            .select('*, specialist_profiles(*)')
            .eq('id', userId)
            .maybeSingle();

          if (error) {
            console.warn('[MaladhDB] Profile query error:', error.message);
            return null;
          }
          return data;
        }
        return getLocal('maladh:user', null);
      },

      // تحديث الملف الشخصي
      async updateProfile(userId, profileData) {
        if (isRealCredentials && client && userId) {
          const { data, error } = await client
            .from('profiles')
            .update(profileData)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;

          const u = getLocal('maladh:user', {});
          setLocal('maladh:user', { ...u, ...data });
          return data;
        } else {
          const u = getLocal('maladh:user', {});
          const updated = { ...u, ...profileData };
          setLocal('maladh:user', updated);
          return updated;
        }
      },

      // استرجاع جميع المستخدمين المسجلين (للوحة المدير)
      async getAllProfiles({ role = null } = {}) {
        if (isRealCredentials && client) {
          let query = client.from('profiles').select('*').order('created_at', { ascending: false });
          if (role) query = query.eq('role', role);
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }
        return [];
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
              profiles:profiles!id ( id, full_name, email, phone, avatar_url, is_active )
            `)
            .order('rating', { ascending: false });

          if (verifiedOnly) query = query.eq('is_verified', true);
          if (specialty) query = query.ilike('specialty', `%${specialty}%`);

          const { data, error } = await query;
          if (error) {
            console.warn('[MaladhDB] Specialist query notice:', error.message);
            return getLocal('maladh:admin_specialists_v1', []);
          }

          let list = (data || []).map(item => ({
            id: item.id,
            name: (item.profiles && item.profiles.full_name) || 'د. أخصائي معتمد',
            title: item.title || 'أخصائي نفسي',
            license: item.license_number || 'PSY-00000',
            license_number: item.license_number,
            specialty: item.specialty || 'استشارات نفسية',
            qualification: item.qualification || 'ماجستير في علم النفس',
            experience_years: item.experience_years || '5+ سنوات خبرة',
            rating: Number(item.rating) || 4.9,
            total_sessions: item.total_sessions || 0,
            sessions: item.total_sessions || 0,
            verified: item.is_verified === true,
            is_verified: item.is_verified,
            available: item.is_available === true,
            is_available: item.is_available,
            email: (item.profiles && item.profiles.email) || '',
            phone: (item.profiles && item.profiles.phone) || '',
            avatar: (item.profiles && item.profiles.avatar_url) || 'assets/specialist-sara.jpg',
            profiles: item.profiles
          }));

          if (search) {
            const s = search.toLowerCase();
            list = list.filter(x =>
              (x.name && x.name.toLowerCase().includes(s)) ||
              (x.specialty && x.specialty.toLowerCase().includes(s)) ||
              (x.license && x.license.toLowerCase().includes(s))
            );
          }

          return list;
        } else {
          return getLocal('maladh:admin_specialists_v1', []);
        }
      },

      // اعتماد أو إلغاء اعتماد أخصائي (Admin)
      async verifySpecialist(id, isVerified) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('specialist_profiles')
            .update({ is_verified: isVerified })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      },

      // تغيير حالة التوفر لاستقبال الجلسات
      async setAvailability(id, isAvailable) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('specialist_profiles')
            .update({ is_available: isAvailable })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      },

      // تحديث بيانات الأخصائي
      async updateProfile(id, updates) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('specialist_profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
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

          if (error) {
            console.warn('[MaladhDB] Services query error:', error.message);
            return getLocal('maladh:admin_services_v1', []);
          }
          return data || [];
        } else {
          return getLocal('maladh:admin_services_v1', []);
        }
      },

      async create(serviceData) {
        if (isRealCredentials && client) {
          const { data, error } = await client.from('services').insert([serviceData]).select().single();
          if (error) throw error;
          return data;
        }
      },

      async update(id, updates) {
        if (isRealCredentials && client) {
          const { data, error } = await client.from('services').update(updates).eq('id', id).select().single();
          if (error) throw error;
          return data;
        }
      },

      async delete(id) {
        if (isRealCredentials && client) {
          const { error } = await client.from('services').delete().eq('id', id);
          if (error) throw error;
          return true;
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
              beneficiary:profiles!beneficiary_id ( id, full_name, email, phone, avatar_url ),
              specialist:specialist_profiles!specialist_id (
                id, title, specialty, license_number,
                profiles:profiles!id ( full_name, avatar_url )
              ),
              service:services!service_id ( id, title, icon )
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
          if (error) {
            console.warn('[MaladhDB] Appointments query error:', error.message);
            return getLocal('maladh:beneficiary_appts', []);
          }
          return data || [];
        } else {
          return role === 'specialist'
            ? getLocal('maladh:doctor_appts_v2', [])
            : getLocal('maladh:beneficiary_appts', []);
        }
      },

      async getBookedSlots(specialistId, date) {
        if (!specialistId || !date) return [];
        const KNOWN_SPEC_MAP = {
          'sara': '11cea870-41e3-49e4-903c-6a2588520967',
          'ahmed': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
          'khaled': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
          'noura': 'fc8dcf8f-7c4d-4560-871a-62660a894a86',
          'dossari': '68e03204-42f7-47b5-ba71-1cd6ec05eb52',
          'subaie': '22bb2516-a40e-47a2-86d1-bb396efc82f9'
        };
        const resolvedId = KNOWN_SPEC_MAP[specialistId] || specialistId;
        if (isRealCredentials && client) {
          try {
            const { data } = await client
              .from('appointments')
              .select('appointment_time, status')
              .eq('specialist_id', resolvedId)
              .eq('appointment_date', date)
              .neq('status', 'cancelled');
            return (data || []).map(a => a.appointment_time);
          } catch (e) {
            console.warn('getBookedSlots failed:', e);
            return [];
          }
        }
        return [];
      },

      async create(apptData) {
        if (isRealCredentials && client) {
          const code = 'APT-' + Math.floor(1000 + Math.random() * 9000);
          const KNOWN_SPEC_MAP = {
            'sara': '11cea870-41e3-49e4-903c-6a2588520967',
            'ahmed': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
            'khaled': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
            'noura': 'fc8dcf8f-7c4d-4560-871a-62660a894a86',
            'dossari': '68e03204-42f7-47b5-ba71-1cd6ec05eb52',
            'subaie': '22bb2516-a40e-47a2-86d1-bb396efc82f9'
          };
          let resolvedSpecId = apptData.specialist_id || apptData.specialistId || KNOWN_USERS.specialist.id;
          if (KNOWN_SPEC_MAP[resolvedSpecId]) resolvedSpecId = KNOWN_SPEC_MAP[resolvedSpecId];
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(resolvedSpecId)) {
            resolvedSpecId = '11cea870-41e3-49e4-903c-6a2588520967';
          }

          let resolvedBenId = apptData.beneficiary_id || apptData.beneficiaryId || KNOWN_USERS.beneficiary.id;
          if (!uuidRegex.test(resolvedBenId)) {
            resolvedBenId = 'bd9557fa-cd22-40a5-b515-56220445ca25';
          }

          const payload = {
            appointment_code: code,
            beneficiary_id: resolvedBenId,
            specialist_id: resolvedSpecId,
            service_id: apptData.service_id || apptData.serviceId || null,
            appointment_date: apptData.appointment_date || apptData.date,
            appointment_time: apptData.appointment_time || apptData.time,
            session_title: apptData.session_title || apptData.sessionTitle || 'جلسة استشارية نفسية',
            type: apptData.type || 'عن بُعد',
            status: apptData.status || 'upcoming',
            status_text: apptData.status === 'confirmed' ? 'موعد مؤكد' : 'قيد الانتظار',
            notes: apptData.notes || ''
          };

          const { data, error } = await client.from('appointments').insert([payload]).select().single();
          if (error) throw error;
          return data;
        } else {
          const list = getLocal('maladh:beneficiary_appts', []);
          const newAppt = {
            id: 'apt-' + Date.now(),
            appointment_code: 'APT-' + Math.floor(1000 + Math.random() * 9000),
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
            .update({ status: 'cancelled', status_text: 'ملغي', cancellation_reason: reason })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      },

      async reschedule(id, newDate, newTime) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('appointments')
            .update({ appointment_date: newDate, appointment_time: newTime, status: 'upcoming', status_text: 'قيد الانتظار' })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      },

      async updateStatus(id, newStatus, clinicalNotes = null) {
        if (isRealCredentials && client) {
          const updateObj = {
            status: newStatus,
            status_text: newStatus === 'confirmed' ? 'موعد مؤكد' : (newStatus === 'completed' ? 'مكتمل' : 'قيد الانتظار')
          };
          if (clinicalNotes !== null) updateObj.clinical_notes = clinicalNotes;

          const { data, error } = await client
            .from('appointments')
            .update(updateObj)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }
    },

    // -------------------------------------------------------------------
    // 5. جدول التوفر والإجازات (Availability Schedule & Vacations)
    // -------------------------------------------------------------------
    schedule: {
      async get(specialistId) {
        const KNOWN_SPEC_MAP = {
          'sara': '11cea870-41e3-49e4-903c-6a2588520967',
          'ahmed': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
          'khaled': 'ffc95dd7-bc11-4e95-a92c-826c9a1a15ec',
          'noura': 'fc8dcf8f-7c4d-4560-871a-62660a894a86',
          'dossari': '68e03204-42f7-47b5-ba71-1cd6ec05eb52',
          'subaie': '22bb2516-a40e-47a2-86d1-bb396efc82f9'
        };
        const resolvedId = KNOWN_SPEC_MAP[specialistId] || specialistId;
        if (isRealCredentials && client && resolvedId) {
          const { data: schedule } = await client
            .from('specialist_schedules')
            .select('*')
            .eq('specialist_id', resolvedId)
            .maybeSingle();

          const { data: vacations } = await client
            .from('specialist_vacations')
            .select('*')
            .eq('specialist_id', resolvedId);

          return {
            days: (schedule && schedule.days) || [],
            settings: (schedule && schedule.settings) || {},
            vacations: vacations || []
          };
        }
        return getLocal('maladh:doctor_schedule', null);
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
        }
      },

      async deleteVacation(vacationId) {
        if (isRealCredentials && client) {
          const { error } = await client.from('specialist_vacations').delete().eq('id', vacationId);
          if (error) throw error;
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
          const { data, error } = await client
            .from('recovery_journey')
            .select('*')
            .eq('beneficiary_id', beneficiaryId)
            .maybeSingle();

          if (!error && data) return data;
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
        }
      },

      async addJournalEntry(beneficiaryId, entry) {
        if (isRealCredentials && client && beneficiaryId) {
          const current = await this.get(beneficiaryId);
          const entries = (current && current.journal_entries) || [];
          entries.unshift(entry);
          return await this.save(beneficiaryId, { journal_entries: entries });
        }
      }
    },

    // -------------------------------------------------------------------
    // 7. الدعم الخاص والمحادثات السريرية (Support & Clinical Chats)
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
          if (error) return getLocal('maladh:admin_support_v1', []);
          return data || [];
        }
        return getLocal('maladh:admin_support_v1', []);
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
        }
      },

      async updateTicketStatus(ticketId, status) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }
    },

    // -------------------------------------------------------------------
    // 8. محادثات الأخصائي مع المستفيدين (Doctor-Patient Chats)
    // -------------------------------------------------------------------
    chats: {
      async getConversations(userId, role = 'beneficiary') {
        if (isRealCredentials && client && userId) {
          let query = client
            .from('chat_conversations')
            .select(`
              *,
              patient:profiles!beneficiary_id ( id, full_name, avatar_url, phone ),
              doctor:specialist_profiles!specialist_id (
                id, title, specialty,
                profiles:profiles!id ( full_name, avatar_url )
              ),
              messages:chat_messages (*)
            `)
            .order('last_message_at', { ascending: false });

          if (role === 'specialist') query = query.eq('specialist_id', userId);
          else query = query.eq('beneficiary_id', userId);

          const { data, error } = await query;
          if (error) return [];
          return data || [];
        }
        return [];
      },

      async sendMessage(conversationId, senderId, senderRole, text, attachmentUrl = null) {
        if (isRealCredentials && client) {
          const { data: msg, error: msgErr } = await client
            .from('chat_messages')
            .insert([{
              conversation_id: conversationId,
              sender_id: senderId,
              sender_role: senderRole,
              message_text: text,
              attachment_url: attachmentUrl
            }])
            .select()
            .single();

          if (msgErr) throw msgErr;

          // تحديث آخر رسالة في المحادثة
          await client
            .from('chat_conversations')
            .update({
              last_message: text,
              last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId);

          return msg;
        }
      }
    },

    // -------------------------------------------------------------------
    // 9. الإشعارات والتنبيهات (Notifications)
    // -------------------------------------------------------------------
    notifications: {
      async getAll(userId = null, role = 'everyone') {
        if (isRealCredentials && client) {
          let query = client
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

          const { data, error } = await query;
          if (error) return [];
          return data || [];
        }
        return [];
      },

      async send({ title, message, type = 'announcement', target_role = 'everyone', target_user_id = null }) {
        if (isRealCredentials && client) {
          const { data, error } = await client
            .from('notifications')
            .insert([{
              title,
              message,
              type,
              target_role,
              target_user_id
            }])
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }
    },

    // -------------------------------------------------------------------
    // 10. رفع وتخزين الملفات (Supabase Storage)
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
          return URL.createObjectURL(fileObj);
        }
      }
    }
  };

  // ربط المستخدم التجريبي الافتراضي في LocalStorage فقط إذا لم يكن هناك أي مستخدم مسجل مسبقاً
  try {
    const currentRole = localStorage.getItem('maladh:current_role') || 'beneficiary';
    const currentUser = getLocal('maladh:user', null);
    if (!currentUser || (!currentUser.username && !currentUser.email)) {
      const defaultUser = KNOWN_USERS[currentRole] || KNOWN_USERS.beneficiary;
      setLocal('maladh:user', defaultUser);
      if (currentRole === 'specialist') setLocal('maladh:doctor_user', KNOWN_USERS.specialist);
      if (currentRole === 'admin') setLocal('maladh:admin_user', KNOWN_USERS.admin);
    }
  } catch (e) {}

})();
