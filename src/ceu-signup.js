import { subscribe, isValidEmail, showMsg } from './subscribe.js'

const ceuForm = document.getElementById('ceu-form')
const ceuEmail = document.getElementById('ceu-email')
const ceuFirstName = document.getElementById('ceu-first-name')
const ceuRole = document.getElementById('ceu-role')
const ceuCert = document.getElementById('ceu-cert')
const ceuWanted = document.getElementById('ceu-wanted')
const ceuSubmitBtn = document.getElementById('ceu-submit-btn')
const ceuMessage = document.getElementById('ceu-form-message')

const MSG_CLASS = 'teach-ceu-message form-message'

ceuForm?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = ceuEmail.value.trim()
  const firstName = ceuFirstName?.value.trim() || ''
  const role = ceuRole?.value || ''
  const certBody = ceuCert?.value || ''
  const wanted = ceuWanted?.value.trim() || ''

  if (!email || !isValidEmail(email)) {
    return showMsg(ceuMessage, 'Please enter a valid email.', 'error', MSG_CLASS)
  }
  if (!role) {
    return showMsg(ceuMessage, 'Please let me know your role.', 'error', MSG_CLASS)
  }

  ceuSubmitBtn.disabled = true
  ceuSubmitBtn.classList.add('loading')
  showMsg(ceuMessage, '', '', MSG_CLASS)

  // Tag by certifying body so launch emails can be segmented —
  // IBAO and QABA contacts get "these count for you", BACB contacts don't.
  const tags = ['ceu-early-access']
  if (certBody) tags.push(`cert-${certBody.toLowerCase().replace(/\s+/g, '-')}`)

  const result = await subscribe({
    email, firstName, role, certBody, wanted,
    source: 'ceu-early-access',
    tags
  })

  if (result.ok) {
    const name = firstName ? `, ${firstName}` : ''
    showMsg(
      ceuMessage,
      result.duplicate
        ? "You're already on the list! I'll be in touch. ♡"
        : `You're in${name}! I'll email you the moment CEUs launch. -S ♡`,
      'success',
      MSG_CLASS
    )
    ceuForm.reset()
  } else {
    showMsg(ceuMessage, 'Something went wrong. Please try again.', 'error', MSG_CLASS)
  }

  ceuSubmitBtn.disabled = false
  ceuSubmitBtn.classList.remove('loading')
})
