// Configuration
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEO_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// DOM Elements
const elements = {
    input: document.getElementById("city-input"),
    searchBtn: document.getElementById("search-btn"),
    locationBtn: document.getElementById("location-btn"),
    loading: document.getElementById("loading"),
    error: document.getElementById("error-message"),
    errorText: document.getElementById("error-text"),
    panel: document.getElementById("weather-panel"),
    
    // Core info
    cityName: document.getElementById("city-name"),
    countryName: document.getElementById("country-name"),
    date: document.getElementById("current-date"),
    temp: document.getElementById("temperature"),
    unit: document.getElementById("display-unit"),
    icon: document.getElementById("main-weather-icon"),
    condition: document.getElementById("weather-condition"),
    
    // Details
    feelsLike: document.getElementById("feels-like"),
    humidity: document.getElementById("humidity"),
    windSpeed: document.getElementById("wind-speed"),
    pressure: document.getElementById("pressure"),
    
    // Forecasts
    hourlyContainer: document.getElementById("hourly-container"),
    forecastContainer: document.getElementById("forecast-container"),
    
    // Controls
    unitToggle: document.getElementById("unit-toggle"),
    
    // Animations
    animContainer: document.getElementById("weather-animations"),
    
    // Favorites
    favList: document.getElementById("favorites-list"),
    addFavBtn: document.getElementById("add-fav-btn")
};

let currentUnit = "C";
let currentWeatherData = null; 
let map;
let mapMarker;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// WMO Weather Codes Mapping
const weatherCodes = {
    0: { text: "Clear sky", icon: "fa-sun", theme: "sunny" },
    1: { text: "Mainly clear", icon: "fa-sun", theme: "sunny" },
    2: { text: "Partly cloudy", icon: "fa-cloud-sun", theme: "cloudy" },
    3: { text: "Overcast", icon: "fa-cloud", theme: "cloudy" },
    45: { text: "Fog", icon: "fa-smog", theme: "cloudy" },
    48: { text: "Depositing rime fog", icon: "fa-smog", theme: "cloudy" },
    51: { text: "Light drizzle", icon: "fa-cloud-rain", theme: "rainy" },
    53: { text: "Moderate drizzle", icon: "fa-cloud-rain", theme: "rainy" },
    55: { text: "Dense drizzle", icon: "fa-cloud-rain", theme: "rainy" },
    56: { text: "Light freezing drizzle", icon: "fa-cloud-meatball", theme: "rainy" },
    57: { text: "Dense freezing drizzle", icon: "fa-cloud-meatball", theme: "rainy" },
    61: { text: "Slight rain", icon: "fa-cloud-rain", theme: "rainy" },
    63: { text: "Moderate rain", icon: "fa-cloud-showers-heavy", theme: "rainy" },
    65: { text: "Heavy rain", icon: "fa-cloud-showers-heavy", theme: "rainy" },
    66: { text: "Light freezing rain", icon: "fa-cloud-meatball", theme: "rainy" },
    67: { text: "Heavy freezing rain", icon: "fa-cloud-meatball", theme: "rainy" },
    71: { text: "Slight snow fall", icon: "fa-snowflake", theme: "cloudy" },
    73: { text: "Moderate snow fall", icon: "fa-snowflake", theme: "cloudy" },
    75: { text: "Heavy snow fall", icon: "fa-snowflake", theme: "cloudy" },
    77: { text: "Snow grains", icon: "fa-snowflake", theme: "cloudy" },
    80: { text: "Slight rain showers", icon: "fa-cloud-rain", theme: "rainy" },
    81: { text: "Moderate rain showers", icon: "fa-cloud-showers-heavy", theme: "rainy" },
    82: { text: "Violent rain showers", icon: "fa-cloud-showers-water", theme: "rainy" },
    85: { text: "Slight snow showers", icon: "fa-snowflake", theme: "cloudy" },
    86: { text: "Heavy snow showers", icon: "fa-snowflake", theme: "cloudy" },
    95: { text: "Thunderstorm", icon: "fa-bolt", theme: "thunder" },
    96: { text: "Thunderstorm with slight hail", icon: "fa-bolt", theme: "thunder" },
    99: { text: "Thunderstorm with heavy hail", icon: "fa-bolt", theme: "thunder" }
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    renderFavorites();
    getLocation(); // Auto-detect on load
});

// Event Listeners
elements.searchBtn.addEventListener("click", handleSearch);
elements.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});
elements.locationBtn.addEventListener("click", getLocation);
elements.unitToggle.addEventListener("click", toggleUnit);
elements.addFavBtn.addEventListener("click", saveFavorite);

function initMap() {
    map = L.map('map').setView([20, 0], 2);
    // Dark themed map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; CARTO'
    }).addTo(map);
}

