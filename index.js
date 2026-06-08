document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const pricingToggle = document.getElementById('pricingToggle');
    const ctaForm = document.getElementById('ctaForm');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));

    // Animated counters in hero stats
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                const isDecimal = target % 1 !== 0;
                const duration = 1500;
                const start = performance.now();

                function update(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = target * eased;

                    el.textContent = isDecimal
                        ? current.toFixed(1) + suffix
                        : Math.floor(current) + suffix;

                    if (progress < 1) requestAnimationFrame(update);
                }

                requestAnimationFrame(update);
                counterObserver.unobserve(el);
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(counter => counterObserver.observe(counter));

    // Pricing toggle (monthly / yearly)
    const periodLabels = document.querySelectorAll('[data-period]');
    const priceElements = document.querySelectorAll('.price');

    pricingToggle.addEventListener('click', () => {
        pricingToggle.classList.toggle('active');
        const isYearly = pricingToggle.classList.contains('active');

        periodLabels.forEach(label => {
            label.classList.toggle('active', label.dataset.period === (isYearly ? 'yearly' : 'monthly'));
        });

        priceElements.forEach(price => {
            price.textContent = isYearly ? price.dataset.yearly : price.dataset.monthly;
        });
    });

    // CTA form submission
    ctaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = ctaForm.querySelector('input');
        const btn = ctaForm.querySelector('button');
        const originalText = btn.textContent;

        btn.textContent = 'Thanks! Check your inbox ✓';
        btn.style.pointerEvents = 'none';
        input.value = '';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.pointerEvents = '';
        }, 3000);
    });

    // Animate dashboard chart bars on load
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, i) => {
        const height = bar.style.getPropertyValue('--h');
        bar.style.setProperty('--h', '0%');
        setTimeout(() => {
            bar.style.setProperty('--h', height);
        }, 600 + i * 100);
    });
});
