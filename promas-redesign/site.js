document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Active nav link ----
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(a => {
    const target = a.getAttribute('data-nav');
    if (target === path || (target === 'index.html' && path === '')) {
      a.classList.add('active');
    }
  });

  // ---- Sticky header style swap on scroll (only on pages with transparent hero) ----
  const header = document.getElementById('site-header');
  const navTexts = document.querySelectorAll('.nav-text, .nav-logo-text');
  const transparentHero = document.body.hasAttribute('data-transparent-nav');
  function onScroll() {
    if (!header) return;
    if (!transparentHero || window.scrollY > 60) {
      header.classList.add('bg-cream/95', 'backdrop-blur', 'shadow-sm');
      navTexts.forEach(el => { el.classList.remove('text-white'); el.classList.add('text-ink'); });
    } else {
      header.classList.remove('bg-cream/95', 'backdrop-blur', 'shadow-sm');
      navTexts.forEach(el => { el.classList.add('text-white'); el.classList.remove('text-ink'); });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu toggle ----
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      iconOpen.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }));
  }

  // ---- Scroll reveal ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- Animated counters ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterIO.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterIO.observe(el));
  }

  // ---- Project filter (Projects page) ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        filterItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hide', !match);
        });
      });
    });
  }

  // ---- Testimonial carousel ----
  const slides = document.querySelectorAll('.testi-slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length) {
    let active = 0;
    function show(i) {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      active = i;
    }
    dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
    if (!reduceMotion) {
      setInterval(() => show((active + 1) % slides.length), 6000);
    }
  }

  // ---- Contact form validation (client-side only) ----
  const form = document.getElementById('contact-form');
  if (form) {
    const successMsg = document.getElementById('form-success');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      ['name', 'email', 'message'].forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;
        const errorEl = field.parentElement.querySelector('.error-text');
        field.classList.remove('border-red-400');
        if (errorEl) errorEl.classList.add('hidden');

        if (!field.value.trim()) {
          valid = false;
          field.classList.add('border-red-400');
          if (errorEl) { errorEl.textContent = 'This field is required.'; errorEl.classList.remove('hidden'); }
        } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false;
          field.classList.add('border-red-400');
          if (errorEl) { errorEl.textContent = 'Please enter a valid email address.'; errorEl.classList.remove('hidden'); }
        }
      });

      if (!valid) {
        form.querySelector('.border-red-400')?.focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const label = btn.querySelector('.btn-label');
      btn.disabled = true;
      label.textContent = 'Sending...';

      setTimeout(() => {
        btn.disabled = false;
        label.textContent = 'Send Enquiry';
        form.reset();
        successMsg.classList.remove('hidden');
      }, 900);
    });
  }
});
