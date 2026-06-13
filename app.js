/* Static mode for screenshots / no-JS-needed rendering: ?static=1 */
const STATIC_MODE = new URLSearchParams(location.search).has('static');
if (STATIC_MODE) document.documentElement.classList.add('no-anim');

/* Debug mode: ?debug=1 lists elements wider than the viewport in the page title */
if (new URLSearchParams(location.search).has('debug')) {
  window.addEventListener('load', () => {
    const vw = document.documentElement.clientWidth;
    const culprits = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1 || r.right > vw + 1) {
        culprits.push(`${el.tagName}.${el.className && el.className.toString().split(' ')[0]}=${Math.round(r.width)}/${Math.round(r.right)}`);
      }
    });
    document.title = 'VW=' + vw + ' OVERFLOW: ' + (culprits.slice(0, 12).join(' | ') || 'none');
  });
}

/* Reveal sections on scroll */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal, .browser').forEach((el) => observer.observe(el));

/* Animated number counters */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();
  (function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}
const counterObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => {
  if (STATIC_MODE) { el.textContent = el.dataset.count; }
  else counterObserver.observe(el);
});

/* Sticky CTA: appears after the hero, hides near pricing and final CTA */
const stickyBar = document.getElementById('sticky-cta');
const heroSection = document.querySelector('.hero');
const pricingSection = document.getElementById('pricing');
const finalSection = document.querySelector('.final');
function updateSticky() {
  const past = window.scrollY > heroSection.offsetHeight * 0.9;
  const nearPricing = isInView(pricingSection) || isInView(finalSection);
  stickyBar.classList.toggle('show', past && !nearPricing);
}
function isInView(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}
if (!STATIC_MODE) {
  window.addEventListener('scroll', updateSticky, { passive: true });
  updateSticky();
}

/* Animated terminal: types the conversation, then loops */
const SCRIPT = [
  ['html', '<span class="tc">you@your-pc</span> <span class="tm">~/ai-projects</span> $ '],
  ['type', 'claude'],
  ['html', '\n<span class="tm">✻ Welcome back. Reading CLAUDE.md... I remember where we left off.</span>\n\n'],
  ['html', '<b>you ›</b> '],
  ['type', 'organize 2 years of photos by date, then build me a workout tracker I can open'],
  ['html', '\n<span class="tc">agent ›</span> Plan: sort photos into year and month, then create tracker.html. OK?\n'],
  ['html', '<b>you ›</b> '],
  ['type', 'go'],
  ['html', '\n<span class="tg">✓</span> 1,847 photos sorted into 24 folders\n<span class="tg">✓</span> workout-tracker.html built, open it in your browser\n\n'],
  ['html', '<span class="tm">No code written by you. This is lesson 8 of 28.</span>'],
];

const TYPE_SPEED = 34;
const STEP_PAUSE = 700;
const TYPED_PAUSE = 430;
const LOOP_PAUSE = 6500;

const out = document.getElementById('term-out');
let stepIndex = 0;
let buffer = '';
let started = false;

const cursor = () => '<span class="cursor">&nbsp;</span>';

function runStep() {
  if (stepIndex >= SCRIPT.length) {
    setTimeout(() => { buffer = ''; stepIndex = 0; runStep(); }, LOOP_PAUSE);
    return;
  }
  const [kind, value] = SCRIPT[stepIndex];
  if (kind === 'html') {
    buffer += value;
    out.innerHTML = buffer + cursor();
    stepIndex++;
    setTimeout(runStep, STEP_PAUSE);
  } else {
    let charIndex = 0;
    (function typeChar() {
      if (charIndex <= value.length) {
        out.innerHTML = buffer + '<b>' + value.slice(0, charIndex) + '</b>' + cursor();
        charIndex++;
        setTimeout(typeChar, TYPE_SPEED);
      } else {
        buffer += '<b>' + value + '</b>';
        stepIndex++;
        setTimeout(runStep, TYPED_PAUSE);
      }
    })();
  }
}

