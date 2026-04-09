document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Form Inputs
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const college = document.getElementById('college');
    const branch = document.getElementById('branch');
    const year = document.getElementById('year');
    const teamSize = document.getElementById('team-size');
    const motivation = document.getElementById('motivation');
    const charCount = document.getElementById('char-count');
    
    const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
    const experienceRadios = document.querySelectorAll('input[name="experience"]');

    // Fields tracking for progress (10 required fields/groups)
    const requiredFields = [
        { id: 'fullname', validate: val => val.trim().length >= 3 },
        { id: 'email', validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
        { id: 'phone', validate: val => /^\d{10}$/.test(val) },
        { id: 'college', validate: val => val.trim().length > 0 },
        { id: 'branch', validate: val => val !== '' },
        { id: 'year', validate: val => val !== '' },
        { id: 'team-size', validate: val => val >= 1 && val <= 4 },
        { id: 'motivation', validate: val => val.trim().length >= 20 },
        { id: 'skills', type: 'checkbox', validate: () => Array.from(skillCheckboxes).some(cb => cb.checked) },
        { id: 'experience', type: 'radio', validate: () => Array.from(experienceRadios).some(radio => radio.checked) }
    ];

    let fieldStatus = new Map();
    requiredFields.forEach(field => fieldStatus.set(field.id, false));

    // --- Theme Management ---
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        if (isDark) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Navbar Scroll & Mobile Menu ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const isMenuOpen = mobileMenu.classList.contains('active');
        hamburger.innerHTML = isMenuOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                // Also trigger child slide-up animations if any
                const slideUps = entry.target.querySelectorAll('.slide-up');
                slideUps.forEach((el, index) => {
                    setTimeout(() => el.classList.add('visible'), index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenSections = document.querySelectorAll('.section-hidden');
    hiddenSections.forEach(section => scrollObserver.observe(section));

    // --- Form Validation & Progress ---
    const updateProgress = () => {
        let validCount = 0;
        fieldStatus.forEach(isValid => {
            if (isValid) validCount++;
        });
        
        const percentage = Math.round((validCount / requiredFields.length) * 100);
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        
        if (percentage === 100) {
            progressBar.style.backgroundColor = 'var(--success-green)';
            submitBtn.disabled = false;
        } else {
            progressBar.style.backgroundColor = 'var(--primary-blue)';
            submitBtn.disabled = true;
        }
    };

    const validateInput = (element, fieldData) => {
        let isValid = false;
        const formGroup = element.closest('.form-group');
        
        if (fieldData.type === 'checkbox' || fieldData.type === 'radio') {
            isValid = fieldData.validate();
        } else {
            isValid = fieldData.validate(element.value);
        }
        
        fieldStatus.set(fieldData.id, isValid);
        updateProgress();

        // Update UI
        if (element.value !== '' || fieldData.type === 'checkbox' || fieldData.type === 'radio') {
            if (isValid) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            } else {
                formGroup.classList.remove('success');
                formGroup.classList.add('error');
            }
        } else {
            // Empty state, don't show validation styling yet unless blurred (handled below)
            formGroup.classList.remove('success', 'error');
        }
        
        return isValid;
    };

    // Add Live Listeners
    requiredFields.forEach(field => {
        if (field.type === 'checkbox') {
            skillCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => validateInput(cb, field));
            });
        } else if (field.type === 'radio') {
            experienceRadios.forEach(radio => {
                radio.addEventListener('change', () => validateInput(radio, field));
            });
        } else {
            const el = document.getElementById(field.id);
            if (el) {
                el.addEventListener('input', () => {
                    validateInput(el, field);
                    
                    // Specific character counter logic for motivation
                    if (field.id === 'motivation') {
                        const len = el.value.length;
                        charCount.textContent = len;
                        if (len > 300) {
                            el.value = el.value.substring(0, 300);
                            charCount.textContent = 300;
                        }
                    }
                });

                el.addEventListener('blur', () => {
                    const formGroup = el.closest('.form-group');
                    if (!fieldStatus.get(field.id)) {
                        formGroup.classList.add('error');
                    }
                });
            }
        }
    });

    // --- Modal & Submit ---
    const modal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final validation check
        let isFormValid = true;
        requiredFields.forEach(field => {
            let el = document.getElementById(field.id);
            if (field.type === 'checkbox') el = skillCheckboxes[0];
            if (field.type === 'radio') el = experienceRadios[0];
            
            if (!validateInput(el, field)) {
                isFormValid = false;
                const formGroup = el.closest('.form-group');
                formGroup.classList.add('error');
            }
        });

        if (isFormValid) {
            // Show modal and trigger confetti
            modal.classList.add('active');
            body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Confetti animation
            if (typeof window.confetti === 'function') {
                const myCanvas = document.getElementById('confetti-canvas');
                const myConfetti = window.confetti.create(myCanvas, {
                    resize: true,
                    useWorker: true
                });
                
                myConfetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899']
                });
            }
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    const closeModal = () => {
        modal.classList.remove('active');
        body.style.overflow = 'auto';
        form.reset();
        
        // Reset progress and validation styling
        fieldStatus.forEach((val, key) => fieldStatus.set(key, false));
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('success', 'error');
        });
        updateProgress();
        charCount.textContent = '0';
        
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    closeModalBtn.addEventListener('click', closeModal);
    
    // Optional: Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
