// POST /api/subscribe
// Adds a contact to Brevo. Runs server-side so BREVO_API_KEY is never exposed.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   BREVO_API_KEY       — Brevo → SMTP & API → API Keys
//   BREVO_LIST_ALL      — master list, every contact lands here
//   BREVO_LIST_GUIDE    — Supervisor guide (the lead magnet)
//   BREVO_LIST_QUIZ     — Practitioner style quiz
//   BREVO_LIST_CEU      — CEU early access
//
// Contacts are added to the master list AND the list matching their source.
// Brevo automations trigger on "contact added to list", so the source list is
// what starts the right email sequence.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/contacts'

const SOURCE_LISTS = {
  'supervisor-guide-page': 'BREVO_LIST_GUIDE',
  'homepage': 'BREVO_LIST_GUIDE',
  'final-cta': 'BREVO_LIST_GUIDE',
  'practitioner-quiz': 'BREVO_LIST_QUIZ',
  'ceu-early-access': 'BREVO_LIST_CEU'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.BREVO_API_KEY
  const masterList = Number(process.env.BREVO_LIST_ALL)

  if (!apiKey || !masterList) {
    console.error('Missing BREVO_API_KEY or BREVO_LIST_ALL')
    return res.status(500).json({ error: 'Server not configured' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}
  const {
    email, firstName = '', role = '', certBody = '',
    wanted = '', source = '', tags = []
  } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email.' })
  }

  // Build the list set: master + whichever list matches this form.
  const listIds = [masterList]
  const sourceListVar = SOURCE_LISTS[source]
  const sourceListId = sourceListVar ? Number(process.env[sourceListVar]) : null
  if (sourceListId && !listIds.includes(sourceListId)) listIds.push(sourceListId)

  // Attributes power automation conditions (e.g. "only if CERT_BODY is BACB").
  const attributes = { FIRSTNAME: firstName }
  if (role) attributes.ROLE = role
  if (certBody) attributes.CERT_BODY = certBody
  if (wanted) attributes.WANTED_TOPIC = wanted
  if (source) attributes.SOURCE = source

  // TAGS is a comma-joined text attribute — Brevo automations can filter on
  // "TAGS contains practitioner-analyst" to branch by quiz result.
  const cleanTags = (Array.isArray(tags) ? tags : []).filter(Boolean)
  if (cleanTags.length) attributes.TAGS = cleanTags.join(',')

  try {
    const brevo = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({ email, attributes, listIds, updateEnabled: true })
    })

    if (brevo.ok || brevo.status === 204) {
      return res.status(200).json({ ok: true, duplicate: false })
    }

    const detail = await brevo.json().catch(() => ({}))

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
