
const API_KEY = '3ff8df08d28c0aaa077e7b0d737062cb';
const DEFAULT_CITY = 'Brazzaville';
const STORAGE_KEY = 'weather_search_history';

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const historyTagsContainer = document.getElementById('history-tags');
const errorMessage = document.getElementById('error-message');

const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecast-container');

document.addEventListener('DOMContentLoaded', () => {
  renderHistoryTags();
  fetchDashboardData(DEFAULT_CITY);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchDashboardData(city);
    cityInput.value = '';
  }
});

async function fetchDashboardData(city) {
  hideError();

  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${API_KEY}`
    );

    if (!currentResponse.ok) {
      throw new Error('Ville non trouvée ou clé API invalide.');
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${API_KEY}`
    );

    if (!forecastResponse.ok) {
      throw new Error('Impossible de charger les prévisions.');
    }

    const forecastData = await forecastResponse.json();

    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    saveCityToHistory(currentData.name);
  } catch (error) {
    showError(error.message);
    console.error('Erreur API :', error);
  }
}

function displayCurrentWeather(data) {
  const { main, weather, wind, sys } = data;

  cityName.textContent = `${data.name}, ${sys?.country || ''}`.trim();
  currentDate.textContent = new Date(data.dt * 1000).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const icon = weather?.[0]?.icon;
  if (icon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = weather[0].description || 'Icône météo';
  }

  currentTemp.textContent = `${Math.round(main.temp)}°C`;
  weatherDesc.textContent = weather?.[0]?.description || 'Météo';
  feelsLike.textContent = `${Math.round(main.feels_like)}°C`;
  humidity.textContent = `${main.humidity}%`;
  windSpeed.textContent = `${Math.round(wind.speed * 3.6)} km/h`;
  sunrise.textContent = formatTime(sys.sunrise, data.timezone || 0);
  sunset.textContent = formatTime(sys.sunset, data.timezone || 0);
}

function displayForecast(data) {
  const dailyItems = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);

  forecastContainer.innerHTML = dailyItems.map((item) => {
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    const temp = Math.round(item.main.temp);
    const icon = item.weather?.[0]?.icon || '01d';
    const desc = item.weather?.[0]?.description || 'Météo';

    return `
      <div class="forecast-item">
        <span class="forecast-day">${dayName}</span>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" width="38" height="38">
        <span class="forecast-temp">${temp}°C</span>
      </div>
    `;
  }).join('');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function saveCityToHistory(cityNameValue) {
  const currentHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const cleaned = cityNameValue.trim();

  if (!cleaned) return;

  const updatedHistory = [cleaned, ...currentHistory.filter(item => item.toLowerCase() !== cleaned.toLowerCase())].slice(0, 6);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  renderHistoryTags();
}

function renderHistoryTags() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  if (!historyTagsContainer) return;

  if (!history.length) {
    historyTagsContainer.innerHTML = '<span class="empty-history">Aucune recherche récente</span>';
    return;
  }

  historyTagsContainer.innerHTML = history.map((city) => {
    return `<button type="button" class="history-tag" data-city="${city}">${city}</button>`;
  }).join('');

  historyTagsContainer.querySelectorAll('.history-tag').forEach((button) => {
    button.addEventListener('click', () => {
      const city = button.dataset.city;
      if (city) {
        fetchDashboardData(city);
      }
    });
  });
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}
