INSERT INTO public.user_roles (user_id, role)
VALUES ('e231a1b6-0a74-4feb-9b4a-eb0fabe31541', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;