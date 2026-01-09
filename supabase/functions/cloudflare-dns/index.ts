import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DNSRecord {
  subdomain: string
  recordType: 'A' | 'CNAME'
  recordValue: string
  proxied: boolean
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
    const CF_API_TOKEN = Deno.env.get('CF_API_TOKEN')
    const CF_ZONE_ID = Deno.env.get('CF_ZONE_ID')

    if (!CF_API_TOKEN || !CF_ZONE_ID) {
      console.error('Missing Cloudflare credentials')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, ...data } = await req.json()
    const DOMAIN = 'm2hgamerz.site'

    switch (action) {
      case 'create': {
        const { subdomain, recordType, recordValue, proxied } = data as DNSRecord

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

        // Create DNS record in Cloudflare
        const cfResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CF_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: recordType,
              name: `${subdomain}.${DOMAIN}`,
              content: recordValue,
              proxied: recordType === 'A' ? proxied : false, // CNAME can't always be proxied
              ttl: 1, // Auto
            }),
          }
        )

        const cfResult = await cfResponse.json()

        if (!cfResult.success) {
          console.error('Cloudflare error:', cfResult.errors)
          return new Response(JSON.stringify({ error: 'Failed to create DNS record', details: cfResult.errors }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Save to database
        const { data: newSubdomain, error: dbError } = await supabase
          .from('subdomains')
          .insert({
            user_id: userId,
            subdomain,
            full_domain: `${subdomain}.${DOMAIN}`,
            record_type: recordType,
            record_value: recordValue,
            proxied: recordType === 'A' ? proxied : false,
            cloudflare_record_id: cfResult.result.id,
            status: 'active',
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          // Try to delete the CF record if DB insert fails
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${cfResult.result.id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
            }
          )
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

        // Delete from Cloudflare
        if (subdomain.cloudflare_record_id) {
          const cfResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${subdomain.cloudflare_record_id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
            }
          )

          const cfResult = await cfResponse.json()
          if (!cfResult.success) {
            console.error('Cloudflare delete error:', cfResult.errors)
          }
        }

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
        const { subdomainId, recordValue, proxied } = data

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

        // Update in Cloudflare
        if (subdomain.cloudflare_record_id) {
          const cfResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${subdomain.cloudflare_record_id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${CF_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: recordValue || subdomain.record_value,
                proxied: subdomain.record_type === 'A' ? (proxied ?? subdomain.proxied) : false,
              }),
            }
          )

          const cfResult = await cfResponse.json()
          if (!cfResult.success) {
            console.error('Cloudflare update error:', cfResult.errors)
            return new Response(JSON.stringify({ error: 'Failed to update DNS record' }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Update in database
        const { data: updated, error: updateError } = await supabase
          .from('subdomains')
          .update({
            record_value: recordValue || subdomain.record_value,
            proxied: subdomain.record_type === 'A' ? (proxied ?? subdomain.proxied) : false,
          })
          .eq('id', subdomainId)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return new Response(JSON.stringify({ error: 'Failed to update subdomain' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, subdomain: updated }), { 
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
