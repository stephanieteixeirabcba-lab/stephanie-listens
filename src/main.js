import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── MOBILE NAV ──────────────────────────────────────
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

// ── MAIN FORM (first name + email) ──────────────────
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
    const { error } = await supabase
      .from('subscribers')
      .insert([{
        email,
        first_name: firstName || null,
        source,
        subscribed_at: new Date().toISOString(),
        tags: ['lead-magnet']
      }])

    if (error) {
      if (error.code === '23505') {
        showMsg(messageEl, "You're already on the list! Check your inbox. 💙", 'success')
      } else {
        throw error
      }
    } else {
      const name = firstName ? `, ${firstName}` : ''
      showMsg(messageEl, `Yay${name}! Check your email for the guide. -s 💙`, 'success')
    }
    formEl.reset()
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
    setTimeout(() => { el.textContent = ''; el.className = 'form-message' }, 8000)
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
