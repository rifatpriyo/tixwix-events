-- Insert admin role (migrations bypass RLS)
INSERT INTO public.user_roles (user_id, role)
VALUES ('04feec29-1660-451c-923e-6d1713799813', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;