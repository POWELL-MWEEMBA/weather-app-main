/*=======================================
“In everything you do, carry gratitude and give your best. 
Progress may seem small at times, but it compounds in the long run.” – Powell Mweemba"
========================================*/
class WeatherApp {
  constructor() {
    this.currentWeatherData = null;
    this.forecastData = null;
    this.currentLocation = { name: "Berlin, Germany", lat: 52.52, lon: 13.41 };
    this.selectedDay = 0; // For hourly forecast
    this.units = {
      temperature: "celsius",
      wind: "kmh",
      precipitation: "mm",
    };
    this.recentSearches = ["New York", "London", "Tokyo", "Berlin"];
    this.isLoading = false;
    this.hasError = false;
    this.searchInProgress = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showLoadingState();
    this.loadWeatherData();
  }

  // UI State Management
  showLoadingState() {
    this.isLoading = true;
    this.hasError = false;

    // Hide weather content
    const contentContainer = document.querySelector(".content-container");
    if (contentContainer) {
      contentContainer.style.display = "none";
    }

    // Show loading state
    this.createLoadingElement();
  }

  showErrorState(message = "Something went wrong") {
    this.isLoading = false;
    this.hasError = true;

    // Hide weather content
    const contentContainer = document.querySelector(".content-container");
    if (contentContainer) {
      contentContainer.style.display = "none";
    }

    // Show error state
    this.createErrorElement(message);
  }

  showSearchInProgressState() {
    this.searchInProgress = true;

    // Show search progress indicator
    this.createSearchProgressElement();
  }

  showWeatherContent() {
    this.isLoading = false;
    this.hasError = false;
    this.searchInProgress = false;

    // Remove loading/error elements
    this.removeStateElements();

    // Show weather content
    const contentContainer = document.querySelector(".content-container");
    if (contentContainer) {
      contentContainer.style.display = "flex";
    }
  }

  showNoSearchResultState() {
    this.searchInProgress = false;

    // Remove search progress
    this.removeSearchProgressElement();

    // Show no search result message
    this.createNoSearchResultElement();
  }

