// ============================================
// SUPABASE EDGE FUNCTION — Send Lead Magnet Email
// Deploy: supabase functions deploy send-lead-magnet
// ============================================
//
// This is OPTIONAL. Use this if you want to automatically send
// the lead magnet PDF after signup. Otherwise, you can:
//   1. Use a separate email tool (ConvertKit, Mailchimp, etc.)
//   2. Use Supabase Auth with magic links
//   3. Manually send the lead magnet
//
// To use this:
//   1. Sign up for Resend.com (free tier: 100 emails/day, 3000/month)
//   2. Add RESEND_API_KEY to Supabase Edge Function secrets
//   3. Replace LEAD_MAGNET_URL with your actual PDF URL
//
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, firstName } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const LEAD_MAGNET_URL = 'https://YOUR-DOMAIN.com/5-play-based-programs.pdf'

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stephanie <hello@stephanielistens.com>',
        to: [email],
        subject: `Hey ${firstName || 'friend'}, here's your guide 💙`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.7;
                color: #5C4033;
                max-width: 580px;
                margin: 0 auto;
                padding: 20px;
                background: #F5F1E8;
              }
              .container {
                background: white;
                padding: 40px 32px;
                border-radius: 16px;
                border-top: 4px solid #D4704B;
              }
              h1 {
                font-family: Georgia, serif;
                color: #D4704B;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background: #D4704B;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 500;
                margin: 20px 0;
              }
              .signature {
                font-style: italic;
                color: #9FA8DA;
                margin-top: 24px;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #9FA8DA;
                margin-top: 32px;
                padding-top: 20px;
                border-top: 0.5px solid #ECEEF7;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Hey ${firstName || 'friend'} 💙</h1>

              <p>Thanks so much for grabbing the guide.</p>

              <p>Inside, you'll find <strong>5 play-based programs you can run tomorrow</strong> — no rigid table time, no stress, just real strategies that work.</p>

              <p style="text-align: center;">
                <a href="${LEAD_MAGNET_URL}" class="button">Download your guide →</a>
              </p>

              <p>Here's the truth: every behavior is communication. And these activities are designed to help you LISTEN to what kids are really saying.</p>

              <p>Try one this week. Then hit reply and tell me how it went. I read every email.</p>

              <p class="signature">
                Listening always,<br>
                -s
              </p>

              <div class="footer">
                <p>You're receiving this because you signed up at stephanielistens.com</p>
                <p>@stephanielistens • 🇧🇷🇺🇸 EN/PT</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    })

    const emailData = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(`Email failed: ${JSON.stringify(emailData)}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
