import { subscribe, isValidEmail, showMsg } from './subscribe.js'

// ── MOBILE NAV ───────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle')
const navLinks = document.querySelector('.nav-links')

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('active'))
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'))
  })
}

// ── SHARED SUBMIT ────────────────────────────────────
async function submitEmail({ email, firstName, submitBtn, messageEl, formEl, source, tag, extra = {} }) {
  if (!email || !isValidEmail(email)) {
    showMsg(messageEl, 'Please enter a valid email.', 'error')
    return
  }

  submitBtn.disabled = true
  submitBtn.classList.add('loading')
  showMsg(messageEl, '', '')

  const result = await subscribe({ email, firstName, source, tags: [tag], ...extra })

  if (result.ok) {
    const name = firstName ? `, ${firstName}` : ''
    showMsg(
      messageEl,
      result.duplicate
        ? "You're already on the list! Check your inbox. ♡"
        : `Yay${name}! Check your email for the guide. -S ♡`,
      'success'
    )
    formEl.reset()
  } else {
    showMsg(messageEl, 'Something went wrong. Please try again.', 'error')
  }

  submitBtn.disabled = false
  submitBtn.classList.remove('loading')
}

// ── SUPERVISOR GUIDE FORM (the lead magnet) ──────────
const supervisorForm = document.getElementById('supervisor-form')
if (supervisorForm) {
  supervisorForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const stage = document.getElementById('supervisor-stage')?.value || ''
    await submitEmail({
      email: document.getElementById('supervisor-email').value.trim(),
      firstName: document.getElementById('supervisor-first-name')?.value.trim() || '',
      submitBtn: document.getElementById('supervisor-submit-btn'),
      messageEl: document.getElementById('supervisor-form-message'),
      formEl: supervisorForm,
      source: 'supervisor-guide-page',
      tag: 'supervisor-guide',
      extra: { role: stage }
    })
  })
}

// ── HOMEPAGE FORMS (both send the same guide) ────────
const emailForm = document.getElementById('email-form')
if (emailForm) {
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: document.getElementById('email').value.trim(),
      firstName: document.getElementById('first-name')?.value.trim() || '',
      submitBtn: document.getElementById('submit-btn'),
      messageEl: document.getElementById('form-message'),
      formEl: emailForm,
      source: 'homepage',
      tag: 'supervisor-guide'
    })
  })
}

const emailFormFinal = document.getElementById('email-form-final')
if (emailFormFinal) {
  emailFormFinal.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitEmail({
      email: document.getElementById('email-final').value.trim(),
      firstName: '',
      submitBtn: document.getElementById('submit-btn-final'),
      messageEl: null,
      formEl: emailFormFinal,
      source: 'final-cta',
      tag: 'supervisor-guide'
    })
  })
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

// ── CONTACT FORM ─────────────────────────────────────
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
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error('Submission failed')
      contactFormMessage.textContent = "Got it! I'll be in touch soon. -S ♡"
      contactFormMessage.className = 'contact-form-message success'
      contactForm.reset()
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