// Main Logic
async function handleSearch() {
    const city = elements.input.value.trim();
    if (!city) return;
    elements.input.value = "";
    
    showLoading();
    
    try {
        const geoRes = await fetch(`${GEO_API}?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found`);
        }
        
        const location = geoData.results[0];
        await fetchWeatherData(location.latitude, location.longitude, location.name, location.country);
        
    } catch (error) {
        showError(error.message);
    }
}

async function getLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const revRes = await fetch(`${REVERSE_GEO_API}?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                    const revData = await revRes.json();
                    const cityName = revData.city || revData.locality || "Current Location";
                    const countryName = revData.countryName || "";
                    
                    await fetchWeatherData(lat, lon, cityName, countryName);
                } catch(e) {
                    await fetchWeatherData(lat, lon, "Your Location", "");
                }
            },
            (error) => {
                showError("Location access denied. Please search manually.");
            }
        );
    } else {
        showError("Geolocation unsupported.");
    }
}

async function fetchWeatherData(lat, lon, cityName, countryName) {
    try {
        const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        if(!res.ok) throw new Error("API Error");
        const data = await res.json();
        
        currentWeatherData = {
            city: cityName,
            country: countryName,
            lat: lat,
            lon: lon,
            data: data
        };
        
        updateUI();
        updateMap(lat, lon);
        
        // Check if favorite
        elements.addFavBtn.classList.remove("hidden");
        elements.addFavBtn.textContent = isFavorite(cityName) ? "Saved to Favorites" : "Save Current City";
        if(isFavorite(cityName)) elements.addFavBtn.disabled = true;
        else elements.addFavBtn.disabled = false;

    } catch (error) {
        showError("Failed to fetch weather data.");
    }
}

function updateUI() {
    if (!currentWeatherData) return;
    const { city, country, data } = currentWeatherData;
    const current = data.current;
    
    hideStates();
    elements.panel.classList.remove("hidden");
    
    let info = weatherCodes[current.weather_code] || weatherCodes[0];
    const isDay = current.is_day === 1;
    
    if (!isDay && info.theme === "sunny") {
        info = { ...info, text: "Clear night", icon: "fa-moon", theme: "night" };
    } else if (!isDay && info.theme === "cloudy") {
        info = { ...info, theme: "night" }; // Darken cloudy at night if needed, or keep cloudy
    }

    // Update Theme Class
    document.body.className = `bg-${info.theme}`;
    generateAnimations(info.theme);
    
    elements.cityName.textContent = city;
    elements.countryName.textContent = country;
    
    const localTime = new Date(current.time);
    elements.date.textContent = `${localTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} | ${localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    const baseTemp = current.temperature_2m;
    animateValue(elements.temp, 0, convertTemp(baseTemp), 800);
    elements.feelsLike.textContent = `${convertTemp(current.apparent_temperature)}°`;
    elements.unit.textContent = `°${currentUnit}`;
    
    elements.condition.textContent = info.text;
    elements.icon.className = `fas ${info.icon} animate-float`;
    
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.pressure.textContent = `${current.pressure_msl} hPa`;
    
    renderHourly(data.hourly, current.time);
    renderForecast(data.daily);
}

function renderHourly(hourly, currentTimeStr) {
    elements.hourlyContainer.innerHTML = "";
    // Find index of current hour
    const currTimeMs = new Date(currentTimeStr).getTime();
    let startIndex = 0;
    
    for(let i=0; i<hourly.time.length; i++){
        if(new Date(hourly.time[i]).getTime() >= currTimeMs){
            startIndex = i;
            break;
        }
    }
    
    // Show next 24 hours
    for(let i=startIndex; i<startIndex+24 && i<hourly.time.length; i++) {
        const timeObj = new Date(hourly.time[i]);
        const timeStr = i === startIndex ? "Now" : timeObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        const code = hourly.weather_code[i];
        const info = weatherCodes[code] || weatherCodes[0];
        const temp = convertTemp(hourly.temperature_2m[i]);
        
        const card = document.createElement("div");
        card.className = "hourly-card";
        card.innerHTML = `
            <span class="h-time">${timeStr}</span>
            <i class="fas ${info.icon} h-icon"></i>
            <span class="h-temp">${temp}°</span>
        `;
        elements.hourlyContainer.appendChild(card);
    }
}

function renderForecast(daily) {
    elements.forecastContainer.innerHTML = "";
    for(let i=1; i<6; i++) {
        if (!daily.time[i]) break;
        
        const dayName = new Date(daily.time[i]).toLocaleDateString("en-US", { weekday: "short" });
        const code = daily.weather_code[i];
        const info = weatherCodes[code] || weatherCodes[0];
        
        const maxT = convertTemp(daily.temperature_2m_max[i]);
        const minT = convertTemp(daily.temperature_2m_min[i]);
        
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <span class="f-day">${dayName}</span>
            <i class="fas ${info.icon} f-icon"></i>
            <div class="f-temps">
                <span class="f-max">${maxT}°</span>
                <span class="f-min">${minT}°</span>
            </div>
        `;
        elements.forecastContainer.appendChild(card);
    }
}

function updateMap(lat, lon) {
    if(mapMarker) {
        mapMarker.setLatLng([lat, lon]);
    } else {
        mapMarker = L.marker([lat, lon]).addTo(map);
    }
    map.flyTo([lat, lon], 10, { animate: true, duration: 1 });
}

// CSS Animations Generator
function generateAnimations(theme) {
    const c = elements.animContainer;
    c.innerHTML = "";
    
    if (theme === "sunny") {
        c.innerHTML = '<div class="sun-glow"></div>';
    } else if (theme === "night") {
        for(let i=0; i<60; i++) {
            let s = document.createElement("div");
            s.className = "star";
            s.style.width = s.style.height = Math.random() * 3 + "px";
            s.style.left = Math.random() * 100 + "vw";
            s.style.top = Math.random() * 100 + "vh";
            s.style.animationDuration = (Math.random() * 3 + 1) + "s";
            s.style.animationDelay = Math.random() * 2 + "s";
            c.appendChild(s);
        }
    } else if (theme === "rainy") {
        for(let i=0; i<120; i++) {
            let d = document.createElement("div");
            d.className = "drop";
            d.style.left = Math.random() * 100 + "vw";
            d.style.animationDuration = (Math.random() * 0.8 + 0.5) + "s";
            d.style.animationDelay = Math.random() * 2 + "s";
            c.appendChild(d);
        }
    } else if (theme === "thunder") {
        c.innerHTML = '<div class="lightning"></div>';
        for(let i=0; i<150; i++) {
            let d = document.createElement("div");
            d.className = "drop";
            d.style.left = Math.random() * 100 + "vw";
            d.style.animationDuration = (Math.random() * 0.8 + 0.4) + "s";
            d.style.animationDelay = Math.random() * 2 + "s";
            c.appendChild(d);
        }
    } else if (theme === "cloudy") {
        for(let i=0; i<12; i++) {
            let cl = document.createElement("div");
            cl.className = "cloud";
            cl.style.width = Math.random() * 250 + 100 + "px";
            cl.style.height = Math.random() * 100 + 50 + "px";
            cl.style.top = Math.random() * 60 + "vh";
            cl.style.animationDuration = (Math.random() * 60 + 20) + "s";
            cl.style.animationDelay = (Math.random() * -60) + "s";
            c.appendChild(cl);
        }
    }
}

// Favorites Logic
function renderFavorites() {
    elements.favList.innerHTML = "";
    if(favorites.length === 0){
        elements.favList.innerHTML = "<p style='color:var(--text-secondary); font-size: 0.9rem'>No saved cities.</p>";
        return;
    }
    
    favorites.forEach(city => {
        const div = document.createElement("div");
        div.className = "fav-item";
        div.innerHTML = `
            <span class="fav-item-name">${city}</span>
            <button class="fav-item-delete"><i class="fas fa-trash"></i></button>
        `;
        div.querySelector(".fav-item-name").addEventListener("click", () => {
             elements.input.value = city;
             handleSearch();
        });
        div.querySelector(".fav-item-delete").addEventListener("click", (e) => {
            e.stopPropagation();
            removeFavorite(city);
        });
        elements.favList.appendChild(div);
    });
}

function saveFavorite() {
    if(!currentWeatherData) return;
    const city = currentWeatherData.city;
    if(!isFavorite(city)) {
        favorites.push(city);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        renderFavorites();
        elements.addFavBtn.textContent = "Saved to Favorites";
        elements.addFavBtn.disabled = true;
    }
}

function removeFavorite(city) {
    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
    if(currentWeatherData && currentWeatherData.city === city) {
        elements.addFavBtn.textContent = "Save Current City";
        elements.addFavBtn.disabled = false;
    }
}

function isFavorite(city) {
    return favorites.includes(city);
}

// Helpers
function convertTemp(celsius) {
    let t = currentUnit === "F" ? (celsius * 9/5) + 32 : celsius;
    return Math.round(t);
}

function toggleUnit() {
    currentUnit = currentUnit === "C" ? "F" : "C";
    elements.unitToggle.textContent = `°${currentUnit === "C" ? "F" : "C"}`;
    if (currentWeatherData) updateUI();
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        obj.innerHTML = Math.floor(easeOut * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.innerHTML = end;
    };
    window.requestAnimationFrame(step);
}

function showLoading() {
    elements.panel.classList.add("hidden");
    elements.error.classList.add("hidden");
    elements.loading.classList.remove("hidden");
}

function showError(msg) {
    elements.panel.classList.add("hidden");
    elements.loading.classList.add("hidden");
    elements.error.classList.remove("hidden");
    elements.errorText.textContent = msg;
}

function hideStates() {
    elements.loading.classList.add("hidden");
    elements.error.classList.add("hidden");
}
