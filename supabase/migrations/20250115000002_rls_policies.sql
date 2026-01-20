-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'admin' FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.seller_profiles
        WHERE user_id = auth.uid() AND status = 'approved'
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_seller_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- ============================================
-- USERS POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================
-- SELLER PROFILES POLICIES
-- ============================================

CREATE POLICY "Public can view approved sellers"
    ON public.seller_profiles FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Sellers can view own profile"
    ON public.seller_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create seller profile"
    ON public.seller_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can update own profile"
    ON public.seller_profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all sellers"
    ON public.seller_profiles FOR ALL
    USING (public.is_admin());

-- ============================================
-- USER ADDRESSES POLICIES
-- ============================================

CREATE POLICY "Users can manage own addresses"
    ON public.user_addresses FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Sellers can view own products"
    ON public.products FOR SELECT
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Sellers can create products"
    ON public.products FOR INSERT
    WITH CHECK (seller_id = public.get_seller_profile_id() AND public.is_seller());

CREATE POLICY "Sellers can update own products"
    ON public.products FOR UPDATE
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Sellers can delete own products"
    ON public.products FOR DELETE
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Admins can manage all products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCT VARIANTS POLICIES
-- ============================================

CREATE POLICY "Public can view variants of active products"
    ON public.product_variants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.status = 'active'
        )
    );

CREATE POLICY "Sellers can view own variants"
    ON public.product_variants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

CREATE POLICY "Sellers can manage own variants"
    ON public.product_variants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

CREATE POLICY "Admins can manage all variants"
    ON public.product_variants FOR ALL
    USING (public.is_admin());

-- ============================================
-- INVENTORY POLICIES
-- ============================================

CREATE POLICY "Public can view inventory"
    ON public.inventory FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = variant_id AND p.status = 'active'
        )
    );

CREATE POLICY "Sellers can manage own inventory"
    ON public.inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = variant_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

CREATE POLICY "Admins can manage all inventory"
    ON public.inventory FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.status = 'active'
        )
    );

CREATE POLICY "Sellers can manage own product images"
    ON public.product_images FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

CREATE POLICY "Admins can manage all images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCT REVIEWS POLICIES
-- ============================================

CREATE POLICY "Public can view approved reviews"
    ON public.product_reviews FOR SELECT
    USING (is_approved = TRUE);

CREATE POLICY "Users can create reviews"
    ON public.product_reviews FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
    ON public.product_reviews FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
    ON public.product_reviews FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
    ON public.product_reviews FOR ALL
    USING (public.is_admin());

-- ============================================
-- REVIEW VOTES POLICIES
-- ============================================

CREATE POLICY "Users can manage own votes"
    ON public.review_votes FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- CART ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can manage own cart"
    ON public.cart_items FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- WISHLISTS POLICIES
-- ============================================

CREATE POLICY "Users can manage own wishlists"
    ON public.wishlists FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view public wishlists"
    ON public.wishlists FOR SELECT
    USING (is_public = TRUE);

-- ============================================
-- WISHLIST ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can manage own wishlist items"
    ON public.wishlist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.wishlists w
            WHERE w.id = wishlist_id AND w.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view public wishlist items"
    ON public.wishlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.wishlists w
            WHERE w.id = wishlist_id AND w.is_public = TRUE
        )
    );

-- ============================================
-- ORDERS POLICIES
-- ============================================

CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can view order items for their products"
    ON public.order_items FOR SELECT
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Sellers can update own order items"
    ON public.order_items FOR UPDATE
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Admins can manage all order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (public.is_admin());

-- ============================================
-- SELLER PAYOUTS POLICIES
-- ============================================

CREATE POLICY "Sellers can view own payouts"
    ON public.seller_payouts FOR SELECT
    USING (seller_id = public.get_seller_profile_id());

CREATE POLICY "Admins can manage all payouts"
    ON public.seller_payouts FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCT VIEWS POLICIES
-- ============================================

CREATE POLICY "Anyone can insert product views"
    ON public.product_views FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Sellers can view analytics for their products"
    ON public.product_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

CREATE POLICY "Admins can view all product views"
    ON public.product_views FOR SELECT
    USING (public.is_admin());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());
