-- Fix donations RLS policy to allow edge functions to insert records
-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create donations" ON public.donations;

-- Create a more permissive insert policy that allows NULL user_id (for guest donations)
-- and authenticated users to create their own donations
CREATE POLICY "Allow donation creation" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Add update policy for edge functions to update donation status
CREATE POLICY "Allow donation updates" 
ON public.donations 
FOR UPDATE 
USING (true);

-- Add column for donor info (for guest donations)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_phone text;