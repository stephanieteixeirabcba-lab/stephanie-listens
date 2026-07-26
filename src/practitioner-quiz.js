import { subscribe, isValidEmail, showMsg } from './subscribe.js'

// ── QUIZ DATA ────────────────────────────────────────
// Each option adds points to one of four types: anchor, attuner, analyst, advocate.
const QUESTIONS = [
  {
    q: "A session starts to unravel. What's your first instinct?",
    options: [
      { t: 'anchor',   label: "Slow everything down and hold steady until it settles." },
      { t: 'attuner',  label: "Tune into how the client is feeling and meet them there." },
      { t: 'analyst',  label: "Mentally scan for what changed — antecedent, setting, pattern." },
      { t: 'advocate', label: "Ask myself whether the plan still fits this moment." }
    ]
  },
  {
    q: "Your supervisor gives you a new protocol you're unsure about. You…",
    options: [
      { t: 'anchor',   label: "Implement it consistently and give it a fair, steady trial." },
      { t: 'attuner',  label: "Think first about how the client will experience it." },
      { t: 'analyst',  label: "Ask to see the reasoning and the data behind it." },
      { t: 'advocate', label: "Raise my concerns directly before moving ahead." }
    ]
  },
  {
    q: "Which compliment means the most to you?",
    options: [
      { t: 'anchor',   label: "\"You're so calm and dependable, no matter what happens.\"" },
      { t: 'attuner',  label: "\"Clients trust you almost immediately.\"" },
      { t: 'analyst',  label: "\"Your data and analysis are always sharp.\"" },
      { t: 'advocate', label: "\"You always speak up for what's right for the client.\"" }
    ]
  },
  {
    q: "You're teaching a newer behavior therapist one thing. It's probably…",
    options: [
      { t: 'anchor',   label: "How to stay regulated when a session gets hard." },
      { t: 'attuner',  label: "How to build genuine rapport and read affect." },
      { t: 'analyst',  label: "How to take clean, objective data." },
      { t: 'advocate', label: "How to notice when something feels off and say so." }
    ]
  },
  {
    q: "What drains you most in this work?",
    options: [
      { t: 'anchor',   label: "Chaos and constant last-minute changes." },
      { t: 'attuner',  label: "Feeling like connection is being rushed or skipped." },
      { t: 'analyst',  label: "Decisions made on vibes instead of evidence." },
      { t: 'advocate', label: "Watching a plan continue when it clearly isn't working." }
    ]
  },
  {
    q: "In a team meeting, you're the one who usually…",
    options: [
      { t: 'anchor',   label: "Keeps the room grounded and level-headed." },
      { t: 'attuner',  label: "Names the human side of what's happening." },
      { t: 'analyst',  label: "Brings the numbers and the trend lines." },
      { t: 'advocate', label: "Challenges assumptions and asks the hard question." }
    ]
  },
  {
    q: "A client has a breakthrough. What made the difference, in your view?",
    options: [
      { t: 'anchor',   label: "Consistency — showing up the same way, every time." },
      { t: 'attuner',  label: "The relationship — they felt safe with me." },
      { t: 'analyst',  label: "Precision — the right intervention, well measured." },
      { t: 'advocate', label: "Adjusting course — we changed what wasn't working." }
    ]
  }
]

