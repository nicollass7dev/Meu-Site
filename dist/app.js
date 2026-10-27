const body = document.body;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');
const motionToggle = document.querySelector('[data-motion-toggle]');
const motionLabel = document.querySelector('[data-motion-label]');
const menuToggle = document.querySelector('.menu-toggle');
const menuLabel = menuToggle.querySelector('.sr-only');
const nav = document.querySelector('.main-nav');
const cursor = document.querySelector('.cursor');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const whatsappNumber = '5518991820132';

const savedMotion = localStorage.getItem('motion-disabled');
let motionDisabled = savedMotion === 'true' || (savedMotion === null && prefersReduced.matches);

function applyMotionPreference() {
  body.classList.toggle('motion-off', motionDisabled);
  motionToggle.setAttribute('aria-pressed', String(motionDisabled));
  motionLabel.textContent = motionDisabled ? 'Motion pausado' : 'Motion ligado';
}

applyMotionPreference();

motionToggle.addEventListener('click', () => {
  motionDisabled = !motionDisabled;
  localStorage.setItem('motion-disabled', String(motionDisabled));
  applyMotionPreference();
});

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuLabel.textContent = open ? 'Abrir menu' : 'Fechar menu';
  nav.classList.toggle('open', !open);
  body.style.overflow = open ? '' : 'hidden';
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuLabel.textContent = 'Abrir menu';
  body.style.overflow = '';
}));

addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Abrir menu';
    body.style.overflow = '';
    menuToggle.focus();
  }
});

function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? scrollY / max : 0;
  progress.style.transform = `scaleX(${value})`;
  header.classList.toggle('scrolled', scrollY > 24);

  if (!motionDisabled) {
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      element.style.transform = `translateY(${Math.min(scrollY * 0.08, 70)}px)`;
    });
  }
}

let scrollTicking = false;
addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => { updateScroll(); scrollTicking = false; });
    scrollTicking = true;
  }
}, { passive: true });
updateScroll();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

if (matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = '1';
  });
  document.querySelectorAll('a, button, summary, label').forEach((element) => {
    element.addEventListener('pointerenter', () => cursor.classList.add('active'));
    element.addEventListener('pointerleave', () => cursor.classList.remove('active'));
  });
}

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (motionDisabled || !matchMedia('(pointer:fine)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

document.querySelectorAll('.magnetic').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    if (motionDisabled || !matchMedia('(pointer:fine)').matches) return;
    const rect = button.getBoundingClientRect();
    button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .08}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
  });
  button.addEventListener('pointerleave', () => { button.style.transform = ''; });
});

const form = document.querySelector('#briefing-form');
const result = document.querySelector('#briefing-result');
const resultText = document.querySelector('#briefing-text');
const formError = document.querySelector('#form-error');
let generatedBrief = '';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const controls = [...form.querySelectorAll('[required]')];
  controls.forEach((control) => control.removeAttribute('aria-invalid'));

  if (!form.checkValidity()) {
    formError.hidden = false;
    const invalid = controls.find((control) => !control.validity.valid);
    if (invalid) { invalid.setAttribute('aria-invalid', 'true'); invalid.focus(); }
    return;
  }

  formError.hidden = true;
  const data = new FormData(form);
  const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date());
  generatedBrief = `BRIEFING INICIAL — ${data.get('nome')}\nGerado em ${date}\n\nTipo de projeto\n${data.get('tipo')}\n\nMomento atual\n${data.get('momento')}\n\nObjetivo principal\n${data.get('objetivo')}\n\nPróximos pontos para alinhar\n• Público e jornada principal\n• Conteúdo e materiais disponíveis\n• Referências e direção visual\n• Escopo, prazo e formato de entrega`;
  resultText.textContent = generatedBrief;
  const whatsappMessage = `Olá, Nicollas! Quero pedir um orçamento.\n\n${generatedBrief}`;
  document.querySelector('[data-whatsapp]').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  result.hidden = false;
  result.focus();
  result.scrollIntoView({ behavior: motionDisabled ? 'auto' : 'smooth', block: 'center' });
});

document.querySelector('[data-copy]').addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(generatedBrief);
    status.textContent = 'Briefing copiado para a área de transferência.';
  } catch {
    status.textContent = 'Não foi possível copiar automaticamente. Selecione o texto acima.';
  }
});

document.querySelector('[data-download]').addEventListener('click', () => {
  const blob = new Blob([generatedBrief], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'briefing-inicial.txt';
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
