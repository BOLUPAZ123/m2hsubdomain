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
    const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID')
    const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY')
    
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error('Missing Cashfree credentials')
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role key to bypass RLS for donation records
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { action, ...data } = await req.json()

    // Check if production mode is enabled (default to sandbox)
    const isProduction = Deno.env.get('CASHFREE_PRODUCTION') === 'true'
    const CASHFREE_BASE_URL = isProduction 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg'
    
    // Use redirect-based checkout instead of iframe (sandbox blocks iframe)
    const CASHFREE_CHECKOUT_URL = isProduction
      ? 'https://payments.cashfree.com/order/#'
      : 'https://sandbox.cashfree.com/pg/view/order/#'

    switch (action) {
      case 'create-order': {
        const authHeader = req.headers.get('Authorization')
        let userId = null

        if (authHeader?.startsWith('Bearer ')) {
          const userSupabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
          )
          const token = authHeader.replace('Bearer ', '')
          const { data: userData } = await userSupabase.auth.getUser(token)
          userId = userData?.user?.id || null
        }

        const { amount, currency = 'INR', customerEmail, customerName, customerPhone } = data

        if (!amount || amount < 10) {
          return new Response(JSON.stringify({ error: 'Minimum donation is ₹10' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const orderId = `donation_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const returnUrl = `${req.headers.get('origin')}/donate?order_id=${orderId}&status={order_status}`

        // Create order in Cashfree using latest API version
        const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: parseFloat(amount.toFixed(2)),
            order_currency: currency,
            customer_details: {
              customer_id: userId || `guest_${Date.now()}`,
              customer_email: customerEmail || 'donor@m2hgamerz.site',
              customer_phone: customerPhone || '9999999999',
              customer_name: customerName || 'Anonymous Donor',
            },
            order_meta: {
              return_url: returnUrl,
            },
          }),
        })

        const cfResult = await cfResponse.json()

        if (!cfResponse.ok) {
          console.error('Cashfree order error:', JSON.stringify(cfResult))
          return new Response(JSON.stringify({ 
            error: 'Failed to create payment order', 
            details: cfResult.message || cfResult 
          }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Save donation record with customer info
        const { error: dbError } = await supabase
          .from('donations')
          .insert({
            user_id: userId,
            amount,
            currency,
            order_id: orderId,
            status: 'pending',
            customer_name: customerName || 'Anonymous Donor',
            customer_email: customerEmail || null,
            customer_phone: customerPhone || null,
          })

        if (dbError) {
          console.error('Database error:', dbError)
        }

        // Build the full redirect URL for checkout
        const redirectCheckoutUrl = `${CASHFREE_CHECKOUT_URL}${cfResult.payment_session_id}`

        return new Response(JSON.stringify({ 
          success: true, 
          orderId,
          paymentSessionId: cfResult.payment_session_id,
          orderAmount: cfResult.order_amount,
          orderCurrency: cfResult.order_currency,
          checkoutUrl: redirectCheckoutUrl,
          isProduction,
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'verify-payment': {
        const { orderId } = data

        if (!orderId) {
          return new Response(JSON.stringify({ error: 'Order ID required' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Verify payment with Cashfree
        const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
          },
        })

        const cfResult = await cfResponse.json()

        if (!cfResponse.ok) {
          console.error('Cashfree verify error:', cfResult)
          return new Response(JSON.stringify({ error: 'Failed to verify payment' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update donation status
        const newStatus = cfResult.order_status === 'PAID' ? 'success' : 
                          cfResult.order_status === 'ACTIVE' ? 'pending' : 'failed'

        const { error: updateError } = await supabase
          .from('donations')
          .update({ 
            status: newStatus,
            payment_id: cfResult.cf_order_id?.toString(),
          })
          .eq('order_id', orderId)

        if (updateError) {
          console.error('Update error:', updateError)
        }

        return new Response(JSON.stringify({ 
          success: true,
          status: newStatus,
          orderStatus: cfResult.order_status,
          amount: cfResult.order_amount,
          currency: cfResult.order_currency,
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get-config': {
        return new Response(JSON.stringify({ 
          success: true,
          isProduction,
          appId: CASHFREE_APP_ID ? `${CASHFREE_APP_ID.slice(0, 8)}...` : null,
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
  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMessage }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
