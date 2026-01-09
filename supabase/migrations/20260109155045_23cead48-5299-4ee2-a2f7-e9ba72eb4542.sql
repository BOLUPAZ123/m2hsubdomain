-- Add columns for custom landing page configuration
ALTER TABLE public.subdomains 
ADD COLUMN IF NOT EXISTS landing_type TEXT NOT NULL DEFAULT 'default' CHECK (landing_type IN ('default', 'redirect', 'html')),
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS html_content TEXT,
ADD COLUMN IF NOT EXISTS html_title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.subdomains.landing_type IS 'Type of landing page: default (main site), redirect (301/302), or html (custom HTML)';
COMMENT ON COLUMN public.subdomains.redirect_url IS 'URL to redirect to when landing_type is redirect';
COMMENT ON COLUMN public.subdomains.html_content IS 'Custom HTML content when landing_type is html';
COMMENT ON COLUMN public.subdomains.html_title IS 'Page title for custom HTML pages';