// POST /api/subscribe
// Adds a contact to Brevo. Runs server-side so BREVO_API_KEY is never exposed.
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   BREVO_API_KEY   — from Brevo → SMTP & API → API Keys
//   BREVO_LIST_ID   — numeric id of the list to add contacts to

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/contacts'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.BREVO_API_KEY
  const listId = Number(process.env.BREVO_LIST_ID)

  if (!apiKey || !listId) {
    console.error('Missing BREVO_API_KEY or BREVO_LIST_ID')
    return res.status(500).json({ error: 'Server not configured' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}
  const { email, firstName = '', role = '', certBody = '', wanted = '', source = '', tags = [] } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email.' })
  }

  const attributes = { FIRSTNAME: firstName }
  if (role) attributes.ROLE = role
  if (certBody) attributes.CERT_BODY = certBody
  if (wanted) attributes.WANTED_TOPIC = wanted
  if (source) attributes.SOURCE = source

  try {
    const brevo = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [listId],
        updateEnabled: true // existing contacts get updated instead of erroring
      })
    })

    if (brevo.ok || brevo.status === 204) {
      return res.status(200).json({ ok: true, duplicate: false })
    }

    const detail = await brevo.json().catch(() => ({}))

    // Brevo returns this when the contact already exists and updateEnabled is off.
    if (detail.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true, duplicate: true })
    }

    console.error('Brevo error', brevo.status, detail)
    return res.status(502).json({ error: 'Signup failed' })
  } catch (err) {
    console.error('Brevo request failed', err)
    return res.status(502).json({ error: 'Signup failed' })
  }
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return {} }
}
