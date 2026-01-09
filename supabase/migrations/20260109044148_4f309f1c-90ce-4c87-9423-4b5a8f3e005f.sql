-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for subdomain status
CREATE TYPE public.subdomain_status AS ENUM ('active', 'pending', 'failed', 'disabled');

-- Create enum for DNS record type
CREATE TYPE public.dns_record_type AS ENUM ('A', 'CNAME');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create subdomains table
CREATE TABLE public.subdomains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL,
  full_domain TEXT NOT NULL,
  record_type dns_record_type NOT NULL,
  record_value TEXT NOT NULL,
  proxied BOOLEAN NOT NULL DEFAULT true,
  cloudflare_record_id TEXT,
  status subdomain_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (subdomain)
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_id TEXT,
  order_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reserved_subdomains table for blocked names
CREATE TABLE public.reserved_subdomains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain TEXT NOT NULL UNIQUE,
  reason TEXT
);

-- Insert reserved subdomain names
INSERT INTO public.reserved_subdomains (subdomain, reason) VALUES
  ('www', 'System reserved'),
  ('admin', 'System reserved'),
  ('api', 'System reserved'),
  ('mail', 'System reserved'),
  ('ftp', 'System reserved'),
  ('root', 'System reserved'),
  ('dashboard', 'System reserved'),
  ('login', 'System reserved'),
  ('register', 'System reserved'),
  ('auth', 'System reserved'),
  ('cdn', 'System reserved'),
  ('static', 'System reserved'),
  ('assets', 'System reserved'),
  ('ns1', 'System reserved'),
  ('ns2', 'System reserved');

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserved_subdomains ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's subdomain count
CREATE OR REPLACE FUNCTION public.get_user_subdomain_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.subdomains
  WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subdomains
CREATE POLICY "Users can view their own subdomains"
ON public.subdomains FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subdomains"
ON public.subdomains FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subdomains"
ON public.subdomains FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subdomains"
ON public.subdomains FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subdomains"
ON public.subdomains FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donations
CREATE POLICY "Users can view their own donations"
ON public.donations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create donations"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reserved_subdomains (public read)
CREATE POLICY "Anyone can view reserved subdomains"
ON public.reserved_subdomains FOR SELECT
USING (true);

CREATE POLICY "Admins can manage reserved subdomains"
ON public.reserved_subdomains FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subdomains_updated_at
  BEFORE UPDATE ON public.subdomains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_subdomains_user_id ON public.subdomains(user_id);
CREATE INDEX idx_subdomains_subdomain ON public.subdomains(subdomain);
CREATE INDEX idx_subdomains_status ON public.subdomains(status);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);