const RESULTS = {
  anchor: {
    name: "The Anchor",
    tagline: "Steady hands, calm room.",
    desc: "You are the practitioner clients and colleagues lean on when things get hard. Your consistency and regulation create safety — sessions feel more predictable, and dysregulation has somewhere solid to land. You rarely flinch, and that steadiness is a genuine clinical skill, not just a temperament.",
    strengths: "Consistency, emotional regulation, reliability under pressure. You hold the frame when others would wobble, and clients settle because you do.",
    growth: "Your steadiness can tip into rigidity. Growing means staying just as grounded while getting more flexible — knowing when to adapt the plan rather than simply hold the line.",
    supervision: "You're the supervisee who follows through and the supervisor who keeps a team calm. Push yourself to invite dissent and change; your stability makes it safe for others to raise concerns.",
    ceu: "When a Session Stops Working",
    ceuWhy: "Anchors hold steady when things escalate. This one turns that instinct into a decision framework — continue, adapt, pause, or contact."
  },
  attuner: {
    name: "The Attuner",
    tagline: "You read the room before it speaks.",
    desc: "You lead with relationship. You notice the shift in a client's body or mood before it becomes a behavior, and you build trust quickly because people feel genuinely seen by you. Connection isn't soft — for you it's the foundation everything else is built on.",
    strengths: "Rapport, empathy, and reading affect. You catch the early signals others miss and you make the work feel human.",
    growth: "Attunement can pull you toward what feels good over what the data shows. Your edge is pairing that warmth with objective measurement and clear boundaries.",
    supervision: "You bring the client's lived experience into every conversation. Lean into backing your instincts with data — it makes your relational insight impossible to dismiss.",
    ceu: "Culturally Responsive Family Work",
    ceuWhy: "Attuners read people well. This one turns that into goals families actually recognise as their own."
  },
  analyst: {
    name: "The Analyst",
    tagline: "Show me the why.",
    desc: "You love the logic of behavior. You want the antecedent, the function, the trend line — and you're happiest when a decision is grounded in clean evidence. Your rigor keeps a team honest and catches problems before they grow.",
    strengths: "Systematic thinking, data fluency, and precision. You turn messy sessions into patterns other people can actually act on.",
    growth: "The data can crowd out the moment. Your edge is staying just as rigorous while bringing more warmth and presence into the room in real time.",
    supervision: "You're the one who asks for the reasoning and the numbers. Practice translating your analysis into plain, compassionate language so it lands with the whole team — not just the data-minded.",
    ceu: "Supervision That Isn't Rushed",
    ceuWhy: "Analysts see the data clearly. This one is about turning that clarity into teaching a trainee can actually use."
  },
  advocate: {
    name: "The Advocate",
    tagline: "First to ask if the plan still fits.",
    desc: "You have a strong ethical compass and you're willing to use your voice. When something isn't serving the client, you notice — and you say so. That courage protects clients and keeps practice honest, especially in rooms where it's easier to stay quiet.",
    strengths: "Ethical clarity, assertiveness, and client-centered judgment. You question what should be questioned and you advocate when it counts.",
    growth: "Conviction can outrun collaboration. Your edge is pacing — raising concerns in a way that brings people with you rather than putting them on the defensive.",
    supervision: "You're the supervisee who speaks up and the supervisor who models integrity. Work on framing challenges as shared problem-solving so your advocacy builds trust as fast as it builds change.",
    ceu: "Ethics in the Room, Not on Paper",
    ceuWhy: "Advocates speak up. This one gives you the language, the scope boundaries, and the paper trail to back it."
  }
}

// ── STATE ────────────────────────────────────────────
let current = 0
let resultType = null
const answers = []

// ── ELEMENTS ─────────────────────────────────────────
const introEl = document.getElementById('pq-intro')
const questionsEl = document.getElementById('pq-questions')
const resultEl = document.getElementById('pq-result')
const startBtn = document.getElementById('pq-start-btn')
const barEl = document.getElementById('pq-bar')
const qcountEl = document.getElementById('pq-qcount')
const questionTextEl = document.getElementById('pq-question')
const optionsEl = document.getElementById('pq-options')
const backBtn = document.getElementById('pq-back')
const retakeBtn = document.getElementById('pq-retake')

// ── FLOW ─────────────────────────────────────────────
startBtn?.addEventListener('click', () => {
  introEl.hidden = true
  questionsEl.hidden = false
  renderQuestion()
})

