import { createClient } from '@supabase/supabase-js'

// ── SUPABASE ─────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function addToBrevo(email, firstName, role) {
  try {
    const { data, error } = await supabase.functions.invoke('add-to-brevo', {
      body: { email, firstName: firstName || '', role: role || '' }
    })
    if (error) { console.error('Edge function error:', error); return { success: false } }
    return { success: true, data }
  } catch (err) {
    console.error('Brevo error:', err)
    return { success: false }
  }
}

// ── CEU EARLY-ACCESS FORM ────────────────────────────
const ceuForm = document.getElementById('ceu-form')
const ceuEmail = document.getElementById('ceu-email')
const ceuFirstName = document.getElementById('ceu-first-name')
const ceuRole = document.getElementById('ceu-role')
const ceuSubmitBtn = document.getElementById('ceu-submit-btn')
const ceuMessage = document.getElementById('ceu-form-message')

ceuForm?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = ceuEmail.value.trim()
  const firstName = ceuFirstName?.value.trim() || ''
  const role = ceuRole?.value || ''

  if (!email || !isValidEmail(email)) {
    showMsg('Please enter a valid email.', 'error')
    return
  }
  if (!role) {
    showMsg('Please let me know your role.', 'error')
    return
  }

  ceuSubmitBtn.disabled = true
  ceuSubmitBtn.classList.add('loading')
  showMsg('', '')

  try {
    const [brevoResult, supabaseResult] = await Promise.allSettled([
      addToBrevo(email, firstName, role),
      supabase.from('subscribers').insert([{
        email,
        first_name: firstName || null,
        role: role || null,
        source: 'ceu-early-access',
        subscribed_at: new Date().toISOString(),
        tags: ['ceu-early-access']
      }])
    ])

    const brevoOk = brevoResult.status === 'fulfilled' && brevoResult.value.success
    const supabaseErr = supabaseResult.status === 'fulfilled' ? supabaseResult.value.error : null
    const isDuplicate = supabaseErr?.code === '23505'

    if (brevoOk || isDuplicate) {
      const name = firstName ? `, ${firstName}` : ''
      showMsg(
        isDuplicate && !brevoOk
          ? "You're already on the list! I'll be in touch. ♡"
          : `You're in${name}! I'll email you the moment CEUs launch. -S ♡`,
        'success'
      )
      ceuForm.reset()
    } else {
      throw new Error('Signup failed')
    }
  } catch (err) {
    console.error(err)
    showMsg('Something went wrong. Please try again.', 'error')
  } finally {
    ceuSubmitBtn.disabled = false
    ceuSubmitBtn.classList.remove('loading')
  }
})

function showMsg(text, type) {
  if (!ceuMessage) return
  ceuMessage.textContent = text
  ceuMessage.className = `teach-ceu-message form-message ${type}`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
