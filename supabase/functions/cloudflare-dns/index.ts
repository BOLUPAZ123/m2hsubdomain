import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DOMAIN = 'cashurl.shop'

// Cloudflare API helper
async function cloudflareRequest(method: string, endpoint: string, body?: object) {
  const CF_API_TOKEN = Deno.env.get('CF_API_TOKEN')
  const CF_ZONE_ID = Deno.env.get('CF_ZONE_ID')
  
  if (!CF_API_TOKEN || !CF_ZONE_ID) {
    throw new Error('Cloudflare credentials not configured')
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}${endpoint}`
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  
  if (!data.success) {
    console.error('Cloudflare API error:', data.errors)
    throw new Error(data.errors?.[0]?.message || 'Cloudflare API error')
  }
  
  return data
}

// Validate IP address format
function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(ip)) return false
  const parts = ip.split('.').map(Number)
  return parts.every(p => p >= 0 && p <= 255)
}

// Validate hostname format
function isValidHostname(hostname: string): boolean {
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return hostnameRegex.test(hostname) && hostname.length <= 253
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

    switch (action) {
      case 'create': {
        const { 
          subdomain, 
          recordType = 'CNAME', 
          recordValue, 
          proxied = true,
          landingType = 'default',
          redirectUrl,
          htmlContent,
          htmlTitle,
        } = data

        // Validate subdomain format
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,18}[a-z0-9])?$/
        if (!subdomainRegex.test(subdomain)) {
          return new Response(JSON.stringify({ error: 'Invalid subdomain format. Use 3-20 lowercase letters, numbers, and hyphens.' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate record type
        if (!['A', 'CNAME'].includes(recordType)) {
          return new Response(JSON.stringify({ error: 'Invalid record type. Use A or CNAME.' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate landing type
        if (!['default', 'redirect', 'html'].includes(landingType)) {
          return new Response(JSON.stringify({ error: 'Invalid landing type.' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate redirect URL if landing type is redirect
        if (landingType === 'redirect' && redirectUrl) {
          try {
            new URL(redirectUrl)
          } catch {
            return new Response(JSON.stringify({ error: 'Invalid redirect URL.' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Default record value if not provided
        // IMPORTANT: must point to an existing resolvable host; many setups don't have `www`.
        const finalRecordValue = recordValue || DOMAIN

        // Validate record value based on type
        if (recordType === 'A') {
          if (!isValidIPv4(finalRecordValue)) {
            return new Response(JSON.stringify({ error: 'Invalid IP address for A record' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } else if (recordType === 'CNAME') {
          if (!isValidHostname(finalRecordValue)) {
            return new Response(JSON.stringify({ error: 'Invalid hostname for CNAME record' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
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

        // Rate limiting: check user's subdomain count
        const { count } = await supabase
          .from('subdomains')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (count && count >= 5) {
          return new Response(JSON.stringify({ error: 'Maximum 5 subdomains allowed per user' }), { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Create DNS record in Cloudflare
        const fullDomain = `${subdomain}.${DOMAIN}`
        let cloudflareRecordId = null

        try {
          const cfResponse = await cloudflareRequest('POST', '/dns_records', {
            type: recordType,
            name: fullDomain,
            content: finalRecordValue,
            proxied: Boolean(proxied),
            ttl: proxied ? 1 : 3600,
          })
          cloudflareRecordId = cfResponse.result?.id
        } catch (cfError: any) {
          console.error('Cloudflare error:', cfError)
          return new Response(JSON.stringify({ error: `Failed to create DNS record: ${cfError.message}` }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Save to database with landing page config
        const { data: newSubdomain, error: dbError } = await supabase
          .from('subdomains')
          .insert({
            user_id: userId,
            subdomain,
            full_domain: fullDomain,
            record_type: recordType,
            record_value: finalRecordValue,
            proxied: Boolean(proxied),
            cloudflare_record_id: cloudflareRecordId,
            status: 'active',
            landing_type: landingType,
            redirect_url: landingType === 'redirect' ? redirectUrl : null,
            html_content: landingType === 'html' ? htmlContent : null,
            html_title: landingType === 'html' ? htmlTitle : null,
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          // Try to rollback Cloudflare record
          if (cloudflareRecordId) {
            try {
              await cloudflareRequest('DELETE', `/dns_records/${cloudflareRecordId}`)
            } catch {}
          }
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

      case 'update': {
        const { 
          subdomainId, 
          recordType, 
          recordValue, 
          proxied,
          landingType,
          redirectUrl,
          htmlContent,
          htmlTitle,
        } = data

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

        // Determine new values
        const newRecordType = recordType || subdomain.record_type
        const newRecordValue = recordValue || subdomain.record_value
        const newProxied = proxied !== undefined ? Boolean(proxied) : subdomain.proxied
        const newLandingType = landingType || subdomain.landing_type || 'default'

        // Validate record type
        if (!['A', 'CNAME'].includes(newRecordType)) {
          return new Response(JSON.stringify({ error: 'Invalid record type. Use A or CNAME.' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate landing type
        if (!['default', 'redirect', 'html'].includes(newLandingType)) {
          return new Response(JSON.stringify({ error: 'Invalid landing type.' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate redirect URL if landing type is redirect
        const newRedirectUrl = redirectUrl !== undefined ? redirectUrl : subdomain.redirect_url
        if (newLandingType === 'redirect' && newRedirectUrl) {
          try {
            new URL(newRedirectUrl)
          } catch {
            return new Response(JSON.stringify({ error: 'Invalid redirect URL.' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Validate record value based on type
        if (newRecordType === 'A') {
          if (!isValidIPv4(newRecordValue)) {
            return new Response(JSON.stringify({ error: 'Invalid IP address for A record' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } else if (newRecordType === 'CNAME') {
          if (!isValidHostname(newRecordValue)) {
            return new Response(JSON.stringify({ error: 'Invalid hostname for CNAME record' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Update Cloudflare DNS record
        let newCloudflareRecordId = subdomain.cloudflare_record_id
        if (subdomain.cloudflare_record_id) {
          try {
            await cloudflareRequest('PATCH', `/dns_records/${subdomain.cloudflare_record_id}`, {
              type: newRecordType,
              name: subdomain.full_domain,
              content: newRecordValue,
              proxied: newProxied,
              ttl: newProxied ? 1 : 3600,
            })
          } catch (cfError: any) {
            console.error('Cloudflare update error:', cfError)
            return new Response(JSON.stringify({ error: `Failed to update DNS record: ${cfError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } else {
          // Create new record if none exists
          try {
            const cfResponse = await cloudflareRequest('POST', '/dns_records', {
              type: newRecordType,
              name: subdomain.full_domain,
              content: newRecordValue,
              proxied: newProxied,
              ttl: newProxied ? 1 : 3600,
            })
            newCloudflareRecordId = cfResponse.result?.id
          } catch (cfError: any) {
            console.error('Cloudflare create error:', cfError)
            return new Response(JSON.stringify({ error: `Failed to create DNS record: ${cfError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        // Update database with landing page config
        const newHtmlContent = htmlContent !== undefined ? htmlContent : subdomain.html_content
        const newHtmlTitle = htmlTitle !== undefined ? htmlTitle : subdomain.html_title
        
        const { data: updatedSubdomain, error: updateError } = await supabase
          .from('subdomains')
          .update({
            record_type: newRecordType,
            record_value: newRecordValue,
            proxied: newProxied,
            cloudflare_record_id: newCloudflareRecordId,
            status: 'active',
            landing_type: newLandingType,
            redirect_url: newLandingType === 'redirect' ? newRedirectUrl : null,
            html_content: newLandingType === 'html' ? newHtmlContent : null,
            html_title: newLandingType === 'html' ? newHtmlTitle : null,
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

        return new Response(JSON.stringify({ success: true, subdomain: updatedSubdomain }), { 
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
          try {
            await cloudflareRequest('DELETE', `/dns_records/${subdomain.cloudflare_record_id}`)
          } catch (cfError: any) {
            console.error('Cloudflare delete error:', cfError)
            // Continue anyway - record might already be deleted
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