/* Scroll buddy: follows the sections, changes mood, drops little quips */
const buddy = document.getElementById('buddy');
const bubble = document.getElementById('buddy-bubble');
const BUDDY_STOPS = [
  { sel: '.term-section', mood: 'normal',  say: "That's me in 20 minutes. I type fast." },
  { sel: '.pain',         mood: 'worried', say: "The red text isn't angry. It's just dramatic." },
  { sel: '.manifesto',    mood: 'normal',  say: 'No Lambos here. Only clean folders.' },
  { sel: '.panel',        mood: 'happy',   say: 'Module 4 is my favorite. I break things so you don’t.' },
  { sel: '.browser',      mood: 'normal',  say: 'Your classroom. A human answers in there.' },
  { sel: '.who',          mood: 'normal',  say: 'Tested on real beginners. I watched.' },
  { sel: '.quotes',       mood: 'happy',   say: 'Real people. I met them.' },
  { sel: '.pricing',      mood: 'excited', say: 'One pizza. The whole door.' },
  { sel: '.faq',          mood: 'worried', say: 'Scared of a dumb question? No such thing in here.' },
  { sel: '.final',        mood: 'happy',   say: 'See you inside. I’ll keep your seat warm.' },
];
const buddyInner = document.getElementById('buddy-inner');
const buddyMotionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let buddyShown = false;
let currentStop = -1;
let bubbleTimer = null;
let buddyTargetEl = null;
let buddyX = window.innerWidth - 130;
let buddyY = window.innerHeight * 0.55;

function setBuddyStop(index, el) {
  if (index === currentStop) return;
  currentStop = index;
  const stop = BUDDY_STOPS[index];
  buddyTargetEl = el;
  buddy.className = 'show mood-' + stop.mood;
  buddyInner.classList.remove('hop');
  void buddyInner.offsetWidth; /* restart hop animation */
  buddyInner.classList.add('hop');
  bubble.textContent = stop.say;
  bubble.classList.add('pop');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('pop'), 4200);
}

/* The buddy perches on the active section's top-right corner and rides along with it
   while you scroll, until the next section appears and it hops over. */
function buddyFrame() {
  if (buddyShown && buddyTargetEl) {
    const rect = buddyTargetEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    /* Perch point: straddling the section's top-right corner, half outside the content */
    let targetX = Math.min(rect.right - 42, vw - 104);
    targetX = Math.max(targetX, 40);
    let targetY = rect.top - 70;
    /* Soft leash: never wander absurdly far off-screen while waiting for the next stop */
    targetY = Math.min(Math.max(targetY, -90), vh + 30);
    const deltaX = targetX - buddyX;
    const deltaY = targetY - buddyY;
    buddyX += deltaX * 0.15;
    buddyY += deltaY * 0.15;
    const lean = Math.max(-8, Math.min(8, deltaY * 0.04 + deltaX * 0.025));
    buddy.style.transform = 'translate(' + buddyX.toFixed(1) + 'px,' + buddyY.toFixed(1) + 'px) rotate(' + lean.toFixed(2) + 'deg)';
  }
  requestAnimationFrame(buddyFrame);
}

if (buddy && !STATIC_MODE && buddyMotionOk) {
  buddyInner.addEventListener('animationend', () => buddyInner.classList.remove('hop'));
  const stopEls = BUDDY_STOPS
    .map((stop, index) => ({ el: document.querySelector(stop.sel), index }))
    .filter((s) => s.el);

  /* Active stop = the last section that has entered the reading zone of the viewport.
     The moment a new one shows up, the buddy hops onto it. */
  function pickActiveStop() {
    const vh = window.innerHeight;
    let active = null;
    for (const s of stopEls) {
      const r = s.el.getBoundingClientRect();
      if (r.top < vh * 0.72 && r.bottom > vh * 0.15) active = s;
    }
    return active;
  }

  const originalFrame = buddyFrame;
  buddyFrame = function () {
    const active = pickActiveStop();
    if (active) {
      if (!buddyShown) { buddyShown = true; buddy.classList.add('show'); }
      if (active.index !== currentStop) setBuddyStop(active.index, active.el);
    }
    originalFrame();
  };
  requestAnimationFrame(() => buddyFrame());
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const term = document.getElementById('terminal');

if (reducedMotion || STATIC_MODE) {
  out.innerHTML = SCRIPT.map(([kind, value]) => (kind === 'type' ? '<b>' + value + '</b>' : value)).join('');
} else {
  const termObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        runStep();
        termObserver.disconnect();
      }
    },
    { threshold: 0.35 }
  );
  termObserver.observe(term);
}
