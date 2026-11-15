-- =====================================================================
-- منصة «ملاذ – MALADH» للصحة النفسية ودعم التعافي من الإدمان
-- هيكل قاعدة بيانات Supabase (Supabase PostgreSQL Schema)
-- يتضمن: الجداول، العلاقات، المفاتيح، الفهارس، سياسات الأمان RLS،
-- الدوال، المشغلات (Triggers)، والبيانات الأولية (Seed Data).
-- =====================================================================

-- 0. تفعيل الإضافات الضرورية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. جدول الحسابات والمستخدمين (Profiles)
-- مرتبط تلقائياً بجدول auth.users الخاص بـ Supabase Auth
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'beneficiary' CHECK (role IN ('beneficiary', 'specialist', 'admin')),
    avatar_url TEXT,
    age INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 2. جدول بيانات المختصين النفسيين الإضافية (Specialist Profiles)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.specialist_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'أخصائي نفسي',
    license_number TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualification TEXT DEFAULT 'ماجستير في علم النفس',
    experience_years TEXT DEFAULT '5+ سنوات',
    bio TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    hourly_rate NUMERIC(10, 2) DEFAULT 250.00,
    certificates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 3. جدول الخدمات الأساسية للمنصة (Services)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'i-heart',
    is_active BOOLEAN NOT NULL DEFAULT true,
    specialists_count INTEGER NOT NULL DEFAULT 1,
    sessions_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 4. جدول جداول التوفر للأخصائيين (Specialist Schedules)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.specialist_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE UNIQUE,
    days JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "sessionDuration": 45,
        "breakDuration": 10,
        "maxDailySessions": 8,
        "minNoticeHours": 2,
        "bookingWindowDays": 30
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 5. جدول الإجازات والعطلات المسجلة للأخصائي (Specialist Vacations)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.specialist_vacations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 6. جدول المواعيد والحجوزات (Appointments)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_code TEXT UNIQUE NOT NULL,
    beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    session_title TEXT NOT NULL DEFAULT 'جلسة استشارية نفسية',
    type TEXT NOT NULL DEFAULT 'عن بُعد' CHECK (type IN ('عن بُعد', 'حضوري', 'متابعة مسار التعافي', 'استشارة طارئة')),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'pending', 'confirmed', 'completed', 'cancelled')),
    status_text TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- منع حجز نفس الأخصائي في نفس التاريخ والوقت إذا لم يكن الموعد ملغياً
    CONSTRAINT unique_specialist_slot UNIQUE (specialist_id, appointment_date, appointment_time, status)
);

-- =====================================================================
-- 7. جدول طلبات الاستشارات المحالة (Consultation Requests)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.consultation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code TEXT UNIQUE NOT NULL,
    beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT,
    priority TEXT NOT NULL DEFAULT 'عادي' CHECK (priority IN ('عادي', 'عاجل', 'عاجل جداً')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'completed', 'rejected')),
    assigned_specialist_id UUID REFERENCES public.specialist_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 8. جدول تذاكر الدعم الخاص (Support Tickets)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code TEXT UNIQUE NOT NULL,
    beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 9. جدول رسائل الدعم الخاص (Support Messages)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 10. جدول محادثات الأخصائي مع المستفيدين (Doctor-Beneficiary Chats)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE,
    beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_doctor_patient_chat UNIQUE (specialist_id, beneficiary_id)
);

