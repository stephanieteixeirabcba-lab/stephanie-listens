import { createClient } from '@supabase/supabase-js'

// ── SUPABASE ─────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── ADD TO BREVO via Supabase Edge Function ───────────
// Calling Brevo directly from the browser is blocked by CORS.
// We route through a Supabase Edge Function instead.
async function addToBrevo(email, firstName) {
  try {
    const { data, error } = await supabase.functions.invoke('add-to-brevo', {
      body: { email, firstName: firstName || '' }
    })

    if (error) {
      console.error('Edge function error:', error)
      return { success: false }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Brevo error:', err)
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

// ── SESSION RESET POCKET GUIDE FORM ──────────────────
const resetForm = document.getElementById('reset-form')
const resetEmail = document.getElementById('reset-email')
const resetFirstName = document.getElementById('reset-first-name')
const resetSubmitBtn = document.getElementById('reset-submit-btn')
const resetFormMessage = document.getElementById('reset-form-message')

if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: resetEmail.value.trim(),
      firstName: resetFirstName?.value.trim() || '',
      submitBtn: resetSubmitBtn,
      messageEl: resetFormMessage,
      formEl: resetForm,
      source: 'session-reset-page',
      tag: 'session-reset-pocket-guide'
    })
  })
}

// ── SHARED SUBMIT ────────────────────────────────────
async function submitEmail({ email, firstName, submitBtn, messageEl, formEl, source, tag = 'bt-survival-guide' }) {
  if (!email || !isValidEmail(email)) {
    showMsg(messageEl, 'Please enter a valid email.', 'error')
    return
  }

  submitBtn.disabled = true
  submitBtn.classList.add('loading')
  showMsg(messageEl, '', '')

  try {
    // Send to Brevo (via Edge Function) AND Supabase simultaneously
    const [brevoResult, supabaseResult] = await Promise.allSettled([
      addToBrevo(email, firstName),
      supabase.from('subscribers').insert([{
        email,
        first_name: firstName || null,
        source,
        subscribed_at: new Date().toISOString(),
        tags: [tag]
      }])
    ])

    const brevoOk = brevoResult.status === 'fulfilled' && brevoResult.value.success
    const supabaseErr = supabaseResult.status === 'fulfilled'
      ? supabaseResult.value.error
      : null
    const isDuplicate = supabaseErr?.code === '23505'

    if (brevoOk || isDuplicate) {
      const name = firstName ? `, ${firstName}` : ''
      showMsg(
        messageEl,
        isDuplicate && !brevoOk
          ? "You're already on the list! Check your inbox. ♡"
          : `Yay${name}! Check your email for the guide. -S ♡`,
        'success'
      )
      formEl.reset()
    } else {
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

// ── CONTACT FORM ─────────────────────────────
const contactForm = document.getElementById('contact-form')
const contactSubmitBtn = document.getElementById('contact-submit-btn')
const contactFormMessage = document.getElementById('contact-form-message')

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    contactSubmitBtn.disabled = true
    contactSubmitBtn.classList.add('loading')
    contactFormMessage.textContent = ''
    contactFormMessage.className = 'contact-form-message'

    try {
      const formData = new FormData(contactForm)
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        contactFormMessage.textContent = "Got it! I'll be in touch soon. -S ♡"
        contactFormMessage.className = 'contact-form-message success'
        contactForm.reset()
      } else {
        throw new Error('Submission failed')
      }
    } catch (err) {
      console.error(err)
      contactFormMessage.textContent = 'Something went wrong. Please email stephaniet@stephanielistens.com directly.'
      contactFormMessage.className = 'contact-form-message error'
    } finally {
      contactSubmitBtn.disabled = false
      contactSubmitBtn.classList.remove('loading')
    }
  })
}  document.querySelectorAll('.nav-links a').forEach(link => {
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
    // Send to Brevo (via Edge Function) AND Supabase simultaneously
    const [brevoResult, supabaseResult] = await Promise.allSettled([
      addToBrevo(email, firstName),
      supabase.from('subscribers').insert([{
        email,
        first_name: firstName || null,
        source,
        subscribed_at: new Date().toISOString(),
        tags: ['bt-survival-guide']
      }])
    ])

    const brevoOk = brevoResult.status === 'fulfilled' && brevoResult.value.success
    const supabaseErr = supabaseResult.status === 'fulfilled'
      ? supabaseResult.value.error
      : null
    const isDuplicate = supabaseErr?.code === '23505'

    if (brevoOk || isDuplicate) {
      const name = firstName ? `, ${firstName}` : ''
      showMsg(
        messageEl,
        isDuplicate && !brevoOk
          ? "You're already on the list! Check your inbox. ♡"
          : `Yay${name}! Check your email for the guide. -S ♡`,
        'success'
      )
      formEl.reset()
    } else {
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

// ── CONTACT FORM ─────────────────────────────
const contactForm = document.getElementById('contact-form')
const contactSubmitBtn = document.getElementById('contact-submit-btn')
const contactFormMessage = document.getElementById('contact-form-message')

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    contactSubmitBtn.disabled = true
    contactSubmitBtn.classList.add('loading')
    contactFormMessage.textContent = ''
    contactFormMessage.className = 'contact-form-message'

    try {
      const formData = new FormData(contactForm)
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        contactFormMessage.textContent = "Got it! I'll be in touch soon. -S ♡"
        contactFormMessage.className = 'contact-form-message success'
        contactForm.reset()
      } else {
        throw new Error('Submission failed')
      }
    } catch (err) {
      console.error(err)
      contactFormMessage.textContent = 'Something went wrong. Please email stephaniet@stephanielistens.com directly.'
      contactFormMessage.className = 'contact-form-message error'
    } finally {
      contactSubmitBtn.disabled = false
      contactSubmitBtn.classList.remove('loading')
    }
  })
}
