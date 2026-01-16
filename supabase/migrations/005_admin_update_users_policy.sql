-- Add RLS policy to allow admins to update any user
-- This is needed for admin features like changing user roles, activating/deactivating users

CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
