document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Parallax Background --- */
    const parallaxBg = document.getElementById('parallax-bg');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;
        if(parallaxBg) {
            parallaxBg.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
    });

    /* --- 2. Advanced Interactive Card Tilt (3D Effect) --- */
    const cards = document.querySelectorAll('.hover-tilt');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            // Calculate rotation values. Max rotation is 10deg.
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset to default
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    /* --- 3. Scroll Reveal Animations & Stats Counter --- */
    const revealElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-slide-left');
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    // Counter function
    const startCounting = () => {
        counters.forEach(counter => {
            counter.innerText = '0';
            const target = +counter.getAttribute('data-target');
            
            const updateCount = () => {
                const c = +counter.innerText;
                const increment = target / 50; // Speed of counting

                if (c < target) {
                    counter.innerText = Math.ceil(c + increment);
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // If it's the stats section, trigger the counter
                if (entry.target.classList.contains('stats-grid') || entry.target.closest('#stats')) {
                    if (!hasCounted) {
                        startCounting();
                        hasCounted = true;
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
    
    // Also trigger immediately for early views
    setTimeout(() => {
        revealElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                el.classList.add('is-visible');
            }
        });
    }, 100);

    // Observe stats specifically if it wasn't caught by the general reveal
    const statsSection = document.getElementById('stats');
    if(statsSection) revealObserver.observe(statsSection);


    /* --- 4. Navbar & Mobile Menu --- */
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    // Sticky nav
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle menu
    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.replace('bx-menu', 'bx-x');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.replace('bx-x', 'bx-menu');
            document.body.style.overflow = '';
        }
    }

    mobileBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

});
