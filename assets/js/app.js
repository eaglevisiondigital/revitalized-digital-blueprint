const progressBar = document.getElementById('progressBar');
const menuToggle = document.getElementById('menuToggle');
const rail = document.getElementById('rail');
const navLinks = [...document.querySelectorAll('.rail nav a')];
const scenes = [...document.querySelectorAll('.scene')];
const reveals = [...document.querySelectorAll('.reveal')];
const prevButton = document.getElementById('prevSection');
const nextButton = document.getElementById('nextSection');
const sectionCounter = document.getElementById('sectionCounter');
const sectionAnnouncer = document.getElementById('sectionAnnouncer');
let currentIndex = 0;
let ticking = false;

const formatIndex = value => String(value + 1).padStart(2, '0');

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? scrollY / max : 0;
  progressBar.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;
};

const setCurrentSection = (index, announce = false) => {
  currentIndex = Math.min(scenes.length - 1, Math.max(0, index));
  const scene = scenes[currentIndex];
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === scene.id));
  document.body.dataset.theme = scene.dataset.theme || 'dark';
  sectionCounter.textContent = `${formatIndex(currentIndex)} / ${scenes.length}`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === scenes.length - 1;
  if (announce) {
    const activeLink = navLinks.find(link => link.dataset.section === scene.id);
    sectionAnnouncer.textContent = `Section ${currentIndex + 1} of ${scenes.length}: ${activeLink?.textContent.trim().replace(/^\d+/, '') || scene.id}`;
  }
  history.replaceState(null, '', `#${scene.id}`);
};

const nearestSceneIndex = () => {
  const target = innerHeight * 0.48;
  let bestIndex = 0;
  let bestDistance = Infinity;
  scenes.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const center = rect.top + Math.min(rect.height, innerHeight) / 2;
    const distance = Math.abs(center - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
};

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateProgress();
    const index = nearestSceneIndex();
    if (index !== currentIndex) setCurrentSection(index);
    ticking = false;
  });
};

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
reveals.forEach(element => revealObserver.observe(element));

const scrollToScene = (index, focus = false) => {
  const safeIndex = Math.min(scenes.length - 1, Math.max(0, index));
  const scene = scenes[safeIndex];
  scene.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  setCurrentSection(safeIndex, true);
  if (focus) setTimeout(() => scene.focus({ preventScroll: true }), 500);
};

menuToggle.addEventListener('click', () => {
  const open = rail.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
});

navLinks.forEach((link, index) => link.addEventListener('click', event => {
  event.preventDefault();
  rail.classList.remove('open');
  document.body.classList.remove('nav-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  scrollToScene(index, true);
}));

prevButton.addEventListener('click', () => scrollToScene(currentIndex - 1, true));
nextButton.addEventListener('click', () => scrollToScene(currentIndex + 1, true));

addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll, { passive: true });

addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) return;
  if (['ArrowDown', 'PageDown', ' '].includes(event.key) && currentIndex < scenes.length - 1) {
    event.preventDefault();
    scrollToScene(currentIndex + 1, true);
  }
  if (['ArrowUp', 'PageUp'].includes(event.key) && currentIndex > 0) {
    event.preventDefault();
    scrollToScene(currentIndex - 1, true);
  }
  if (event.key === 'Home') {
    event.preventDefault();
    scrollToScene(0, true);
  }
  if (event.key === 'End') {
    event.preventDefault();
    scrollToScene(scenes.length - 1, true);
  }
  if (event.key === 'Escape') {
    rail.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

// Set initial state from URL, then reveal content immediately above the fold.
const hashIndex = scenes.findIndex(scene => `#${scene.id}` === location.hash);
if (hashIndex >= 0) {
  currentIndex = hashIndex;
  requestAnimationFrame(() => scenes[hashIndex].scrollIntoView({ block: 'start' }));
} else {
  currentIndex = nearestSceneIndex();
}
setCurrentSection(currentIndex);
updateProgress();
requestAnimationFrame(() => {
  scenes[currentIndex].querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
});