  createLoadingElement() {
    this.removeStateElements();

    const loadingHTML = `
      <div class="state-container loading-state">
        <div class="loading-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    `;

    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      const loadingElement = document.createElement("div");
      loadingElement.innerHTML = loadingHTML;
      loadingElement.className = "loading-wrapper";
      mainContainer.appendChild(loadingElement.firstElementChild);
    }
  }

  createErrorElement(message) {
    this.removeStateElements();

    const errorHTML = `
      <div class="state-container error-state">
        <div class="error-content">
          <div class="error-icon">⚠</div>
          <h2>Something went wrong</h2>
          <p>We couldn't connect to the server (API error). Please try again in a few moments.</p>
          <button class="retry-button" onclick="weatherApp.retryLoadWeather()">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    `;

    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      const errorElement = document.createElement("div");
      errorElement.innerHTML = errorHTML;
      errorElement.className = "error-wrapper";
      mainContainer.appendChild(errorElement.firstElementChild);
    }
  }

  createSearchProgressElement() {
    this.removeSearchProgressElement();

    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      const progressElement = document.createElement("div");
      progressElement.className = "search-progress";
      progressElement.innerHTML = `
        <i class="fa-solid fa-spinner"></i>
        <span>Search in progress</span>
      `;
      searchInput.appendChild(progressElement);
    }
  }

  createNoSearchResultElement() {
    this.removeStateElements();

    const noResultHTML = `
      <div class="state-container no-result-state">
        <div class="no-result-content">
          <h2>No search result found!</h2>
        </div>
      </div>
    `;

    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      const noResultElement = document.createElement("div");
      noResultElement.innerHTML = noResultHTML;
      noResultElement.className = "no-result-wrapper";
      mainContainer.appendChild(noResultElement.firstElementChild);
    }
  }

  removeStateElements() {
    const stateElements = document.querySelectorAll(
      ".state-container, .loading-wrapper, .error-wrapper, .no-result-wrapper"
    );
    stateElements.forEach((element) => element.remove());
  }

  removeSearchProgressElement() {
    const progressElement = document.querySelector(".search-progress");
    if (progressElement) {
      progressElement.remove();
    }
  }

  retryLoadWeather() {
    this.showLoadingState();
    this.loadWeatherData();
  }

  setupEventListeners() {
    // Search functionality
    const searchForm = document.querySelector(".Search-Container");
    const searchInput = document.getElementById("search");

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    // Recent searches
    document.querySelectorAll(".recent-searches-item").forEach((item) => {
      item.addEventListener("click", () => {
        this.searchLocation(item.textContent.trim());
      });
    });

    // Units dropdown
    this.setupUnitsDropdown();

    // Day selector for hourly forecast
    this.setupDaySelector();

    // Daily forecast day selection
    this.setupDailyForecastSelection();
  }

  setupUnitsDropdown() {
    const unitsContainer = document.querySelector(".Units-container");
    const dropdown = document.querySelector(".dropdown");

    if (!unitsContainer || !dropdown) return;

    let dropdownOpen = false;

    // Toggle dropdown
    unitsContainer.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      dropdown.style.display = dropdownOpen ? "block" : "none";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      if (dropdownOpen) {
        dropdownOpen = false;
        dropdown.style.display = "none";
      }
    });

    // Handle unit changes
    const radioInputs = dropdown.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.updateUnits();
        this.showLoadingState();
        this.loadWeatherData(); // Reload with new units
      });
    });

    // Set default units
    const celsiusInput = document.getElementById("Celsius");
    const kmInput = document.getElementById("km");
    const mmInput = document.getElementById("Milimeters");

    if (celsiusInput) celsiusInput.checked = true;
    if (kmInput) kmInput.checked = true;
    if (mmInput) mmInput.checked = true;
  }

  setupDaySelector() {
    const dayDropdown = document.querySelector(".hourly-forecast-dropdown");
    const daysDropdown = document.querySelector(".days-dropdown");

    if (!dayDropdown || !daysDropdown) return;

    let dropdownOpen = false;

    dayDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      daysDropdown.style.display = dropdownOpen ? "flex" : "none";
    });

    document.addEventListener("click", () => {
      if (dropdownOpen) {
        dropdownOpen = false;
        daysDropdown.style.display = "none";
      }
    });

    // Day selection
    daysDropdown
      .querySelectorAll(".daily-focus-title")
      .forEach((dayElement, index) => {
        dayElement.addEventListener("click", () => {
          this.selectedDay = index;
          const hourlyDay = document.querySelector(".hourly-day");
          if (hourlyDay) hourlyDay.textContent = dayElement.textContent;
          this.updateHourlyForecast();
          dropdownOpen = false;
          daysDropdown.style.display = "none";
        });
      });
  }

  setupDailyForecastSelection() {
    document.querySelectorAll(".is-day").forEach((dayElement, index) => {
      dayElement.addEventListener("click", () => {
        this.selectedDay = index;
        const dayName = dayElement.querySelector(".day-label");
        if (dayName) {
          const fullDayName = this.getDayFullName(dayName.textContent);
          const hourlyDay = document.querySelector(".hourly-day");
          if (hourlyDay) hourlyDay.textContent = fullDayName;
        }
        this.updateHourlyForecast();
      });
    });
  }

  getDayFullName(shortName) {
    const dayMap = {
      Sun: "Sunday",
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
    };
    return dayMap[shortName] || shortName;
  }

  updateUnits() {
    const tempInput = document.querySelector(
      'input[name="Temperature"]:checked'
    );
    const windInput = document.querySelector('input[name="Wind"]:checked');
    const precipInput = document.querySelector(
      'input[name="Precipitation"]:checked'
    );

    this.units.temperature =
      tempInput && tempInput.value.toLowerCase() === "fahrenheit"
        ? "fahrenheit"
        : "celsius";
    this.units.wind = windInput && windInput.value === "mph" ? "mph" : "kmh";
    this.units.precipitation =
      precipInput && precipInput.value.toLowerCase() === "inches"
        ? "inch"
        : "mm";
  }

  async searchLocation(query) {
    try {
      this.showSearchInProgressState();

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        this.currentLocation = {
          name: `${location.name}${
            location.country ? ", " + location.country : ""
          }`,
          lat: location.latitude,
          lon: location.longitude,
        };

        this.addToRecentSearches(query);
        this.removeSearchProgressElement();
        this.showLoadingState();
        await this.loadWeatherData();
      } else {
        this.showNoSearchResultState();
        // Auto-hide no result message after 3 seconds
        setTimeout(() => {
          this.removeStateElements();
          this.showWeatherContent();
        }, 3000);
      }
    } catch (error) {
      console.error("Search error:", error);
      this.removeSearchProgressElement();
      this.showErrorState();
    }
  }

  async handleSearch() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;

    const query = searchInput.value.trim();

    if (query) {
      await this.searchLocation(query);
      searchInput.value = "";
    }
  }

  addToRecentSearches(location) {
    if (!this.recentSearches.includes(location)) {
      this.recentSearches.unshift(location);
      this.recentSearches = this.recentSearches.slice(0, 4);
      this.updateRecentSearches();
    }
  }

  updateRecentSearches() {
    const recentItems = document.querySelectorAll(".recent-searches-item");
    recentItems.forEach((item, index) => {
      if (this.recentSearches[index]) {
        item.textContent = this.recentSearches[index];
      }
    });
  }

  async loadWeatherData() {
    try {
      const { lat, lon } = this.currentLocation;

      // Build API URL with current units
      const tempUnit =
        this.units.temperature === "fahrenheit" ? "fahrenheit" : "celsius";
      const windUnit = this.units.wind === "mph" ? "mph" : "kmh";
      const precipUnit = this.units.precipitation === "inch" ? "inch" : "mm";

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}`;

      const response = await fetch(url);
      const weatherData = await response.json();

      if (response.ok && weatherData) {
        this.currentWeatherData = weatherData.current_weather;
        this.forecastData = {
          hourly: weatherData.hourly,
          daily: weatherData.daily,
        };

        this.showWeatherContent();
        this.updateDisplay();
      } else {
        throw new Error("Weather data not available");
      }
    } catch (error) {
      console.error("Weather loading error:", error);
      this.showErrorState();
    }
  }

  updateDisplay() {
    this.updateCurrentWeather();
    this.updateDailyForecast();
    this.updateHourlyForecast();
  }

  updateCurrentWeather() {
    if (!this.currentWeatherData || !this.forecastData) return;

    const { hourly } = this.forecastData;
    const currentHour = 0; // Use first available hour

    // Update location and date
    const locationElement = document.getElementById("location");
    const dateElement = document.getElementById("date");

    if (locationElement)
      locationElement.textContent = this.currentLocation.name;
    if (dateElement) dateElement.textContent = this.formatDate(new Date());

    // Update temperature
    const temp = Math.round(this.currentWeatherData.temperature);
    const tempSymbol = this.units.temperature === "fahrenheit" ? "°F" : "°C";
    const tempElement = document.querySelector(".temperature");
    if (tempElement) tempElement.textContent = `${temp}${tempSymbol}`;

    // Update weather icon
    const weatherIcon = this.getWeatherIcon(
      this.currentWeatherData.weathercode
    );
    const mainCardImg = document.querySelector(".temperature-container img");
    if (mainCardImg) {
      mainCardImg.src = weatherIcon;
      mainCardImg.alt = "Weather icon";
    }

    // Update details with safety checks
    const feelsLikeElement = document.getElementById("Feels-like-value");
    if (
      feelsLikeElement &&
      hourly.apparent_temperature &&
      hourly.apparent_temperature[currentHour] !== undefined
    ) {
      const feelsLike = Math.round(hourly.apparent_temperature[currentHour]);
      feelsLikeElement.textContent = `${feelsLike}${tempSymbol}`;
    }

    const humidityElement = document.getElementById("humidity-value");
    if (
      humidityElement &&
      hourly.relative_humidity_2m &&
      hourly.relative_humidity_2m[currentHour] !== undefined
    ) {
      const humidity = Math.round(hourly.relative_humidity_2m[currentHour]);
      humidityElement.textContent = `${humidity}%`;
    }

    const windElement = document.getElementById("wind-value");
    if (windElement) {
      const windSpeed = Math.round(this.currentWeatherData.windspeed);
      const windUnit = this.units.wind === "mph" ? "mph" : "km/h";
      windElement.textContent = `${windSpeed} ${windUnit}`;
    }

    const precipElement = document.getElementById("precipitation-value");
    if (
      precipElement &&
      hourly.precipitation &&
      hourly.precipitation[currentHour] !== undefined
    ) {
      const precipitation =
        Math.round(hourly.precipitation[currentHour] * 10) / 10;
      const precipUnit = this.units.precipitation === "inch" ? "in" : "mm";
      precipElement.textContent = `${precipitation} ${precipUnit}`;
    }
  }

  updateDailyForecast() {
    if (!this.forecastData || !this.forecastData.daily) return;

    const { daily } = this.forecastData;
    const dayElements = document.querySelectorAll(".is-day");
    const tempSymbol = this.units.temperature === "fahrenheit" ? "°F" : "°C";

    dayElements.forEach((dayElement, index) => {
      if (index < daily.time.length) {
        const date = new Date(daily.time[index]);
        const dayName = this.getDayShortName(date);

        const dayLabel = dayElement.querySelector(".day-label");
        if (dayLabel) dayLabel.textContent = dayName;

        const weatherIcon = this.getWeatherIcon(daily.weather_code[index]);
        const iconElement = dayElement.querySelector(".weaher-icon");
        if (iconElement) {
          iconElement.src = weatherIcon;
          iconElement.alt = "Weather icon";
        }

        const maxTemp = Math.round(daily.temperature_2m_max[index]);
        const minTemp = Math.round(daily.temperature_2m_min[index]);

        const minTempElement = dayElement.querySelector(".min-temperature");
        const maxTempElement = dayElement.querySelector(".max-temperature");

        if (minTempElement)
          minTempElement.textContent = `${maxTemp}${tempSymbol}`;
        if (maxTempElement)
          maxTempElement.textContent = `${minTemp}${tempSymbol}`;
      }
    });
  }

  updateHourlyForecast() {
    if (!this.forecastData || !this.forecastData.hourly) return;

    const { hourly } = this.forecastData;
    const hourlyCards = document.querySelectorAll(".hourly-weather-card");
    const tempSymbol = this.units.temperature === "fahrenheit" ? "°F" : "°C";

    // Get hours for selected day
    const startHour = this.selectedDay * 24;

    hourlyCards.forEach((card, index) => {
      const hourIndex = startHour + index * 3; // Every 3 hours

      if (
        hourIndex < hourly.time.length &&
        hourly.temperature_2m[hourIndex] !== undefined
      ) {
        const time = new Date(hourly.time[hourIndex]);
        const hour12 = this.formatHour12(time);

        const timeElement = card.querySelector(".hourly-time");
        if (timeElement) timeElement.textContent = hour12;

        const temp = Math.round(hourly.temperature_2m[hourIndex]);
        const tempElement = card.querySelector(".hourly-temperature");
        if (tempElement) tempElement.textContent = `${temp}${tempSymbol}`;

        const weatherIcon = this.getWeatherIcon(hourly.weather_code[hourIndex]);
        const iconElement = card.querySelector("img");
        if (iconElement) {
          iconElement.src = weatherIcon;
          iconElement.alt = "Weather icon";
        }
      }
    });
  }

  getWeatherIcon(weatherCode) {
    // Weather code to icon mapping using local assets
    const iconMap = {
      0: "./assets/images/icon-sunny.webp", // Clear sky
      1: "./assets/images/icon-partly-cloudy.webp", // Mainly clear
      2: "./assets/images/icon-partly-cloudy.webp", // Partly cloudy
      3: "./assets/images/icon-overcast.webp", // Overcast
      45: "./assets/images/icon-fog.webp", // Fog
      48: "./assets/images/icon-fog.webp", // Rime fog
      51: "./assets/images/icon-rain.webp", // Light drizzle
      53: "./assets/images/icon-rain.webp", // Moderate drizzle
      55: "./assets/images/icon-rain.webp", // Dense drizzle
      61: "./assets/images/icon-rain.webp", // Slight rain
      63: "./assets/images/icon-rain.webp", // Moderate rain
      65: "./assets/images/icon-rain.webp", // Heavy rain
      71: "./assets/images/icon-snow.webp", // Slight snow
      73: "./assets/images/icon-snow.webp", // Moderate snow
      75: "./assets/images/icon-snow.webp", // Heavy snow
      95: "./assets/images/icon-storm.webp", // Thunderstorm
      96: "./assets/images/icon-storm.webp", // Thunderstorm with hail
      99: "./assets/images/icon-storm.webp", // Thunderstorm with heavy hail
    };

    return iconMap[weatherCode] || iconMap[0];
  }

  formatDate(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  formatHour12(date) {
    const hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12} ${ampm}`;
  }

  getDayShortName(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }
}

