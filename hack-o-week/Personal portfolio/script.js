document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Set current year in footer ---
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // --- 2. Hero Intro Reveal Animation ---
    const heroText = document.getElementById('hero-text');
    const scrollHint = document.getElementById('scroll-hint');
    let introRevealed = false;

    const revealIntro = () => {
        if(!introRevealed) {
            if(heroText) heroText.classList.remove('hidden-intro');
            if(scrollHint) scrollHint.classList.add('hidden-intro');
            introRevealed = true;
        }
    };

    // Reveal when scrolling down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            revealIntro();
        }
    });

    // Reveal on touch/click of the hero area
    window.addEventListener('touchstart', revealIntro, { once: true });
    window.addEventListener('wheel', revealIntro, { once: true });
    
    if(scrollHint) {
        scrollHint.addEventListener('click', revealIntro);
    }

    // --- 3. Intersection Observer for Fade-in/Slide-up on Scroll ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- 4. Sticky Navbar Styling on Scroll ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled-nav');
        } else {
            navbar.classList.remove('scrolled-nav');
        }
    });

    // --- 5. Active Link Highlighting ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Activate when the section is at least 1/3rd into the viewport
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current)) {
                a.classList.add('active');
            }
        });
    });

});
