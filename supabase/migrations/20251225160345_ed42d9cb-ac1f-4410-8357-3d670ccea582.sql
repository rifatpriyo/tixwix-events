-- Allow admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all booking items
CREATE POLICY "Admins can view all booking items"
ON public.booking_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));