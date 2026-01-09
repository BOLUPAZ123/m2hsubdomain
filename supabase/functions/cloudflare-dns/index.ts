import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token)
    
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = claimsData.user.id
    const { action, ...data } = await req.json()
    const DOMAIN = 'cashurl.shop'

    switch (action) {
      case 'create': {
        const { subdomain } = data

        // Validate subdomain format
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,18}[a-z0-9])?$/
        if (!subdomainRegex.test(subdomain)) {
          return new Response(JSON.stringify({ error: 'Invalid subdomain format' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check if subdomain is reserved
        const { data: reserved } = await supabase
          .from('reserved_subdomains')
          .select('subdomain')
          .eq('subdomain', subdomain)
          .maybeSingle()

        if (reserved) {
          return new Response(JSON.stringify({ error: 'This subdomain is reserved' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check if subdomain already exists
        const { data: existing } = await supabase
          .from('subdomains')
          .select('id')
          .eq('subdomain', subdomain)
          .maybeSingle()

        if (existing) {
          return new Response(JSON.stringify({ error: 'Subdomain already taken' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Rate limiting: check user's subdomain count in last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('subdomains')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', oneHourAgo)

        if (count && count >= 5) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 5 subdomains per hour.' }), { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // With wildcard DNS, we only save to database - no Cloudflare API call needed
        // All subdomains automatically route via *.cashurl.shop -> cname.vercel-dns.com
        const { data: newSubdomain, error: dbError } = await supabase
          .from('subdomains')
          .insert({
            user_id: userId,
            subdomain,
            full_domain: `${subdomain}.${DOMAIN}`,
            record_type: 'CNAME',
            record_value: 'cname.vercel-dns.com',
            proxied: false,
            cloudflare_record_id: null, // No individual record - using wildcard
            status: 'active',
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          return new Response(JSON.stringify({ error: 'Failed to save subdomain' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, subdomain: newSubdomain }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'delete': {
        const { subdomainId } = data

        // Get subdomain record
        const { data: subdomain, error: fetchError } = await supabase
          .from('subdomains')
          .select('*')
          .eq('id', subdomainId)
          .eq('user_id', userId)
          .maybeSingle()

        if (fetchError || !subdomain) {
          return new Response(JSON.stringify({ error: 'Subdomain not found' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // With wildcard DNS, just delete from database - no Cloudflare cleanup needed

        // Delete from database
        const { error: deleteError } = await supabase
          .from('subdomains')
          .delete()
          .eq('id', subdomainId)
          .eq('user_id', userId)

        if (deleteError) {
          return new Response(JSON.stringify({ error: 'Failed to delete subdomain' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update': {
        const { subdomainId } = data

        // Get subdomain record
        const { data: subdomain, error: fetchError } = await supabase
          .from('subdomains')
          .select('*')
          .eq('id', subdomainId)
          .eq('user_id', userId)
          .maybeSingle()

        if (fetchError || !subdomain) {
          return new Response(JSON.stringify({ error: 'Subdomain not found' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // With wildcard DNS architecture, individual subdomain DNS updates are not supported
        // All subdomains route to the same deployment
        return new Response(JSON.stringify({ 
          success: true, 
          subdomain,
          message: 'Wildcard DNS is active - all subdomains route to the main deployment'
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})