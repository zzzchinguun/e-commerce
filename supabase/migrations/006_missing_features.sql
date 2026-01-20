-- =============================================
-- Migration: Missing Features
-- Description: Adds tables for featured categories, coupons, and seller notification preferences
-- =============================================

-- =============================================
-- 1. FEATURED CATEGORIES TABLE
-- Used for displaying featured category cards on the homepage
-- =============================================

CREATE TABLE IF NOT EXISTS public.featured_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Package',  -- Lucide icon name
    color TEXT NOT NULL DEFAULT '#3b82f6',  -- Text/icon color
    bg_color TEXT NOT NULL DEFAULT '#eff6ff',  -- Background color
    image_url TEXT,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,  -- Optional link to actual category
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_featured_categories_is_active ON public.featured_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_categories_display_order ON public.featured_categories(display_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_featured_categories_slug ON public.featured_categories(slug);

-- Trigger for updated_at
CREATE TRIGGER update_featured_categories_updated_at
    BEFORE UPDATE ON public.featured_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.featured_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured categories"
    ON public.featured_categories FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert featured categories"
    ON public.featured_categories FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update featured categories"
    ON public.featured_categories FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete featured categories"
    ON public.featured_categories FOR DELETE
    USING (public.is_admin());

-- Seed default featured categories
INSERT INTO public.featured_categories (name, slug, icon, color, bg_color, display_order) VALUES
    ('Цахилгаан бараа', 'electronics', 'Smartphone', '#3b82f6', '#eff6ff', 0),
    ('Хувцас', 'clothing', 'Shirt', '#ec4899', '#fdf2f8', 1),
    ('Гэр ахуй', 'home-garden', 'Home', '#22c55e', '#f0fdf4', 2),
    ('Спорт', 'sports', 'Dumbbell', '#f97316', '#fff7ed', 3),
    ('Ном', 'books', 'BookOpen', '#8b5cf6', '#f5f3ff', 4),
    ('Гоо сайхан', 'beauty', 'Sparkles', '#ef4444', '#fef2f2', 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. COUPONS TABLE
-- For promo code/discount coupon system
-- =============================================

-- Coupon discount type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_discount_type') THEN
        CREATE TYPE public.coupon_discount_type AS ENUM ('percentage', 'fixed_amount');
    END IF;
END $$;

-- Coupon status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_status') THEN
        CREATE TYPE public.coupon_status AS ENUM ('active', 'inactive', 'expired');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    description TEXT,
    discount_type public.coupon_discount_type NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,  -- Percentage (0-100) or fixed amount
    min_order_amount DECIMAL(10, 2) DEFAULT 0,  -- Minimum order to apply
    max_discount_amount DECIMAL(10, 2),  -- Cap for percentage discounts
    usage_limit INTEGER,  -- Total uses allowed (NULL = unlimited)
    usage_count INTEGER DEFAULT 0 NOT NULL,  -- Current usage count
    per_user_limit INTEGER DEFAULT 1,  -- Uses per user (NULL = unlimited)
    valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMPTZ,  -- NULL = no expiry
    status public.coupon_status DEFAULT 'active' NOT NULL,
    applies_to_products UUID[],  -- NULL = all products
    applies_to_categories UUID[],  -- NULL = all categories
    applies_to_sellers UUID[],  -- NULL = all sellers
    excludes_sale_items BOOLEAN DEFAULT FALSE,
    first_order_only BOOLEAN DEFAULT FALSE,  -- Only for first-time customers
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Unique constraint on code
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(UPPER(code));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON public.coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Coupon usage tracking table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for checking user usage
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_user ON public.coupon_usages(coupon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order ON public.coupon_usages(order_id);

-- RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
    ON public.coupons FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can insert coupons"
    ON public.coupons FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update coupons"
    ON public.coupons FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete coupons"
    ON public.coupons FOR DELETE
    USING (public.is_admin());

-- RLS for coupon_usages
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupon usages"
    ON public.coupon_usages FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "System can insert coupon usages"
    ON public.coupon_usages FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- 3. SELLER NOTIFICATION PREFERENCES TABLE
-- For persisting seller notification settings
-- =============================================

CREATE TABLE IF NOT EXISTS public.seller_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    -- Email notifications
    email_new_order BOOLEAN DEFAULT TRUE NOT NULL,
    email_order_cancelled BOOLEAN DEFAULT TRUE NOT NULL,
    email_low_stock BOOLEAN DEFAULT TRUE NOT NULL,
    email_new_review BOOLEAN DEFAULT TRUE NOT NULL,
    email_payout_processed BOOLEAN DEFAULT TRUE NOT NULL,
    email_weekly_summary BOOLEAN DEFAULT TRUE NOT NULL,
    -- Push/In-app notifications
    push_new_order BOOLEAN DEFAULT TRUE NOT NULL,
    push_order_cancelled BOOLEAN DEFAULT TRUE NOT NULL,
    push_low_stock BOOLEAN DEFAULT TRUE NOT NULL,
    push_new_review BOOLEAN DEFAULT TRUE NOT NULL,
    -- Marketing
    marketing_tips BOOLEAN DEFAULT FALSE NOT NULL,
    marketing_promotions BOOLEAN DEFAULT FALSE NOT NULL,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure one preference row per seller
    CONSTRAINT unique_seller_notification_preferences UNIQUE (seller_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_seller_notification_preferences_updated_at
    BEFORE UPDATE ON public.seller_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.seller_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own notification preferences"
    ON public.seller_notification_preferences FOR SELECT
    USING (
        seller_id IN (
            SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Sellers can insert their own notification preferences"
    ON public.seller_notification_preferences FOR INSERT
    WITH CHECK (
        seller_id IN (
            SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can update their own notification preferences"
    ON public.seller_notification_preferences FOR UPDATE
    USING (
        seller_id IN (
            SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- 4. USER NOTIFICATION PREFERENCES TABLE
-- For persisting customer notification settings
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Email notifications
    email_order_updates BOOLEAN DEFAULT TRUE NOT NULL,
    email_shipping_updates BOOLEAN DEFAULT TRUE NOT NULL,
    email_promotions BOOLEAN DEFAULT FALSE NOT NULL,
    email_newsletter BOOLEAN DEFAULT FALSE NOT NULL,
    email_product_updates BOOLEAN DEFAULT FALSE NOT NULL,  -- Wishlist/saved items updates
    -- Push/In-app notifications
    push_order_updates BOOLEAN DEFAULT TRUE NOT NULL,
    push_shipping_updates BOOLEAN DEFAULT TRUE NOT NULL,
    push_promotions BOOLEAN DEFAULT FALSE NOT NULL,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure one preference row per user
    CONSTRAINT unique_user_notification_preferences UNIQUE (user_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON public.user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
    ON public.user_notification_preferences FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert their own notification preferences"
    ON public.user_notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON public.user_notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to validate and apply a coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    p_code TEXT,
    p_user_id UUID,
    p_order_subtotal DECIMAL(10, 2)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT,
    coupon_id UUID,
    discount_type public.coupon_discount_type,
    discount_value DECIMAL(10, 2),
    calculated_discount DECIMAL(10, 2)
) AS $$
DECLARE
    v_coupon RECORD;
    v_user_usage_count INTEGER;
    v_calculated_discount DECIMAL(10, 2);
    v_is_first_order BOOLEAN;
BEGIN
    -- Find the coupon
    SELECT * INTO v_coupon
    FROM public.coupons c
    WHERE UPPER(c.code) = UPPER(p_code)
    AND c.status = 'active'
    AND c.valid_from <= NOW()
    AND (c.valid_until IS NULL OR c.valid_until > NOW());

    -- Check if coupon exists
    IF v_coupon.id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Купон олдсонгүй эсвэл хүчингүй болсон'::TEXT, NULL::UUID, NULL::public.coupon_discount_type, NULL::DECIMAL, NULL::DECIMAL;
        RETURN;
    END IF;

    -- Check usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT FALSE, 'Купоны хэрэглээний лимит дууссан'::TEXT, NULL::UUID, NULL::public.coupon_discount_type, NULL::DECIMAL, NULL::DECIMAL;
        RETURN;
    END IF;

    -- Check per-user limit
    IF v_coupon.per_user_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_usage_count
        FROM public.coupon_usages
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_user_usage_count >= v_coupon.per_user_limit THEN
            RETURN QUERY SELECT FALSE, 'Та энэ купоныг аль хэдийн ашигласан байна'::TEXT, NULL::UUID, NULL::public.coupon_discount_type, NULL::DECIMAL, NULL::DECIMAL;
            RETURN;
        END IF;
    END IF;

    -- Check minimum order amount
    IF v_coupon.min_order_amount > 0 AND p_order_subtotal < v_coupon.min_order_amount THEN
        RETURN QUERY SELECT FALSE, ('Захиалгын хамгийн бага дүн: ₮' || v_coupon.min_order_amount::TEXT)::TEXT, NULL::UUID, NULL::public.coupon_discount_type, NULL::DECIMAL, NULL::DECIMAL;
        RETURN;
    END IF;

    -- Check first order only
    IF v_coupon.first_order_only THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.orders
            WHERE user_id = p_user_id AND payment_status IN ('succeeded', 'paid')
        ) INTO v_is_first_order;

        IF NOT v_is_first_order THEN
            RETURN QUERY SELECT FALSE, 'Энэ купон зөвхөн анхны захиалгад хамаарна'::TEXT, NULL::UUID, NULL::public.coupon_discount_type, NULL::DECIMAL, NULL::DECIMAL;
            RETURN;
        END IF;
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_calculated_discount := p_order_subtotal * (v_coupon.discount_value / 100);
        -- Apply max discount cap if set
        IF v_coupon.max_discount_amount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount_amount THEN
            v_calculated_discount := v_coupon.max_discount_amount;
        END IF;
    ELSE
        v_calculated_discount := v_coupon.discount_value;
    END IF;

    -- Don't allow discount greater than subtotal
    IF v_calculated_discount > p_order_subtotal THEN
        v_calculated_discount := p_order_subtotal;
    END IF;

    RETURN QUERY SELECT
        TRUE,
        NULL::TEXT,
        v_coupon.id,
        v_coupon.discount_type,
        v_coupon.discount_value,
        v_calculated_discount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply coupon (increment usage)
CREATE OR REPLACE FUNCTION public.apply_coupon(
    p_coupon_id UUID,
    p_user_id UUID,
    p_order_id UUID,
    p_discount_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Record usage
    INSERT INTO public.coupon_usages (coupon_id, user_id, order_id, discount_amount)
    VALUES (p_coupon_id, p_user_id, p_order_id, p_discount_amount);

    -- Increment usage count
    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = p_coupon_id;

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ADD COUPON FIELDS TO ORDERS TABLE
-- =============================================

DO $$
BEGIN
    -- Add coupon_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'coupon_id'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;
    END IF;

    -- Add coupon_code column (for historical reference)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;

    -- Add coupon_discount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'coupon_discount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN coupon_discount DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Index for coupon lookups on orders
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);
