document.addEventListener('DOMContentLoaded', function() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Mobile menu
  const mobileToggle = document.getElementById('mobileToggle');
  const navOverlay = document.getElementById('navOverlay');
  const closeMenu = document.getElementById('closeMenu');
  const overlayLinks = navOverlay.querySelectorAll('a');

  function openMenu() {
    navOverlay.classList.add('active');
    mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenuFn() {
    navOverlay.classList.remove('active');
    mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', openMenu);
  closeMenu.addEventListener('click', closeMenuFn);

  overlayLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenuFn();
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
      closeMenuFn();
    }
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  let isLight = false;

  themeToggle.addEventListener('click', () => {
    isLight = !isLight;
    body.classList.toggle('light-mode', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLight = true;
    body.classList.add('light-mode');
  }

  // Hero animations
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
    .to('.hero-description', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-trust', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-card', { opacity: 1, y: 0, rotateX: 0, duration: 1 }, '-=0.8');

  // Kinetic typography for hero title - simple fade-in to avoid rendering issues
  const heroTitle = document.getElementById('heroTitle');
  heroTitle.style.opacity = '0';
  heroTitle.style.transform = 'translateY(20px)';

  gsap.to(heroTitle, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5
  });

  // Hero canvas particle network
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let isActive = true;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const particleCount = isTouch ? 30 : 60;
  const connectionDistance = 120;
  const maxConnections = 3;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance && connections < maxConnections) {
          const opacity = 1 - distance / connectionDistance;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          connections++;
        }
      }

      // Connect to mouse
      if (!isTouch) {
        const dx = particles[i].x - mouseX;
        const dy = particles[i].y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 * (1 - distance / 150)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    if (!isActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animationId = requestAnimationFrame(animateParticles);
  }

  // Only run particles when hero is visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isActive = true;
        animateParticles();
      } else {
        isActive = false;
        cancelAnimationFrame(animationId);
      }
    });
  }, { threshold: 0.1 });

  heroObserver.observe(document.querySelector('.hero'));
  animateParticles();

  // Cursor glow
  const cursorGlow = document.querySelector('.cursor-glow');
  if (!isTouch && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      gsap.to(cursorGlow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Form submissions
  const heroForm = document.getElementById('heroForm');
  const contactForm = document.getElementById('contactForm');

  heroForm.addEventListener('submit', function(e) {
    e.preventDefault();
    gsap.to(heroForm, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
    setTimeout(() => {
      alert('Mulțumim! Cererea a fost trimisă. Vă contactez în cel mult 24 de ore.');
      heroForm.reset();
    }, 200);
  });

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    gsap.to(contactForm, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
    setTimeout(() => {
      alert('Mulțumim pentru mesaj! Vă contactez în cel mult 24 de ore.');
      contactForm.reset();
    }, 200);
  });

  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Scroll reveal animations
  const revealElements = document.querySelectorAll('.section-tag, .section-title, .section-description, .service-card, .timeline-step, .why-item, .stats-card, .pricing-card, .testimonial-card, .faq-item, .contact-method, .contact-form-wrapper, .pricing-guarantee');

  revealElements.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Timeline progress animation
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineSection = document.querySelector('.timeline');

  if (timelineSection && timelineProgress) {
    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top 70%',
      end: 'bottom 50%',
      onUpdate: (self) => {
        const progress = Math.min(self.progress * 100 * 1.5, 100);
        timelineProgress.style.height = `${progress}%`;
      }
    });
  }

  // Counter animation for stats
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-count'));
    const isPercentage = stat.parentElement.querySelector('.stat-label').textContent.includes('%');

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(stat, {
          innerHTML: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerHTML: 1 },
          onUpdate: function() {
            const current = Math.round(this.targets()[0].innerHTML);
            if (isPercentage) {
              stat.innerHTML = current + '%';
            } else if (target === 2009) {
              stat.innerHTML = current;
            } else if (target === 17) {
              stat.innerHTML = current + '+';
            } else {
              stat.innerHTML = current + '+';
            }
          }
        });
      }
    });
  });

  // 3D tilt effect for cards
  const tiltElements = document.querySelectorAll('[data-tilt]');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (isTouch) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(el, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });

  // Hero card 3D tilt
  const heroCard = document.getElementById('heroCard');
  if (heroCard && !isTouch) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;

      gsap.to(heroCard, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    heroCard.addEventListener('mouseleave', () => {
      gsap.to(heroCard, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }

  // Magnetic buttons
  const magneticButtons = document.querySelectorAll('.btn');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (isTouch) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });

  // Trust marquee - constant slow speed, no scroll acceleration
  const trustMarquee = document.getElementById('trustMarquee');
  if (trustMarquee) {
    trustMarquee.style.animationDuration = '40s';
  }

  // Parallax for hero on scroll
  gsap.to('.hero-content', {
    y: -80,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.hero-card', {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
});