-- =====================================================================
-- 11. جدول رسائل المحادثات العلاجية (Chat Messages)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('doctor', 'beneficiary')),
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 12. جدول رحلة التعافي من الإدمان للمستفيد (Recovery Journey)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.recovery_journey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_savings NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    emergency_contact TEXT,
    target_days INTEGER NOT NULL DEFAULT 90,
    current_mood TEXT DEFAULT 'optimistic',
    milestones JSONB DEFAULT '[
        {"id": 1, "days": 7, "title": "أول أسبوع تعافي", "unlocked": true, "date": "2024-09-22"},
        {"id": 2, "days": 30, "title": "شهر من الصمود واليقظة", "unlocked": true, "date": "2024-10-15"},
        {"id": 3, "days": 60, "title": "استعادة التوازن الذهني", "unlocked": false, "date": null},
        {"id": 4, "days": 90, "title": "إتمام مسار التعافي الأساسي", "unlocked": false, "date": null}
    ]'::jsonb,
    journal_entries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 13. جدول الإشعارات والتنبيهات (Notifications)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'announcement',
    target_role TEXT DEFAULT 'everyone' CHECK (target_role IN ('everyone', 'all_beneficiaries', 'all_specialists', 'recovery_track', 'individual')),
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 14. جدول إعدادات النظام العامة (System Settings)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 15. الفهارس (Indexes) لتحسين سرعة الاستعلامات والبحث
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_specialists_specialty ON public.specialist_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_specialists_verified ON public.specialist_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_appointments_beneficiary ON public.appointments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialist ON public.appointments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_beneficiary ON public.support_tickets(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_doctor ON public.chat_conversations(specialist_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_patient ON public.chat_conversations(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_recovery_beneficiary ON public.recovery_journey(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON public.notifications(target_role, target_user_id);

-- =====================================================================
-- 16. مشغلات التحديث التلقائي (Updated_at Triggers)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_specialist_profiles_updated_at ON public.specialist_profiles;
CREATE TRIGGER trigger_specialist_profiles_updated_at BEFORE UPDATE ON public.specialist_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_services_updated_at ON public.services;
CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_specialist_schedules_updated_at ON public.specialist_schedules;
CREATE TRIGGER trigger_specialist_schedules_updated_at BEFORE UPDATE ON public.specialist_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_consultation_requests_updated_at ON public.consultation_requests;
CREATE TRIGGER trigger_consultation_requests_updated_at BEFORE UPDATE ON public.consultation_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_recovery_journey_updated_at ON public.recovery_journey;
CREATE TRIGGER trigger_recovery_journey_updated_at BEFORE UPDATE ON public.recovery_journey FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================================
-- 17. المشغل التلقائي لإنشاء الملف الشخصي عند التسجيل (Auth Hook)
-- يربط auth.users بجدول profiles فورياً وبأمان تام
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_phone TEXT;
    user_age INTEGER;
BEGIN
    -- قراءة البيانات المرفقة مع التسجيل من raw_user_meta_data
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'beneficiary');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_age := (NEW.raw_user_meta_data->>'age')::INTEGER;

    INSERT INTO public.profiles (id, full_name, email, phone, role, age)
    VALUES (NEW.id, user_name, NEW.email, user_phone, user_role, user_age)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- إذا كان المستخدم أخصائياً، يتم تلقائياً إنشاء سجل له في specialist_profiles
    IF user_role = 'specialist' THEN
        INSERT INTO public.specialist_profiles (
            id,
            title,
            license_number,
            specialty,
            bio,
            is_verified,
            is_available
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'title', 'أخصائي نفسي'),
            COALESCE(NEW.raw_user_meta_data->>'license', 'PSY-' || floor(random() * 90000 + 10000)::text),
            COALESCE(NEW.raw_user_meta_data->>'specialty', 'استشارات نفسية وعلاج سلوكي'),
            COALESCE(NEW.raw_user_meta_data->>'bio', 'أخصائي نفسي معتمد في منصة ملاذ.'),
            false,
            true
        ) ON CONFLICT (id) DO NOTHING;

        -- إنشاء جدول توفر افتراضي للأخصائي
        INSERT INTO public.specialist_schedules (specialist_id, days)
        VALUES (
            NEW.id,
            '[
                {"id": "saturday", "name": "السبت", "enabled": true, "periods": [{"id": 1, "startTime": "09:00", "endTime": "13:00"}, {"id": 2, "startTime": "16:00", "endTime": "20:00"}]},
                {"id": "sunday", "name": "الأحد", "enabled": true, "periods": [{"id": 1, "startTime": "09:00", "endTime": "13:00"}, {"id": 2, "startTime": "16:00", "endTime": "20:00"}]},
                {"id": "monday", "name": "الاثنين", "enabled": true, "periods": [{"id": 1, "startTime": "09:00", "endTime": "14:00"}]},
                {"id": "tuesday", "name": "الثلاثاء", "enabled": true, "periods": [{"id": 1, "startTime": "09:00", "endTime": "13:00"}, {"id": 2, "startTime": "16:00", "endTime": "20:00"}]},
                {"id": "wednesday", "name": "الأربعاء", "enabled": true, "periods": [{"id": 1, "startTime": "09:00", "endTime": "14:00"}]},
                {"id": "thursday", "name": "الخميس", "enabled": true, "periods": [{"id": 1, "startTime": "10:00", "endTime": "16:00"}]},
                {"id": "friday", "name": "الجمعة", "enabled": false, "periods": []}
            ]'::jsonb
        ) ON CONFLICT (specialist_id) DO NOTHING;
    END IF;

    -- إذا كان مستفيداً، يتم إنشاء سجل رحلة التعافي تلقائياً
    IF user_role = 'beneficiary' THEN
        INSERT INTO public.recovery_journey (beneficiary_id, start_date)
        VALUES (NEW.id, CURRENT_DATE)
        ON CONFLICT (beneficiary_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 18. سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- =====================================================================

-- تفعيل RLS على جميع الجداول بدون استثناء
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- دالة مساعدة لفحص هل المستخدم الحالي مدير (Admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة مساعدة لفحص هل المستخدم الحالي أخصائي (Specialist)
CREATE OR REPLACE FUNCTION public.is_specialist()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'specialist'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- سياسات Profiles
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
    FOR SELECT USING (
        -- السماح بقراءة معلومات الأخصائيين المعتمدين للعامة
        (role = 'specialist')
        OR (auth.uid() = id)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin full control on profiles" ON public.profiles;
CREATE POLICY "Admin full control on profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Specialist Profiles
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Specialist profiles public read" ON public.specialist_profiles;
CREATE POLICY "Specialist profiles public read" ON public.specialist_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Specialists can update own profile" ON public.specialist_profiles;
CREATE POLICY "Specialists can update own profile" ON public.specialist_profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin full control on specialists" ON public.specialist_profiles;
CREATE POLICY "Admin full control on specialists" ON public.specialist_profiles
    FOR ALL USING (public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Services (الخدمات)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read active services" ON public.services;
CREATE POLICY "Anyone can read active services" ON public.services
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
CREATE POLICY "Admin can manage services" ON public.services
    FOR ALL USING (public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Specialist Schedules & Vacations
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read schedules" ON public.specialist_schedules;
CREATE POLICY "Anyone can read schedules" ON public.specialist_schedules
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Specialist can manage own schedule" ON public.specialist_schedules;
CREATE POLICY "Specialist can manage own schedule" ON public.specialist_schedules
    FOR ALL USING (auth.uid() = specialist_id OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can read vacations" ON public.specialist_vacations;
CREATE POLICY "Anyone can read vacations" ON public.specialist_vacations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Specialist can manage own vacations" ON public.specialist_vacations;
CREATE POLICY "Specialist can manage own vacations" ON public.specialist_vacations
    FOR ALL USING (auth.uid() = specialist_id OR public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Appointments (المواعيد)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own appointments" ON public.appointments;
CREATE POLICY "Users can read own appointments" ON public.appointments
    FOR SELECT USING (
        auth.uid() = beneficiary_id
        OR auth.uid() = specialist_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Beneficiary can create appointments" ON public.appointments;
CREATE POLICY "Beneficiary can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (
        auth.uid() = beneficiary_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" ON public.appointments
    FOR UPDATE USING (
        auth.uid() = beneficiary_id
        OR auth.uid() = specialist_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admin can delete appointments" ON public.appointments;
CREATE POLICY "Admin can delete appointments" ON public.appointments
    FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Consultation Requests (طلبات الاستشارات)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own consultation requests" ON public.consultation_requests;
CREATE POLICY "Users can view own consultation requests" ON public.consultation_requests
    FOR SELECT USING (
        auth.uid() = beneficiary_id
        OR auth.uid() = assigned_specialist_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Beneficiary can insert consultation request" ON public.consultation_requests;
CREATE POLICY "Beneficiary can insert consultation request" ON public.consultation_requests
    FOR INSERT WITH CHECK (auth.uid() = beneficiary_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin and specialist can update consultation request" ON public.consultation_requests;
CREATE POLICY "Admin and specialist can update consultation request" ON public.consultation_requests
    FOR UPDATE USING (
        auth.uid() = assigned_specialist_id
        OR public.is_admin()
    );

-- ---------------------------------------------------------------------
-- سياسات Support Tickets & Messages (الدعم الخاص)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = beneficiary_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create support ticket" ON public.support_tickets;
CREATE POLICY "Users can create support ticket" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = beneficiary_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own support ticket" ON public.support_tickets;
CREATE POLICY "Users can update own support ticket" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = beneficiary_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view ticket messages" ON public.support_messages;
CREATE POLICY "Users can view ticket messages" ON public.support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id AND (t.beneficiary_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Users can insert ticket message" ON public.support_messages;
CREATE POLICY "Users can insert ticket message" ON public.support_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id AND (t.beneficiary_id = auth.uid() OR public.is_admin())
        )
    );

-- ---------------------------------------------------------------------
-- سياسات Chat Conversations & Messages (المحادثات السريرية)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Parties can view their chat conversations" ON public.chat_conversations;
CREATE POLICY "Parties can view their chat conversations" ON public.chat_conversations
    FOR SELECT USING (
        auth.uid() = specialist_id
        OR auth.uid() = beneficiary_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Parties can view chat messages" ON public.chat_messages;
CREATE POLICY "Parties can view chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
            AND (c.specialist_id = auth.uid() OR c.beneficiary_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Parties can insert chat messages" ON public.chat_messages;
CREATE POLICY "Parties can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
            AND (c.specialist_id = auth.uid() OR c.beneficiary_id = auth.uid() OR public.is_admin())
        )
    );

-- ---------------------------------------------------------------------
-- سياسات Recovery Journey (رحلة التعافي)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Beneficiary can manage own recovery journey" ON public.recovery_journey;
CREATE POLICY "Beneficiary can manage own recovery journey" ON public.recovery_journey
    FOR ALL USING (auth.uid() = beneficiary_id OR public.is_admin());

-- ---------------------------------------------------------------------
-- سياسات Notifications & Settings
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read relevant notifications" ON public.notifications;
CREATE POLICY "Users can read relevant notifications" ON public.notifications
    FOR SELECT USING (
        target_role = 'everyone'
        OR target_user_id = auth.uid()
        OR (target_role = 'all_beneficiaries' AND NOT public.is_specialist() AND NOT public.is_admin())
        OR (target_role = 'all_specialists' AND public.is_specialist())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admin can manage notifications" ON public.notifications;
CREATE POLICY "Admin can manage notifications" ON public.notifications
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings" ON public.system_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage system settings" ON public.system_settings;
CREATE POLICY "Admin can manage system settings" ON public.system_settings
    FOR ALL USING (public.is_admin());

-- =====================================================================
-- 19. البيانات الأولية التجريبية (Seed Data)
-- =====================================================================

-- الخدمات الأساسية الست
INSERT INTO public.services (id, slug, title, description, icon, is_active, specialists_count, sessions_count)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'individual-counseling', 'الاستشارات النفسية الفردية', 'جلسات علاجية متخصصة لعلاج الاكتئاب، اضطرابات القلق، الصدمات والضغوط النفسية مع مختصين مرخصين.', 'i-heart', true, 18, 680),
    ('a0000000-0000-0000-0000-000000000002', 'addiction-recovery', 'مسار دعم التعافي من الإدمان', 'برنامج علاجي وتأهيلي شامل للمتعافين من الإدمان وإدارة محفزات الانتكاسة مع خطة متابعة يومية.', 'i-sprout', true, 12, 502),
    ('a0000000-0000-0000-0000-000000000003', 'family-counseling', 'الإرشاد الأسري والعلاقات', 'استشارات متخصصة للتعامل مع الخلافات الأسرية والزوجية وبناء بيئة داعمة ومستقرة للأبناء.', 'i-users', true, 9, 292),
    ('a0000000-0000-0000-0000-000000000004', 'group-therapy', 'جلسات الدعم النفسي الجمعي', 'مجموعات دعم نفسية مقننة تحت إشراف أخصائي معتمد لمشاركة التجارب الإيجابية وبناء المرونة.', 'i-coffee', true, 6, 146),
    ('a0000000-0000-0000-0000-000000000005', 'emergency-support', 'التدخل النفسي الطارئ', 'قناة تدخل سريع ومباشر للتعامل مع الأزمات النفسية الحادة ونوبات الهلع على مدار الساعة.', 'i-shield', true, 8, 94),
    ('a0000000-0000-0000-0000-000000000006', 'clinical-assessment', 'التقييم والمقاييس النفسية', 'إجراء المقاييس والاختبارات الإكلينيكية المعتمدة لتشخيص دقيق وتحديد الخطة العلاجية الملائمة.', 'i-file-text', true, 14, 210)
ON CONFLICT (id) DO NOTHING;

-- الإعدادات العامة للمنصة
INSERT INTO public.system_settings (id, settings)
VALUES ('platform_config', '{
    "platformName": "منصة ملاذ للرعاية النفسية",
    "allowRegistration": true,
    "maintenanceMode": false,
    "minAge": 16,
    "cancellationWindowHours": 6,
    "currency": "SAR",
    "supportPhone": "772572361",
    "supportEmail": "support@maladh.com"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 20. إعداد حاويات التخزين (Supabase Storage Buckets)
-- ملاحظة: يتم تشغيلها في لوحة تحكم Supabase Storage
-- =====================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT DO NOTHING;
