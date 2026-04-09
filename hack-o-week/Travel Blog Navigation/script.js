// Data for premium countries
const premiumDestinations = {
    "Japan": {
        hero: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
        title: "Japan",
        desc: "A mesmerizing convergence of ancient traditions and futuristic technology. From serene bamboo forests to neon-lit streets, Japan offers a sensory journey unlike any other.",
        topPlaces: ["Tokyo", "Kyoto", "Osaka", "Mt. Fuji"],
        foods: ["Sushi", "Ramen", "Matcha", "Wagyu"],
        bestTime: "March-May (Spring) or Sept-Nov (Autumn)",
        tips: "Purchase a JR Pass before arriving. Bowing is customary form of respect.",
        gallery: [
            "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542051812871-75ec31570fcb?q=80&w=800&auto=format&fit=crop"
        ],
        latLng: [36.2048, 138.2529]
    },
    "France": {
        hero: "https://images.unsplash.com/photo-1502602891462-27ce66d148e6?q=80&w=1200&auto=format&fit=crop",
        title: "France",
        desc: "The global epicenter of art, fashion, and gastronomy. Experience the romantic streets of Paris, the sun-drenched Riviera, and the lavender fields of Provence.",
        topPlaces: ["Paris", "French Riviera", "Mont Saint-Michel"],
        foods: ["Croissant", "Escargot", "Baguette", "Wine"],
        bestTime: "April-June or September-November",
        tips: "Learn basic French phrases. A simple 'Bonjour' goes a long way.",
        gallery: [
            "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?q=80&w=800&auto=format&fit=crop"
        ],
        latLng: [46.2276, 2.2137]
    },
    "Italy": {
        hero: "https://images.unsplash.com/photo-1516483638261-f40889d044f6?q=80&w=1200&auto=format&fit=crop",
        title: "Italy",
        desc: "A feast for the senses. Where history lives on every corner, art surrounds you, and the cuisine is unparalleled. The birthplace of the Renaissance.",
        topPlaces: ["Rome", "Florence", "Venice", "Amalfi Coast"],
        foods: ["Pasta", "Pizza", "Gelato", "Espresso"],
        bestTime: "April to June or September to October",
        tips: "Validate your train tickets before boarding or risk a fine.",
        gallery: [
            "https://images.unsplash.com/photo-1533906966484-a9c978a3f090?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515542622106-78b28af7815b?q=80&w=800&auto=format&fit=crop"
        ],
        latLng: [41.8719, 12.5674]
    },
    "Switzerland": {
        hero: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
        title: "Switzerland",
        desc: "A mountainous central European landscape renowned for its towering Alps, crystalline lakes, alpine villages, and unparalleled train journeys.",
        topPlaces: ["Zermatt", "Lake Geneva", "Lucerne", "Interlaken"],
        foods: ["Fondue", "Raclette", "Swiss Chocolate"],
        bestTime: "June to August (Hiking) or December to March (Skiing)",
        tips: "The Swiss Travel Pass offers incredible value for train exploration.",
        gallery: [
            "https://images.unsplash.com/photo-1527668752968-14ce709b4dba?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=800&auto=format&fit=crop"
        ],
        latLng: [46.8182, 8.2275]
    },
    "United States of America": {
        hero: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop",
        title: "United States",
        desc: "A vast and incredibly diverse nation holding neon-lit metropolises, massive mountain ranges, and expansive breathtaking deserts.",
        topPlaces: ["New York", "Grand Canyon", "Yellowstone", "Hawaii"],
        foods: ["Burgers", "BBQ", "Deep Dish Pizza"],
        bestTime: "Highly variable. Spring and Fall offer the best balance across states.",
        tips: "Tipping 15-20% is expected for almost all service industry workers.",
        gallery: [
            "https://images.unsplash.com/photo-1534430256196-8566fa2f1c8a?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop"
        ],
        latLng: [37.0902, -95.7129]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const body = document.body;
    body.addEventListener('mouseenter', () => cursor.style.display = 'block');
    body.addEventListener('mouseleave', () => cursor.style.display = 'none');

    function bindCursorHover() {
        const hoverElements = document.querySelectorAll('a, button, .leaflet-interactive, .gallery-img, .lightbox-close, .logo');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
            // In case a button was clicked and removes itself
            el.addEventListener('click', () => cursor.classList.remove('hovering'));
        });
    }

    bindCursorHover();

    // --- Loading Screen ---
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 2000); // Wait for map to load realistically

    // --- Initialize Leaflet Map ---
    // Start zoomed out showing the entire world
    const map = L.map('leaflet-map', {
        center: [20, 0],
        zoom: 2.5,
        zoomControl: false, // Cleaner UI
        minZoom: 2,
        maxZoom: 6,
        maxBounds: [[-90, -180], [90, 180]]
    });
    
    let geojsonLayer;
    let selectedLayer = null;
    let flightPath = null;
    const originLocation = [51.5074, -0.1278]; // Assuming London as starting point for flight animation

    // Fetch GeoJSON for world map (ToposJSON converted, lightweight)
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            geojsonLayer = L.geoJson(data, {
                style: function(feature) {
                    return {
                        fillColor: '#1a2235',
                        weight: 1,
                        opacity: 1,
                        color: '#2c3855', // Stroke
                        fillOpacity: 1
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Tooltip
                    layer.bindTooltip(feature.properties.name, {
                        className: 'custom-tooltip',
                        sticky: true,
                        direction: 'top'
                    });

                    // Interaction
                    layer.on({
                        mouseover: function(e) {
                            cursor.classList.add('hovering');
                            if (layer !== selectedLayer) {
                                layer.setStyle({
                                    fillColor: '#1e2a42',
                                    color: '#00f0ff',
                                    weight: 2
                                });
                                layer.bringToFront();
                            }
                        },
                        mouseout: function(e) {
                            cursor.classList.remove('hovering');
                            if (layer !== selectedLayer) {
                                geojsonLayer.resetStyle(layer);
                            }
                        },
                        click: function(e) {
                            const countryName = feature.properties.name;
                            const countryData = premiumDestinations[countryName] || generateFallback(countryName);
                            handleCountrySelect(layer, countryData, e.latlng);
                        }
                    });
                }
            }).addTo(map);
            bindCursorHover(); // bind newly added interactives
        });

    function generateFallback(name) {
        return {
            hero: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1200&auto=format&fit=crop",
            title: name,
            desc: `Discover the breathtaking landscapes and untold stories of ${name}. A true wonder of the world waiting for your arrival.`,
            topPlaces: ["Capital City", "Historic Districts", "National Parks"],
            foods: ["Local Delicacies", "Street Food"],
            bestTime: "Year round, weather permitting.",
            tips: "Respect local customs and immerse yourself in the culture.",
            gallery: [
                "https://images.unsplash.com/photo-1517760444937-263abf4b1625?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"
            ],
            latLng: null // Will map to click location
        };
    }

    function handleCountrySelect(layer, data, clickLatLng) {
        // Reset old selection
        if (selectedLayer) {
            geojsonLayer.resetStyle(selectedLayer);
        }
        if (flightPath) {
            map.removeLayer(flightPath);
        }

        selectedLayer = layer;
        layer.setStyle({
            fillColor: '#e5c07b',
            color: '#fff',
            weight: 2
        });
        layer.bringToFront();

        const targetLatLng = data.latLng ? data.latLng : [clickLatLng.lat, clickLatLng.lng];

        // 🎯 Zoom FlyTo
        map.flyTo(targetLatLng, 5, {
            duration: 2.5,
            easeLinearity: 0.25
        });

        // 🎯 Flight Path Animation
        setTimeout(() => {
            flightPath = L.polyline([originLocation, targetLatLng], {
                color: '#00f0ff',
                weight: 3,
                opacity: 0.8,
                className: 'flight-path'
            }).addTo(map);
        }, 1200);

        // 🎯 Open Info Panel
        setTimeout(() => {
            openPanel(data);
        }, 1800);
    }

    // --- Side Panel & Content Injection ---
    const panel = document.getElementById('country-panel');
    const panelOverlay = document.getElementById('panel-overlay');
    const panelContent = document.getElementById('panel-content');
    const backBtn = document.getElementById('back-to-map');
    
    function openPanel(data) {
        const html = `
            <div class="hero-wrapper">
                <img src="${data.hero}" class="hero-img" alt="${data.title}">
                <div class="hero-gradient"></div>
            </div>
            
            <div class="detail-content">
                <h1 class="detail-title">${data.title}</h1>
                <p class="detail-desc">${data.desc}</p>
                
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-header">
                            <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
                            <h3>Top Places</h3>
                        </div>
                        <div class="tag-list">
                            ${data.topPlaces.map(p => `<span class="tag">${p}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-header">
                            <div class="info-icon"><i class="fas fa-utensils"></i></div>
                            <h3>Popular Foods</h3>
                        </div>
                        <div class="tag-list">
                            ${data.foods.map(f => `<span class="tag">${f}</span>`).join('')}
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <div class="info-icon"><i class="fas fa-sun"></i></div>
                            <h3>Best Time</h3>
                        </div>
                        <p style="color:var(--text-main); font-size:0.95rem;">${data.bestTime}</p>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <div class="info-icon"><i class="fas fa-lightbulb"></i></div>
                            <h3>Travel Tips</h3>
                        </div>
                        <p style="color:var(--text-main); font-size:0.95rem;">${data.tips}</p>
                    </div>
                </div>

                <div class="gallery-section">
                    <h3>Memories</h3>
                    <div class="gallery-grid">
                        ${data.gallery.map(img => `<img src="${img}" class="gallery-img" alt="Gallery">`).join('')}
                    </div>
                </div>
            </div>
        `;

        panelContent.innerHTML = html;
        
        // Reset scroll
        panelContent.scrollTop = 0;
        
        panel.classList.add('open');
        panelOverlay.classList.add('active');
        backBtn.classList.remove('hidden');

        setupPanelScrollAnimations();
        bindLightbox();
        bindCursorHover(); // rebind for new elements
    }

    function closePanel() {
        panel.classList.remove('open');
        panelOverlay.classList.remove('active');
        backBtn.classList.add('hidden');
        
        if (selectedLayer) {
            geojsonLayer.resetStyle(selectedLayer);
            selectedLayer = null;
        }
        if (flightPath) {
            map.removeLayer(flightPath);
            flightPath = null;
        }
        
        map.flyTo([20, 0], 2.5, { duration: 2 });
    }

    backBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    // --- Scroll-Based Storytelling inside Panel ---
    function setupPanelScrollAnimations() {
        const cards = document.querySelectorAll('.info-card, .gallery-section');
        const heroImg = document.querySelector('.hero-img');
        const detailTitle = document.querySelector('.detail-title');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('scroll-reveal');
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => observer.observe(card));

        // Parallax Effect
        panelContent.addEventListener('scroll', () => {
            const scrollPos = panelContent.scrollTop;
            if (heroImg) heroImg.style.transform = `translateY(${scrollPos * 0.4}px)`;
            if (detailTitle) detailTitle.style.transform = `translateY(${scrollPos * 0.1}px)`;
        });
    }

    // --- Gallery Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    function bindLightbox() {
        const galleryImages = document.querySelectorAll('.gallery-img');
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });
    }

    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
        if(e.target !== lightboxImg) lightbox.classList.remove('active');
    });

    // --- Audio Toggle (Ambient) ---
    // Royalty free ambient music placeholder
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=ocean-waves-112906.mp3');
    audio.loop = true;
    audio.volume = 0.2;
    let isPlaying = false;
    
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = soundToggle.querySelector('i');

    soundToggle.addEventListener('click', () => {
        if(isPlaying) {
            audio.pause();
            soundIcon.classList.remove('fa-volume-up');
            soundIcon.classList.add('fa-volume-mute');
        } else {
            audio.play().catch(e => console.log("Audio play prevented by browser."));
            soundIcon.classList.remove('fa-volume-mute');
            soundIcon.classList.add('fa-volume-up');
        }
        isPlaying = !isPlaying;
    });

});
