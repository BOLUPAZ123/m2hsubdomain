import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { action, ...data } = await req.json()

    // Use sandbox or production based on environment
    const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/pg' // Change to https://api.cashfree.com/pg for production

    switch (action) {
      case 'create-order': {
        const authHeader = req.headers.get('Authorization')
        let userId = null

        if (authHeader?.startsWith('Bearer ')) {
          const supabaseWithAuth = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
          )
          const token = authHeader.replace('Bearer ', '')
          const { data: userData } = await supabaseWithAuth.auth.getUser(token)
          userId = userData?.user?.id || null
        }

        const { amount, currency = 'INR', customerEmail, customerName, customerPhone } = data

        if (!amount || amount < 1) {
          return new Response(JSON.stringify({ error: 'Minimum donation is $1 (or equivalent)' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const orderId = `donation_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // Create order in Cashfree
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
            order_amount: amount,
            order_currency: currency,
            customer_details: {
              customer_id: userId || `guest_${Date.now()}`,
              customer_email: customerEmail || 'donor@m2hgamerz.site',
              customer_phone: customerPhone || '9999999999',
              customer_name: customerName || 'Anonymous Donor',
            },
            order_meta: {
              return_url: `${req.headers.get('origin')}/donate?order_id=${orderId}&status={order_status}`,
              notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-webhook`,
            },
          }),
        })

        const cfResult = await cfResponse.json()

        if (!cfResponse.ok) {
          console.error('Cashfree order error:', cfResult)
          return new Response(JSON.stringify({ error: 'Failed to create payment order', details: cfResult }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Save donation record
        const { error: dbError } = await supabase
          .from('donations')
          .insert({
            user_id: userId,
            amount,
            currency,
            order_id: orderId,
            status: 'pending',
          })

        if (dbError) {
          console.error('Database error:', dbError)
        }

        return new Response(JSON.stringify({ 
          success: true, 
          orderId,
          paymentSessionId: cfResult.payment_session_id,
          orderAmount: cfResult.order_amount,
          orderCurrency: cfResult.order_currency,
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
            payment_id: cfResult.cf_order_id,
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
