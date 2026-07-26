// Shared signup helper. Posts to /api/subscribe, which talks to Brevo server-side.
// No API keys in the browser, no Supabase.

export async function subscribe(payload) {
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || 'Signup failed' }
    return { ok: true, duplicate: Boolean(data.duplicate) }
  } catch (err) {
    console.error('Subscribe failed', err)
    return { ok: false, error: 'Signup failed' }
  }
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function showMsg(el, text, type, cls = 'form-message') {
  if (!el) return
  el.textContent = text
  el.className = `${cls} ${type}`.trim()
  if (type === 'success') {
    setTimeout(() => { el.textContent = ''; el.className = cls }, 8000)
  }
}
