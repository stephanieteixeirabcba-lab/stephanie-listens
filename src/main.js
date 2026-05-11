import { createClient } from '@supabase/supabase-js'

// ── SUPABASE ─────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── KIT CONFIG ───────────────────────────────────────
// Form ID and API key — form ID is public, API key stored in Vercel env vars
const KIT_FORM_ID = '9429385'
const KIT_API_KEY = import.meta.env.VITE_KIT_API_KEY

// ── ADD TO KIT ───────────────────────────────────────
async function addToKit(email, firstName) {
  try {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: email,
          first_name: firstName || ''
        })
      }
    )
    const data = await res.json()
    return { success: res.ok, data }
  } catch (err) {
    console.error('Kit error:', err)
    return { success: false }
  }
}

// ── MOBILE NAV ───────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle')
const navLinks = document.querySelector('.nav-links')

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active')
  })
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'))
  })
}

// ── MAIN FORM (first name + email) ───────────────────
const emailForm = document.getElementById('email-form')
const emailInput = document.getElementById('email')
const firstNameInput = document.getElementById('first-name')
const submitBtn = document.getElementById('submit-btn')
const formMessage = document.getElementById('form-message')

if (emailForm) {
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: emailInput.value.trim(),
      firstName: firstNameInput?.value.trim() || '',
      submitBtn,
      messageEl: formMessage,
      formEl: emailForm,
      source: 'main-lead-magnet'
    })
  })
}

// ── FINAL CTA FORM (email only) ──────────────────────
const emailFormFinal = document.getElementById('email-form-final')
const emailFinal = document.getElementById('email-final')
const submitBtnFinal = document.getElementById('submit-btn-final')

if (emailFormFinal) {
  emailFormFinal.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: emailFinal.value.trim(),
      firstName: '',
      submitBtn: submitBtnFinal,
      messageEl: null,
      formEl: emailFormFinal,
      source: 'final-cta'
    })
  })
}

// ── SHARED SUBMIT ────────────────────────────────────
async function submitEmail({ email, firstName, submitBtn, messageEl, formEl, source }) {
  if (!email || !isValidEmail(email)) {
    showMsg(messageEl, 'Please enter a valid email.', 'error')
    return
  }

  submitBtn.disabled = true
  submitBtn.classList.add('loading')
  showMsg(messageEl, '', '')

  try {
    // Send to Kit AND Supabase at the same time
    const [kitResult, supabaseResult] = await Promise.allSettled([
      addToKit(email, firstName),
      supabase.from('subscribers').insert([{
        email,
        first_name: firstName || null,
        source,
        subscribed_at: new Date().toISOString(),
        tags: ['lead-magnet']
      }])
    ])

    // Kit is the primary — check its result
    const kitOk = kitResult.status === 'fulfilled' && kitResult.value.success

    // Supabase duplicate check
    const supabaseErr = supabaseResult.status === 'fulfilled'
      ? supabaseResult.value.error
      : null
    const isDuplicate = supabaseErr?.code === '23505'

    if (kitOk || isDuplicate) {
      // Success either way — Kit will handle the email
      const name = firstName ? `, ${firstName}` : ''
      showMsg(
        messageEl,
        isDuplicate && !kitOk
          ? "You're already on the list! Check your inbox. ♡"
          : `Yay${name}! Check your email for the guide. -S ♡`,
        'success'
      )
      formEl.reset()
    } else {
      // Something went wrong with both
      throw new Error('Signup failed')
    }

  } catch (err) {
    console.error(err)
    showMsg(messageEl, 'Something went wrong. Please try again.', 'error')
  } finally {
    submitBtn.disabled = false
    submitBtn.classList.remove('loading')
  }
}

// ── HELPERS ──────────────────────────────────────────
function showMsg(el, text, type) {
  if (!el) return
  el.textContent = text
  el.className = `form-message ${type}`
  if (type === 'success') {
    setTimeout(() => {
      el.textContent = ''
      el.className = 'form-message'
    }, 8000)
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── SMOOTH SCROLL ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href')
    if (href === '#') return
    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 100,
        behavior: 'smooth'
      })
    }
  })
})
