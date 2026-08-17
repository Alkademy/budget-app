/* ===== Landing Page Logic — Rita ===== */

// ===== Announcement bar dismiss =====
const announcementBar = document.getElementById('announcementBar');
document.getElementById('dismissAnnouncement').addEventListener('click', function () {
  announcementBar.style.display = 'none';
});

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', function () {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver(
  function (entries) {
    var batchIndex = 0;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = batchIndex * 80;
        batchIndex++;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});

// ===== Counter animation =====
function animateCounter(el) {
  var target = parseFloat(el.dataset.count);
  var suffix = el.dataset.suffix || '';
  var isDecimal = target !== Math.floor(target);
  var duration = 1500;
  var startTime = performance.now();

  function tick(now) {
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = (isDecimal ? target.toFixed(1) : Math.floor(target)) + suffix;
    }
  }

  requestAnimationFrame(tick);
}

var counterObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-count]').forEach(function (el) {
  counterObserver.observe(el);
});

// ===== Pricing toggle =====
var pricingToggle = document.getElementById('pricingToggle');
var isYearly = false;

pricingToggle.addEventListener('click', function () {
  isYearly = !isYearly;
  pricingToggle.classList.toggle('active', isYearly);

  document.querySelectorAll('[data-period]').forEach(function (label) {
    label.classList.toggle('active', (label.dataset.period === 'monthly') !== isYearly);
  });

  var mode = isYearly ? 'yearly' : 'monthly';
  document.querySelectorAll('.price').forEach(function (el) {
    el.textContent = el.dataset[mode];
  });
});

// ===== CTA form =====
var ctaForm = document.getElementById('ctaForm');
var ctaBtn = document.getElementById('ctaBtn');
var ctaEmail = document.getElementById('ctaEmail');
var ctaBtnOriginal = ctaBtn.textContent;

ctaForm.addEventListener('submit', function (e) {
  e.preventDefault();
  ctaEmail.value = '';
  ctaBtn.textContent = 'Thanks! Check your inbox ✓';
  ctaBtn.style.pointerEvents = 'none';
  ctaBtn.style.opacity = '0.75';

  setTimeout(function () {
    ctaBtn.textContent = ctaBtnOriginal;
    ctaBtn.style.pointerEvents = '';
    ctaBtn.style.opacity = '';
  }, 3000);
});
