document.addEventListener("DOMContentLoaded", () => {
    // --- Elements ---
    const masonryGrid = document.getElementById("masonry-grid");
    const filterItems = document.querySelectorAll(".filter-item");
    const searchInput = document.getElementById("search-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const body = document.body;

    // Custom Cursor
    const cursorDot = document.getElementById("cursor-dot");
    const cursorGlow = document.getElementById("cursor-glow");

    // Parallax
    const bgParallax = document.getElementById("bg-parallax");

    // Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCategory = document.getElementById("lightbox-category");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    const lightboxLike = document.getElementById("lightbox-like");
    const lightboxDownload = document.getElementById("lightbox-download");
    
    // --- State ---
    let currentCategory = "All";
    let searchQuery = "";
    let lightboxIndex = 0;
    let filteredData = [];
    let isFetching = false;
    let pageCount = 0; // for infinite scroll simulation

    // --- Dataset (Sample Premium Images via Unsplash) ---
    const imageDatabase = [
        { id: "1472214103451-9374bd1c798e", cat: "Nature", title: "Misty Mountains" },
        { id: "1441974231531-c6227db76b6e", cat: "Nature", title: "Autumn Forest" },
        { id: "1476514525535-07fb3b4ae5f1", cat: "Travel", title: "Historic Canals" },
        { id: "1482049149308-08e1d5eb8436", cat: "Food", title: "Berry Pancakes" },
        { id: "1507608616769-83606201b17d", cat: "Aesthetic", title: "Minimal Curves" },
        { id: "1426604908152-8d1a194142f1", cat: "Nature", title: "Ocean Waves" },
        { id: "1499856871958-5b9627545d1a", cat: "Travel", title: "Parisian Streets" },
        { id: "1484723091782-4284614ff7cb", cat: "Food", title: "Artisan Pizza" },
        { id: "1515823126861-5cbcf7047fc5", cat: "Aesthetic", title: "Neon Reflections" },
        { id: "1469474968028-56623f02e42e", cat: "Nature", title: "Snowy Peaks" },
        { id: "1469854523086-cc02fe5d8800", cat: "Travel", title: "Mountain Express" },
        { id: "1504674900247-0877df9cc836", cat: "Food", title: "Gourmet Pasta" },
        { id: "1493809842364-44a6de10be53", cat: "Aesthetic", title: "Abstract Light" },
        { id: "1500382017468-9049fed747ef", cat: "Nature", title: "Golden Hour Fields" },
        { id: "1515006939943-300b95eb8880", cat: "Travel", title: "Urban Sunset" },
        { id: "1470337458703-46ea17e20173", cat: "Food", title: "Fresh Macarons" },
        { id: "1541701494587-cb58502866ab", cat: "Aesthetic", title: "Geometric Flow" },
        { id: "1465146344425-f00d5f5c8f07", cat: "Nature", title: "Deep Woods" },
        { id: "1517814981442-70b24089c19b", cat: "Travel", title: "Desert Highways" },
        { id: "1509312217621-3e4b78faae12", cat: "Aesthetic", title: "Monochrome Vibes" }
    ];

    function getImageUrl(id, width = 600) {
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}`;
    }

    let galleryItemsData = [...imageDatabase];

    // --- Init ---
    initTheme();
    setupCursor();
    renderGallery(galleryItemsData);
    setupEventListeners();

    // --- Core Functions ---
    function renderGallery(data, append = false) {
        if (!append) {
            // Animate out
            const currentItems = document.querySelectorAll('.gallery-item');
            if (currentItems.length > 0) {
                currentItems.forEach(item => item.classList.add('image-fading-out'));
                setTimeout(() => {
                    masonryGrid.innerHTML = "";
                    injectItems(data);
                }, 400); // match CSS fadeOutDown duration
                return;
            } else {
                masonryGrid.innerHTML = "";
            }
        }
        injectItems(data);
    }

    function injectItems(data) {
        filteredData = data;
        const startDelayMillis = 100;

        data.forEach((item, index) => {
            const delay = (index % 12) * startDelayMillis; // Stagger effect
            
            const div = document.createElement("div");
            div.className = "gallery-item";
            div.style.animationDelay = `${delay}ms`;
            div.setAttribute("data-index", index);
            div.setAttribute("data-id", item.id);

            div.innerHTML = `
                <div class="gallery-inner">
                    <img src="${getImageUrl(item.id)}" loading="lazy" alt="${item.title}">
                    <div class="gallery-overlay">
                        <div class="view-icon"><i class="fa-solid fa-expand"></i></div>
                        <div class="gallery-info">
                            <h3>${item.title}</h3>
                            <span>${item.cat}</span>
                        </div>
                    </div>
                </div>
            `;

            // 3D Hover Tilt Logic
            const inner = div.querySelector('.gallery-inner');
            div.addEventListener('mousemove', (e) => {
                const rect = div.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element.
                const y = e.clientY - rect.top;  // y position within the element.
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
                const rotateY = ((x - centerX) / centerX) * 10;
                
                inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            div.addEventListener('mouseleave', () => {
                inner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });

            // Open Lightbox
            div.addEventListener('click', () => {
                openLightbox(index);
            });

            masonryGrid.appendChild(div);
        });
    }

    function filterAndSearch() {
        const query = searchInput.value.toLowerCase();
        
        let newData = galleryItemsData.filter(item => {
            const matchesCat = currentCategory === "All" || item.cat === currentCategory;
            const matchesSearch = item.title.toLowerCase().includes(query) || item.cat.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });
        
        renderGallery(newData);
    }

    // --- Infinite Scroll ---
    function checkInfiniteScroll() {
        if (isFetching || searchInput.value !== "" || currentCategory !== "All") return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            loadMoreImages();
        }
    }

    function loadMoreImages() {
        isFetching = true;
        loadingSpinner.style.display = "flex";
        pageCount++;

        // Simulate network request
        setTimeout(() => {
            // Pick random 6 items to append
            const newBatch = [];
            for (let i = 0; i < 6; i++) {
                const randomSrc = imageDatabase[Math.floor(Math.random() * imageDatabase.length)];
                newBatch.push({ ...randomSrc, title: randomSrc.title + ' ' + (pageCount+1) });
            }
            galleryItemsData = [...galleryItemsData, ...newBatch];
            
            loadingSpinner.style.display = "none";
            renderGallery(galleryItemsData, false); // Repainting all to keep masonry clean, or just append
            // Wait, repainting all causes flashes. It's better to just inject the new ones.
            // Let's modify logic to purely append:
            masonryGrid.innerHTML = ""; // Simplification: we'll re-render cleanly without the animation out if scrolling.
            injectItems(galleryItemsData);
            
            isFetching = false;
        }, 800);
    }

    // --- Lightbox ---
    function openLightbox(index) {
        lightboxIndex = index;
        updateLightboxContent();
        lightbox.classList.add("active");
        body.style.overflow = "hidden"; // Prevent background scroll
        
        // Reset like button visually
        lightboxLike.classList.remove('liked');
        lightboxLike.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }

    function updateLightboxContent() {
        const item = filteredData[lightboxIndex];
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Load high-res version for lightbox
            lightboxImg.src = getImageUrl(item.id, 1200);
            lightboxTitle.innerText = item.title;
            lightboxCategory.innerText = item.cat;
            
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            };
        }, 200);
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        body.style.overflow = "auto";
    }

    function nextImage() {
        lightboxIndex = (lightboxIndex + 1) % filteredData.length;
        updateLightboxContent();
    }

    function prevImage() {
        lightboxIndex = (lightboxIndex - 1 + filteredData.length) % filteredData.length;
        updateLightboxContent();
    }

    // Swipe Support for Lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    lightbox.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) nextImage();
        if (touchEndX - touchStartX > 50) prevImage();
    }, {passive: true});


    // --- Custom Cursor & Parallax ---
    function setupCursor() {
        // Detect touch devices to avoid trailing cursor issues
        if ('ontouchstart' in window || navigator.maxTouchPoints) return;

        window.addEventListener("mousemove", (e) => {
            const x = e.clientX;
            const y = e.clientY;

            // Instantly move dot
            cursorDot.style.left = `${x}px`;
            cursorDot.style.top = `${y}px`;

            // Delay follow glow
            cursorGlow.animate({
                left: `${x}px`,
                top: `${y}px`
            }, { duration: 500, fill: "forwards" });

            // Parallax background map (subtle)
            const xOffset = (x / window.innerWidth - 0.5) * 20;
            const yOffset = (y / window.innerHeight - 0.5) * 20;
            bgParallax.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });

        // Add hover effects for cursor
        const interactiveSelectors = "a, button, input, .gallery-item, .filter-item";
        document.body.addEventListener("mouseover", (e) => {
            if (e.target.closest(interactiveSelectors)) {
                body.classList.add("cursor-hover");
            }
        });
        document.body.addEventListener("mouseout", (e) => {
            if (e.target.closest(interactiveSelectors)) {
                body.classList.remove("cursor-hover");
            }
        });
    }

    // --- Theme & Interactions ---
    function initTheme() {
        const savedTheme = localStorage.getItem("lumina-theme") || "dark";
        if (savedTheme === "light") {
            body.setAttribute("data-theme", "light");
            themeIcon.className = "fa-solid fa-moon";
        }
    }

    function toggleTheme() {
        if (body.getAttribute("data-theme") === "light") {
            body.removeAttribute("data-theme");
            localStorage.setItem("lumina-theme", "dark");
            themeIcon.className = "fa-solid fa-sun";
        } else {
            body.setAttribute("data-theme", "light");
            localStorage.setItem("lumina-theme", "light");
            themeIcon.className = "fa-solid fa-moon";
        }
    }

    function showToast(message, iconClass) {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Filters
        filterItems.forEach(item => {
            item.addEventListener("click", () => {
                filterItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                currentCategory = item.getAttribute("data-filter");
                filterAndSearch();
            });
        });

        // Search
        searchInput.addEventListener("input", filterAndSearch);

        // Theme
        themeToggleBtn.addEventListener("click", toggleTheme);

        // Scroll
        window.addEventListener("scroll", checkInfiniteScroll, { passive: true });

        // Lightbox buttons
        lightboxClose.addEventListener("click", closeLightbox);
        lightboxNext.addEventListener("click", (e) => { e.stopPropagation(); nextImage(); });
        lightboxPrev.addEventListener("click", (e) => { e.stopPropagation(); prevImage(); });
        
        // Close on background click
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // Lightbox Actions
        lightboxLike.addEventListener("click", () => {
            const isLiked = lightboxLike.classList.contains("liked");
            if (isLiked) {
                lightboxLike.classList.remove("liked");
                lightboxLike.innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
                lightboxLike.classList.add("liked");
                lightboxLike.innerHTML = '<i class="fa-solid fa-heart"></i>';
                showToast("Image added to favorites", "fa-solid fa-heart");
            }
        });

        lightboxDownload.addEventListener("click", () => {
            showToast("Downloading high-res image...", "fa-solid fa-arrow-down");
            // Simulate download sequence
            const icon = lightboxDownload.querySelector('i');
            icon.className = "fa-solid fa-spinner fa-spin";
            setTimeout(() => {
                icon.className = "fa-solid fa-check";
                setTimeout(() => {
                    icon.className = "fa-solid fa-arrow-down";
                }, 2000);
            }, 1000);
        });

        // Keyboard support
        document.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("active")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        });
    }
});
