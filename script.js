const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const weatherContainer = document.querySelector(".weather-container");

const grantLocationContainer = document.querySelector(".grant-location-container");
const loadingContainer = document.querySelector(".loading-container");
const searchContainer = document.querySelector(".search-container");
const weatherCard = document.querySelector(".weather-card");
const errorContainer = document.querySelector(".error-container");

let currentTab = userTab;
const API_KEY = "e7beb8691c6772840ff08a893e3bbfbe";
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab) {
    if (currentTab != clickedTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // if useTab was active tab previously
        // if (!searchContainer.classList.contains("active")) {
        if (searchTab.classList.contains("current-tab")) {
            // now active tab will be search tab
            grantLocationContainer.classList.remove("active");
            loadingContainer.classList.remove("active");
            weatherCard.classList.remove("active");
            errorContainer.classList.remove("active");
            searchContainer.classList.add("active");
            document.querySelector("[data-searchInput]").focus();
        } else {
            // now active tab will be user tab
            searchContainer.classList.remove("active");
            errorContainer.classList.remove("active");
            weatherCard.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", (e) => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// check if coordinates of current location is already or not, if yes then show the weather
function getFromSessionStorage() {
    const localCoords = sessionStorage.getItem("user-coords");
    if (!localCoords) {
        grantLocationContainer.classList.add("active");
    } else {
        const coords = JSON.parse(localCoords);
        fetchWeatherInfoByCoords(coords);
    }
}

// coords is in JS object
async function fetchWeatherInfoByCoords(coords) {
    const { lat, lon } = coords;

    // API call to https://openweathermap.org/current
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (response.status == 404) {
            loadingContainer.classList.remove("active");
            errorContainer.classList.add("active");
            return;
        }
        const data = await response.json();
        renderWeatherInfo(data);
    } catch (err) {
        loadingContainer.classList.remove("active");
        errorContainer.classList.add("active");
    }
}

async function fetchWeatherInfoByCityName(city) {
    // API call to https://openweathermap.org/current
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        if (response.status == 404) {
            loadingContainer.classList.remove("active");
            errorContainer.classList.add("active");
            return;
        }
        const data = await response.json();
        renderWeatherInfo(data);
    } catch (err) {
        loadingContainer.classList.remove("active");
        errorContainer.classList.add("active");
    }
}

// weatherInfo will in js object form
function renderWeatherInfo(weatherInfo) {
    // console.log(weatherInfo);
    document.querySelector("[data-cityName]").innerText = weatherInfo?.name;
    document.querySelector("[data-countryIcon]").src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    document.querySelector("[data-weatherDesc]").innerText = weatherInfo?.weather?.[0].description;

    document.querySelector("[data-weatherIcon]").src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0].icon}.png`;

    document.querySelector("[data-temp]").innerText = `${weatherInfo?.main?.temp} °C`;
    document.querySelector("[data-windSpeed]").innerText = `${weatherInfo?.wind?.speed} m/s`;
    document.querySelector("[data-humidity]").innerText = `${weatherInfo?.main?.humidity} %`;
    document.querySelector("[data-cloudindess]").innerText = `${weatherInfo?.clouds?.all} %`;

    loadingContainer.classList.remove("active");
    weatherCard.classList.add("active");
}

document.querySelector("[data-grantAccess").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setUserCoords);
    }
});

function setUserCoords(position) {
    console.log(position);
    const userCoords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coords", JSON.stringify(userCoords));
    grantLocationContainer.classList.remove("active");
    loadingContainer.classList.add("active");
    fetchWeatherInfoByCoords(userCoords);
}

searchContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    loadingContainer.classList.add("active");
    weatherCard.classList.remove("active");
    const searchInput = document.querySelector("[data-searchInput]");
    document.querySelector("[data-searchInput]").blur();
    let cityName = searchInput.value;

    searchInput.value = "";
    if (cityName !== "") {
        fetchWeatherInfoByCityName(cityName);
    }
});
