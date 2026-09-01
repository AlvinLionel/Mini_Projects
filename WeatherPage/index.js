const weatherData = {
    city: "",
    condition: "",
    temperature: null,
    high: null,
    low: null,
    icon: "",
    visibility: null,
    pressure: null,
    aqi: null,
    uv: null,
    humidity: null,
    wind: null,
    forecast: [],
    hourly: {
        labels: [],
        temperatures: []
    }
};

const searchInput = document.getElementById("search");
const searchButton = document.querySelector(".search-logo");
const useLocationButton = document.getElementById("use-location-button");
const dashboard = document.getElementById("weather-dashboard");

const cityName = document.getElementById("city-name");
const dateTime = document.getElementById("date-time");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const highLow = document.getElementById("high-low");
const weatherIcon = document.getElementById("weather-icon");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const aqi = document.getElementById("aqi");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");

const visibilityStatus = document.getElementById("visibility-status");

function setDashboardEmptyState() {
    dashboard.classList.add("empty");
}

function setDashboardLoadedState() {
    dashboard.classList.remove("empty");
}

function updateDateTime() {
    const now = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };
    const formattedDate = now.toLocaleDateString("en-GB", options);

    dateTime.textContent = formattedDate;
}

function updateCurrentWeather(data) {
    cityName.textContent = data.city;
    temperature.textContent = `${data.temperature} °C`;
    condition.textContent = data.condition;
    highLow.textContent = `H ${data.high}° L ${data.low}`;
    weatherIcon.textContent = data.icon;
    visibility.textContent = data.visibility;
    visibilityStatus.textContent = getVisibilityStatus(data.visibility);
    pressure.textContent = `${data.pressure} hPa`;
    aqi.textContent = getAqiText(data.aqi);
    uv.textContent = getUVText(data.uv);
    wind.textContent = `${data.wind} km/h`;
    humidity.textContent = `${data.humidity}%`;
}

function getAqiText(value) {
    if (value <= 50) return `Good (${value})`;
    if (value <= 100) return `Moderate (${value})`;
    if (value <= 150) return `Unhealthy for sensitive groups (${value})`;
    if (value <= 200) return `Unhealty (${value})`;

    return `Very Unhealthy (${value})`;
}
function getUVText(value) {
    if (value <= 2) return `${value} (Low)`;
    if (value <= 5) return `${value} (Moderate)`;
    if (value <= 7) return `${value} (High)`;
    if (value <= 10) return `${value} (Very High)`;

    return `${value} (Extreme)`;
}
function getVisibilityStatus(value) {

    if (value >= 10) return "Excellent";

    if (value >= 5) return "Good";

    if (value >= 2) return "Moderate";

    return "Poor";
}

function updateForecast(forecast) {
    const forecastContainer = document.querySelector(".forecast-grid");
    forecastContainer.innerHTML = "";

    forecast.forEach((day, index) => {
        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-day");

        if (index === 0) forecastCard.classList.add("today");

        forecastCard.innerHTML = `
        <span class="day">${day.day}</span>

            <span class="weather-icon">
                ${day.icon}
            </span>

            <span class="high">
                ${day.high}°
            </span>

            <span class="low">
                ${day.low}°
            </span>
            `;
        forecastContainer.appendChild(forecastCard);
    });
}

function drawTemperatureChart() {
    const canvas = document.getElementById("tempChart");
    const ctx = canvas.getContext("2d");

    const temperatures = weatherData.hourly.temperatures;
    const labels = weatherData.hourly.labels;
    if (!temperatures || temperatures.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 35;
    const paddingBottom = 35;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;

    const maxTemp = Math.max(...temperatures) + 2;
    const minTemp = Math.min(...temperatures) - 2;

    function getX(index) {
        return (
            paddingLeft + (index / (temperatures.length - 1)) * chartWidth
        );
    }
    function getY(temp) {
        return (
            paddingTop + ((maxTemp - temp) / (maxTemp - minTemp)) * chartHeight
        );
    }
    ctx.clearRect(0, 0, width, height);

    const points = temperatures.map(
        (temp, index) => ({
            x: getX(index),
            y: getY(temp),
            temperature: temp
        })
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";

    const gridLines = 4;

    for (let i = 0; i <= gridLines; i++) {
        const y = paddingTop + (chartHeight / gridLines) * i;

        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
    }

    const gradient = ctx.createLinearGradient(0, paddingTop, 0, height);
    gradient.addColorStop(0, "#f08264a6");
    gradient.addColorStop(0.6, "#64826440");
    gradient.addColorStop(1, "rgba(20,25,40,0)");

    function drawSmoothCurve() {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlPointX = (current.x + next.x) / 2;

            ctx.bezierCurveTo(controlPointX, current.y, controlPointX, next.y, next.x, next.y);
        }
    }
    drawSmoothCurve();

    ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
    ctx.lineTo(points[0].x, height - paddingBottom);

    ctx.closePath();

    ctx.fillStyle = gradient;

    ctx.fill();

    drawSmoothCurve();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#d8a78d";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1c3b";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#d8a78d";
        ctx.fill();
    });

    ctx.font = "600 14px Segoe UI";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    points.forEach(point => {
        ctx.fillText(`${point.temperature}°`, point.x, point.y - 12);
    });
    ctx.font = "13px Segoe UI";
    ctx.fillStyle = "#a0a2af";

    points.forEach(
        (point, index) => {
            ctx.fillText(labels[index], point.x, height - 10);
        }
    );
}

