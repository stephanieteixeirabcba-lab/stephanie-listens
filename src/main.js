import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// MOBILE NAV
const navToggle = document.querySelector('.nav-toggle')
const navLinks = document.querySelector('.nav-links')

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active')
  })

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active')
    })
  })
}

// MAIN EMAIL FORM (with first name)
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
      firstName: firstNameInput.value.trim(),
      submitBtn: submitBtn,
      messageEl: formMessage,
      formEl: emailForm,
      source: 'main-lead-magnet'
    })
  })
}

// FINAL CTA EMAIL FORM (email only)
const emailFormFinal = document.getElementById('email-form-final')
const emailInputFinal = document.getElementById('email-final')
const submitBtnFinal = document.getElementById('submit-btn-final')

if (emailFormFinal) {
  emailFormFinal.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: emailInputFinal.value.trim(),
      firstName: '',
      submitBtn: submitBtnFinal,
      messageEl: null,
      formEl: emailFormFinal,
      source: 'final-cta'
    })
  })
}

// SHARED SUBMIT FUNCTION
async function submitEmail({ email, firstName, submitBtn, messageEl, formEl, source }) {
  if (!email) {
    if (messageEl) showMessage(messageEl, 'Please enter your email', 'error')
    else alert('Please enter your email')
    return
  }

  if (!isValidEmail(email)) {
    if (messageEl) showMessage(messageEl, 'Please enter a valid email', 'error')
    else alert('Please enter a valid email')
    return
  }

  submitBtn.disabled = true
  submitBtn.classList.add('loading')
  if (messageEl) {
    messageEl.textContent = ''
    messageEl.className = 'form-message'
  }

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{
        email: email,
        first_name: firstName || null,
        source: source,
        subscribed_at: new Date().toISOString(),
        tags: ['lead-magnet', '5-strategies-guide']
      }])

    if (error) {
      if (error.code === '23505') {
        const msg = "You're already on the list! Check your email."
        if (messageEl) showMessage(messageEl, msg, 'success')
        else alert(msg)
        formEl.reset()
      } else {
        throw error
      }
    } else {
      const msg = `Yay${firstName ? ', ' + firstName : ''}! Check your email for the guide. -s`
      if (messageEl) showMessage(messageEl, msg, 'success')
      else alert("Yay! Check your email for the guide. -s")
      formEl.reset()
    }
  } catch (err) {
    console.error('Error:', err)
    const msg = 'Something went wrong. Please try again.'
    if (messageEl) showMessage(messageEl, msg, 'error')
    else alert(msg)
  } finally {
    submitBtn.disabled = false
    submitBtn.classList.remove('loading')
  }
}

function showMessage(el, text, type) {
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

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href')
    if (href === '#') return

    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      const offset = 100
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  })
})

console.log('🌶️ Stephanie Listens — listening always, -s')
