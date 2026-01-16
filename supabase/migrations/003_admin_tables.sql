-- =============================================
-- Admin Tables Migration
-- =============================================

-- Admin audit log for tracking all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_entity_type TEXT,  -- 'user', 'seller', 'product', 'order', 'category'
    target_entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);

-- Platform settings table for global configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
    ('platform_name', '"MSTORE"', 'Платформын нэр'),
    ('default_currency', '"MNT"', 'Үндсэн валют'),
    ('default_commission_rate', '10', 'Үндсэн комиссийн хувь (%)'),
    ('tax_rate', '10', 'НӨАТ-ийн хувь (%)'),
    ('min_payout_amount', '50000', 'Хамгийн бага төлбөрийн дүн'),
    ('free_shipping_threshold', '50000', 'Үнэгүй хүргэлтийн босго')
ON CONFLICT (key) DO NOTHING;

-- Add is_featured column to products if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'products'
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = TRUE;
    END IF;
END $$;

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on new tables
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admin audit log policies
CREATE POLICY "Admins can view audit log"
    ON public.admin_audit_log FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert audit log"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (public.is_admin());

-- Platform settings policies
CREATE POLICY "Anyone can view platform settings"
    ON public.platform_settings FOR SELECT
    USING (TRUE);

CREATE POLICY "Admins can update platform settings"
    ON public.platform_settings FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can insert platform settings"
    ON public.platform_settings FOR INSERT
    WITH CHECK (public.is_admin());

-- =============================================
-- Helper Functions
-- =============================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_user_id UUID DEFAULT NULL,
    p_target_entity_type TEXT DEFAULT NULL,
    p_target_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_log (
        admin_id,
        action,
        target_user_id,
        target_entity_type,
        target_entity_id,
        metadata
    ) VALUES (
        auth.uid(),
        p_action,
        p_target_user_id,
        p_target_entity_type,
        p_target_entity_id,
        p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform setting value
CREATE OR REPLACE FUNCTION public.get_platform_setting(p_key TEXT)
RETURNS JSONB AS $$
    SELECT value FROM public.platform_settings WHERE key = p_key;
$$ LANGUAGE sql STABLE;

-- Function to update platform setting
CREATE OR REPLACE FUNCTION public.update_platform_setting(
    p_key TEXT,
    p_value JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.platform_settings
    SET value = p_value,
        updated_by = auth.uid(),
        updated_at = NOW()
    WHERE key = p_key;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