async function fetchWeatherForLocation(latitude, longitude, displayCity) {
    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`
        );
        if (!weatherResponse.ok) throw new Error("Could not retrieve weather data");

        const weather = await weatherResponse.json();
        console.log("Weather data:", weather);

        const airQualityResponse = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=auto`
        );
        if (!airQualityResponse.ok) throw new Error("Could not retrieve air quality data.");

        const airQualityData = await airQualityResponse.json();

        weatherData.city = displayCity;
        weatherData.temperature = Math.round(weather.current.temperature_2m);
        weatherData.high = Math.round(weather.daily.temperature_2m_max[0]);
        weatherData.low = Math.round(weather.daily.temperature_2m_min[0]);
        weatherData.humidity = weather.current.relative_humidity_2m;
        weatherData.pressure = Math.round(weather.current.surface_pressure);
        weatherData.wind = Math.round(weather.current.wind_speed_10m);
        weatherData.visibility = Math.round(weather.current.visibility / 1000);
        weatherData.uv = Math.round(weather.daily.uv_index_max[0]);
        weatherData.aqi = Math.round(airQualityData.current.us_aqi);
        weatherData.condition = getWeatherCondition(weather.current.weather_code);
        weatherData.icon = getWeatherIcon(weather.current.weather_code, weather.current.is_day);
        weatherData.forecast = [];

        for (let i = 0; i < 6; i++) {
            weatherData.forecast.push({
                day: formatForecastDay(weather.daily.time[i], i),
                icon: getWeatherIcon(weather.daily.weather_code[i], true),
                high: Math.round(weather.daily.temperature_2m_max[i]),
                low: Math.round(weather.daily.temperature_2m_min[i])
            });
        }

        const currentHour = new Date().getHours();
        const startIndex = weather.hourly.time.findIndex(time => {
            const hour = new Date(time).getHours();
            return hour === currentHour;
        });
        const safeStartIndex = startIndex === -1 ? 0 : startIndex;
        const hourlyTemperatures = [];
        const hourlyLabels = [];

        for (let i = safeStartIndex; i < safeStartIndex + 8 && i < weather.hourly.time.length; i++) {
            hourlyTemperatures.push(Math.round(weather.hourly.temperature_2m[i]));
            const hour = new Date(weather.hourly.time[i]);
            hourlyLabels.push(
                hour.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true
                })
            );
        }

        weatherData.hourly = {
            labels: hourlyLabels,
            temperatures: hourlyTemperatures
        };

        setDashboardLoadedState();
        updateCurrentWeather(weatherData);
        updateForecast(weatherData.forecast);
        drawTemperatureChart();
        updateDateTime();

        console.log("Dashboard updated successfully");
    } catch (error) {
        console.error("Weather request failed:", error);
        alert("Something went wrong while fetching weather data.");
    }
}

async function searchWeather() {
    const city = searchInput.value.trim();

    if (!city) {
        searchInput.focus();
        return;
    }

    try {
        console.log(`Searching weather for city ${city}`);

        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        if (!locationResponse.ok) throw new Error("Could not find location");

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            alert("City not found.");
            return;
        }

        const location = locationData.results[0];
        const displayCity = `${location.name}, ${location.country_code}`;

        await fetchWeatherForLocation(location.latitude, location.longitude, displayCity);
    } catch (error) {
        console.error("Weather search failed:", error);
        alert("Something went wrong while searching for the city.");
    }
}

async function getMyLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
            const reverseGeocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
            );

            if (!reverseGeocodeResponse.ok) {
                throw new Error("Could not resolve your city name");
            }

            const reverseData = await reverseGeocodeResponse.json();
            const address = reverseData.address || {};
            const cityName = address.city || address.town || address.village || address.county || address.state || "My Location";

            await fetchWeatherForLocation(latitude, longitude, cityName);
        } catch (error) {
            console.error("Location lookup failed:", error);
            alert("We could not load weather for your current location.");
        }
    }, () => {
        alert("Please allow location access to use your current location.");
    });
}
function getWeatherCondition(code) {
    if (code === 0) return "Clear sky";

    if ([1, 2, 3].includes(code)) return "Partly cloudy";

    if ([45, 48].includes(code)) return "Foggy";

    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";

    if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";

    if ([71, 73, 75, 77].includes(code)) return "Snowy";

    if ([80, 81, 82].includes(code)) return "Rain showers";

    if ([85, 86].includes(code)) return "Snow showers";

    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Unknown";
}
function getWeatherIcon(code, isDay) {

    if (code === 0) return isDay ? "☀️" : "🌙";

    if ([1, 2].includes(code)) return isDay ? "🌤️" : "🌙";

    if (code === 3) return "☁️";

    if ([45, 48].includes(code)) return "🌫️";

    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";

    if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";

    if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";

    if ([95, 96, 99].includes(code)) return "⛈️";

    return "🌡️";
}
function formatForecastDay(dateString, index) {
    if (index === 0) return "Today";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric"
    });
}

searchButton.addEventListener("click", searchWeather);
useLocationButton.addEventListener("click", getMyLocationWeather);
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchWeather();
});

function initializeDashboard() {
    setDashboardEmptyState();
    updateDateTime();
}

window.addEventListener("resize", () => {
    if (!dashboard.classList.contains("empty")) {
        drawTemperatureChart();
    }
});

initializeDashboard();