function renderQuestion() {
  const item = QUESTIONS[current]
  qcountEl.textContent = `Question ${current + 1} of ${QUESTIONS.length}`
  barEl.style.width = `${(current / QUESTIONS.length) * 100}%`
  questionTextEl.textContent = item.q
  backBtn.hidden = current === 0

  optionsEl.innerHTML = ''
  item.options.forEach((opt) => {
    const btn = document.createElement('button')
    btn.className = 'pq-option'
    btn.textContent = opt.label
    if (answers[current] === opt.t) btn.classList.add('selected')
    btn.addEventListener('click', () => selectOption(opt.t))
    optionsEl.appendChild(btn)
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectOption(type) {
  answers[current] = type
  if (current < QUESTIONS.length - 1) {
    current++
    renderQuestion()
  } else {
    showResult()
  }
}

backBtn?.addEventListener('click', () => {
  if (current > 0) { current--; renderQuestion() }
})

function tallyResult() {
  const counts = { anchor: 0, attuner: 0, analyst: 0, advocate: 0 }
  answers.forEach((t) => { if (t) counts[t]++ })
  let best = 'anchor'
  let bestScore = -1
  for (const t of ['anchor', 'attuner', 'analyst', 'advocate']) {
    if (counts[t] > bestScore) { bestScore = counts[t]; best = t }
  }
  return best
}

function showResult() {
  resultType = tallyResult()
  const r = RESULTS[resultType]
  barEl.style.width = '100%'
  questionsEl.hidden = true
  resultEl.hidden = false

  document.getElementById('pq-result-name').textContent = r.name
  document.getElementById('pq-result-tagline').textContent = r.tagline
  document.getElementById('pq-result-desc').textContent = r.desc
  document.getElementById('pq-result-strengths').textContent = r.strengths
  document.getElementById('pq-result-growth').textContent = r.growth
  document.getElementById('pq-result-super').textContent = r.supervision

  // CEU recommendation matched to the result
  const ceuName = document.getElementById('pq-result-ceu-name')
  const ceuWhy = document.getElementById('pq-result-ceu-why')
  if (ceuName) ceuName.textContent = r.ceu
  if (ceuWhy) ceuWhy.textContent = r.ceuWhy

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

retakeBtn?.addEventListener('click', () => {
  current = 0
  answers.length = 0
  resultType = null
  resultEl.hidden = true
  introEl.hidden = false
  showMsg(document.getElementById('pq-form-message'), '', '', 'pq-form-message form-message')
})

// ── EMAIL CAPTURE ────────────────────────────────────
const pqForm = document.getElementById('pq-form')
const pqEmail = document.getElementById('pq-email')
const pqFirstName = document.getElementById('pq-first-name')
const pqRole = document.getElementById('pq-role')
const pqSubmitBtn = document.getElementById('pq-submit-btn')
const pqMessage = document.getElementById('pq-form-message')

const MSG_CLASS = 'pq-form-message form-message'

pqForm?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = pqEmail.value.trim()
  const firstName = pqFirstName?.value.trim() || ''
  const role = pqRole?.value || ''

  if (!email || !isValidEmail(email)) {
    return showMsg(pqMessage, 'Please enter a valid email.', 'error', MSG_CLASS)
  }
  if (!role) {
    return showMsg(pqMessage, 'Please let me know your role.', 'error', MSG_CLASS)
  }

  pqSubmitBtn.disabled = true
  pqSubmitBtn.classList.add('loading')
  showMsg(pqMessage, '', '', MSG_CLASS)

  const tags = ['practitioner-quiz']
  if (resultType) tags.push(`practitioner-${resultType}`)

  const result = await subscribe({
    email, firstName, role,
    source: 'practitioner-quiz',
    tags
  })

  if (result.ok) {
    const name = firstName ? `, ${firstName}` : ''
    showMsg(
      pqMessage,
      result.duplicate
        ? "You're already on the list! Check your inbox. ♡"
        : `Yay${name}! Check your email for your full profile. -S ♡`,
      'success',
      MSG_CLASS
    )
    pqForm.reset()
  } else {
    showMsg(pqMessage, 'Something went wrong. Please try again.', 'error', MSG_CLASS)
  }

  pqSubmitBtn.disabled = false
  pqSubmitBtn.classList.remove('loading')
})