// Initialize the weather app when DOM is loaded and make it globally accessible
let weatherApp;

document.addEventListener("DOMContentLoaded", () => {
  try {
    weatherApp = new WeatherApp();

    // Add CSS styles for state management
    const styles = document.createElement("style");
    styles.textContent = `
      .state-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        width: 100%;
      }
      
      .loading-content, .error-content, .no-result-content {
        text-align: center;
        color: hsl(0, 0%, 100%);
      }
      
      .loading-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .loading-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: hsl(243, 96%, 65%);
        animation: loading-bounce 1.4s infinite ease-in-out;
      }
      
      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      .loading-dots span:nth-child(3) { animation-delay: 0s; }
      
      @keyframes loading-bounce {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
      
      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: hsl(0, 70%, 60%);
      }
      
      .error-content h2, .no-result-content h2 {
        font-size: 24px;
        margin-bottom: 16px;
        color: hsl(0, 0%, 100%);
      }
      
      .error-content p {
        font-size: 16px;
        color: hsl(240, 6%, 70%);
        margin-bottom: 24px;
        max-width: 400px;
        line-height: 1.5;
      }
      
      .retry-button {
        background-color: hsl(243, 96%, 65%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 auto;
        transition: all 0.2s ease;
      }
      
      .retry-button:hover {
        background-color: hsl(233, 67%, 56%);
        transform: translateY(-1px);
      }
      
      .search-progress {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: hsl(243, 23%, 30%);
        border: 1px solid hsl(243, 23%, 40%);
        border-radius: 8px;
        padding: 8px 16px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: hsl(0, 0%, 100%);
        z-index: 5;
      }
      
      .search-progress i {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .no-result-content h2 {
        font-size: 20px;
        color: hsl(0, 0%, 100%);
      }
    `;
    document.head.appendChild(styles);
  } catch (error) {
    console.error("Failed to initialize weather app:", error);
  }
});
