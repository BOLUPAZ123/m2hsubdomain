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

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = userData.user.id

    // Check if user is admin using service role (bypasses RLS)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, ...data } = await req.json()
    const CF_API_TOKEN = Deno.env.get('CF_API_TOKEN')
    const CF_ZONE_ID = Deno.env.get('CF_ZONE_ID')

    switch (action) {
      case 'get-stats': {
        const [usersResult, subdomainsResult, donationsResult] = await Promise.all([
          supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('subdomains').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('donations').select('amount').eq('status', 'success'),
        ])

        const totalDonations = donationsResult.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

        return new Response(JSON.stringify({ 
          success: true,
          stats: {
            totalUsers: usersResult.count || 0,
            totalSubdomains: subdomainsResult.count || 0,
            totalDonations: totalDonations,
          }
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get-users': {
        const { page = 1, limit = 20 } = data
        const offset = (page - 1) * limit

        // Fetch profiles
        const { data: profiles, error, count } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact' })
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching users:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Fetch roles separately for each user
        const userIds = profiles?.map(p => p.user_id) || []
        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)

        // Merge roles into users
        const users = profiles?.map(profile => ({
          ...profile,
          user_roles: roles?.filter(r => r.user_id === profile.user_id) || []
        })) || []

        return new Response(JSON.stringify({ 
          success: true,
          users,
          total: count,
          page,
          limit,
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get-all-subdomains': {
        const { page = 1, limit = 20, status } = data
        const offset = (page - 1) * limit

        let query = supabaseAdmin
          .from('subdomains')
          .select('*', { count: 'exact' })

        if (status) {
          query = query.eq('status', status)
        }

        const { data: subdomainList, error, count } = await query
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching subdomains:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch subdomains' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Fetch profiles for these subdomains
        const userIds = [...new Set(subdomainList?.map(s => s.user_id) || [])]
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds)

        // Merge profiles into subdomains
        const subdomains = subdomainList?.map(sub => ({
          ...sub,
          profiles: profiles?.find(p => p.user_id === sub.user_id) || { name: 'Unknown', email: '' }
        })) || []

        return new Response(JSON.stringify({ 
          success: true,
          subdomains,
          total: count,
          page,
          limit,
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get-donations': {
        const { page = 1, limit = 20 } = data
        const offset = (page - 1) * limit

        const { data: donationList, error, count } = await supabaseAdmin
          .from('donations')
          .select('*', { count: 'exact' })
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching donations:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch donations' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Fetch profiles for donations with user_id
        const userIds = [...new Set(donationList?.filter(d => d.user_id).map(d => d.user_id) || [])]
        const { data: profiles } = userIds.length > 0 
          ? await supabaseAdmin.from('profiles').select('user_id, name, email').in('user_id', userIds)
          : { data: [] }

        // Merge profiles into donations
        const donations = donationList?.map(donation => ({
          ...donation,
          profiles: donation.user_id 
            ? profiles?.find(p => p.user_id === donation.user_id) || null
            : null
        })) || []

        return new Response(JSON.stringify({ 
          success: true,
          donations,
          total: count,
          page,
          limit,
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'disable-subdomain': {
        const { subdomainId } = data

        // Get subdomain
        const { data: subdomain, error: fetchError } = await supabaseAdmin
          .from('subdomains')
          .select('*')
          .eq('id', subdomainId)
          .single()

        if (fetchError || !subdomain) {
          return new Response(JSON.stringify({ error: 'Subdomain not found' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Delete from Cloudflare
        if (subdomain.cloudflare_record_id && CF_API_TOKEN && CF_ZONE_ID) {
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${subdomain.cloudflare_record_id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
            }
          )
        }

        // Update status to disabled
        const { error: updateError } = await supabaseAdmin
          .from('subdomains')
          .update({ status: 'disabled', cloudflare_record_id: null })
          .eq('id', subdomainId)

        if (updateError) {
          return new Response(JSON.stringify({ error: 'Failed to disable subdomain' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'delete-subdomain': {
        const { subdomainId } = data

        // Get subdomain
        const { data: subdomain, error: fetchError } = await supabaseAdmin
          .from('subdomains')
          .select('*')
          .eq('id', subdomainId)
          .single()

        if (fetchError || !subdomain) {
          return new Response(JSON.stringify({ error: 'Subdomain not found' }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Delete from Cloudflare
        if (subdomain.cloudflare_record_id && CF_API_TOKEN && CF_ZONE_ID) {
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${subdomain.cloudflare_record_id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
            }
          )
        }

        // Delete from database
        const { error: deleteError } = await supabaseAdmin
          .from('subdomains')
          .delete()
          .eq('id', subdomainId)

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

      case 'set-user-role': {
        const { targetUserId, role } = data

        if (!['admin', 'user'].includes(role)) {
          return new Response(JSON.stringify({ error: 'Invalid role' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Upsert role
        const { error } = await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: targetUserId, role }, { onConflict: 'user_id,role' })

        if (error) {
          return new Response(JSON.stringify({ error: 'Failed to update role' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get-payment-config': {
        // Return masked payment config
        const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID') || ''
        const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || ''
        
        return new Response(JSON.stringify({ 
          success: true,
          config: {
            appId: CASHFREE_APP_ID,
            secretKey: CASHFREE_SECRET_KEY ? '•'.repeat(CASHFREE_SECRET_KEY.length - 8) + CASHFREE_SECRET_KEY.slice(-4) : '',
            isProduction: false, // Store this in a settings table if needed
          }
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update-payment-config': {
        // Note: Actual secret updates should be done via Lovable Cloud secrets
        // This just acknowledges the mode change
        const { isProduction } = data
        
        return new Response(JSON.stringify({ 
          success: true,
          message: `Payment mode updated. Note: To use ${isProduction ? 'production' : 'sandbox'} mode, ensure your API keys are configured correctly in Cloud secrets.`
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'bulk-disable-subdomains': {
        const { subdomainIds } = data
        if (!Array.isArray(subdomainIds) || subdomainIds.length === 0) {
          return new Response(JSON.stringify({ error: 'No subdomain IDs provided' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get subdomains
        const { data: subdomainList } = await supabaseAdmin
          .from('subdomains')
          .select('id, cloudflare_record_id')
          .in('id', subdomainIds)

        // Delete from Cloudflare
        if (CF_API_TOKEN && CF_ZONE_ID && subdomainList) {
          await Promise.all(
            subdomainList
              .filter(s => s.cloudflare_record_id)
              .map(s =>
                fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${s.cloudflare_record_id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
                })
              )
          )
        }

        // Update status to disabled
        await supabaseAdmin
          .from('subdomains')
          .update({ status: 'disabled', cloudflare_record_id: null })
          .in('id', subdomainIds)

        return new Response(JSON.stringify({ success: true, count: subdomainIds.length }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'bulk-delete-subdomains': {
        const { subdomainIds } = data
        if (!Array.isArray(subdomainIds) || subdomainIds.length === 0) {
          return new Response(JSON.stringify({ error: 'No subdomain IDs provided' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get subdomains
        const { data: subdomainList } = await supabaseAdmin
          .from('subdomains')
          .select('id, cloudflare_record_id')
          .in('id', subdomainIds)

        // Delete from Cloudflare
        if (CF_API_TOKEN && CF_ZONE_ID && subdomainList) {
          await Promise.all(
            subdomainList
              .filter(s => s.cloudflare_record_id)
              .map(s =>
                fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${s.cloudflare_record_id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
                })
              )
          )
        }

        // Delete from database
        await supabaseAdmin
          .from('subdomains')
          .delete()
          .in('id', subdomainIds)

        return new Response(JSON.stringify({ success: true, count: subdomainIds.length }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'export-users': {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('user_id, role')

        const users = profiles?.map(p => ({
          ...p,
          role: roles?.find(r => r.user_id === p.user_id)?.role || 'user'
        })) || []

        return new Response(JSON.stringify({ success: true, users }), { 
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
