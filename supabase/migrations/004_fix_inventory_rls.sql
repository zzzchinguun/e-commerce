-- Fix inventory RLS policy to properly handle INSERT operations
-- The original policy only has USING clause which works for SELECT/UPDATE/DELETE
-- but INSERT requires WITH CHECK clause to verify the new row

-- Drop the existing policy
DROP POLICY IF EXISTS "Sellers can manage own inventory" ON public.inventory;

-- Recreate with explicit WITH CHECK for inserts
CREATE POLICY "Sellers can manage own inventory"
    ON public.inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = inventory.variant_id AND p.seller_id = public.get_seller_profile_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = variant_id AND p.seller_id = public.get_seller_profile_id()
        )
    );

-- Also add a simpler INSERT-only policy as a fallback
-- This allows sellers to insert inventory for their own product variants
CREATE POLICY "Sellers can insert own inventory"
    ON public.inventory FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = variant_id AND p.seller_id = public.get_seller_profile_id()
        )
    );
