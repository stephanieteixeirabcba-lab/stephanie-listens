// ============================================
// STEPHANIE LISTENS — MAIN JAVASCRIPT
// Supabase email capture + form handling
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// SUPABASE CONFIGURATION
// Replace these with your actual Supabase project credentials
// Get them from: Supabase Dashboard → Project Settings → API
// ============================================

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// MOBILE NAV TOGGLE
// ============================================

const navToggle = document.querySelector('.nav-toggle')
const navLinks = document.querySelector('.nav-links')

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active')
  })

  // Close menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active')
    })
  })
}

// ============================================
// EMAIL FORM SUBMISSION
// ============================================

const emailForm = document.getElementById('email-form')
const emailInput = document.getElementById('email')
const firstNameInput = document.getElementById('first-name')
const submitBtn = document.getElementById('submit-btn')
const formMessage = document.getElementById('form-message')

if (emailForm) {
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = emailInput.value.trim()
    const firstName = firstNameInput.value.trim()

    // Validate
    if (!email || !firstName) {
      showMessage('Please fill in all fields', 'error')
      return
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email', 'error')
      return
    }

    // Loading state
    submitBtn.disabled = true
    submitBtn.classList.add('loading')
    formMessage.textContent = ''
    formMessage.className = 'form-message'

    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('subscribers')
        .insert([
          {
            email: email,
            first_name: firstName,
            source: 'website-lead-magnet',
            subscribed_at: new Date().toISOString(),
            tags: ['lead-magnet', '5-play-based-programs']
          }
        ])

      if (error) {
        // Check if duplicate email
        if (error.code === '23505') {
          showMessage('Looks like you\'re already on the list! Check your email.', 'success')
          emailForm.reset()
        } else {
          throw error
        }
      } else {
        // Success
        showMessage('Yay! Check your email for the guide. -s', 'success')
        emailForm.reset()

        // Optional: Track conversion (e.g., Google Analytics)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'sign_up', {
            method: 'lead-magnet',
            value: 'guide-download'
          })
        }

        // Optional: Trigger email send via webhook/edge function
        // This would typically send the actual lead magnet PDF
        sendLeadMagnetEmail(email, firstName)
      }
    } catch (err) {
      console.error('Subscription error:', err)
      showMessage('Something went wrong. Please try again or email hello@stephanielistens.com', 'error')
    } finally {
      submitBtn.disabled = false
      submitBtn.classList.remove('loading')
    }
  })
}

// ============================================
// HELPER: SHOW FORM MESSAGE
// ============================================

function showMessage(text, type) {
  formMessage.textContent = text
  formMessage.className = `form-message ${type}`

  // Clear success message after 8 seconds
  if (type === 'success') {
    setTimeout(() => {
      formMessage.textContent = ''
      formMessage.className = 'form-message'
    }, 8000)
  }
}

// ============================================
// HELPER: VALIDATE EMAIL
// ============================================

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// ============================================
// SEND LEAD MAGNET EMAIL
// (Triggered after successful signup)
// ============================================

async function sendLeadMagnetEmail(email, firstName) {
  // Option 1: Call your Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('send-lead-magnet', {
      body: {
        email: email,
        firstName: firstName
      }
    })

    if (error) {
      console.error('Email send error:', error)
    }
  } catch (err) {
    // Silent fail - subscription still saved to database
    console.error('Failed to trigger email:', err)
  }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href')

    if (href === '#') return

    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      const offset = 80
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  })
})

// ============================================
// SCROLL ANIMATIONS (OPTIONAL)
// Adds fade-in effect as sections come into view
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1'
      entry.target.style.transform = 'translateY(0)'
    }
  })
}, observerOptions)

// Apply to sections
document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0'
  section.style.transform = 'translateY(20px)'
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
  observer.observe(section)
})

// Hero loads immediately
const hero = document.querySelector('.hero')
if (hero) {
  hero.style.opacity = '1'
  hero.style.transform = 'translateY(0)'
}

console.log('🌶️ Stephanie Listens — listening always, -s')
