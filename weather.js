// ===== WEATHER MODULE =====
const WeatherModule = (function() {
    // Local weather data for different locations
    const weatherData = {
        "Ghaziabad": {
            current: {
                temp: 32,
                feels_like: 35,
                condition: "Partly Cloudy",
                icon: "fa-cloud-sun",
                humidity: 65,
                wind_speed: 12,
                wind_direction: "NE",
                visibility: 8,
                pressure: 1012,
                uv_index: 7,
                sunrise: "6:12 AM",
                sunset: "6:45 PM",
                high: 34,
                low: 28,
                precipitation: 20,
                wind_gust: 18,
                dew_point: 24,
                aqi: 112,
                aqi_level: "Moderate",
                suggestion: "It's a warm day with moderate air quality. Stay hydrated and consider wearing sunscreen if going outside."
            },
            hourly: generateHourlyData(32, 28, 34, 20),
            forecast: generateForecastData(32, 5)
        },
        "Delhi": {
            current: {
                temp: 34,
                feels_like: 38,
                condition: "Sunny",
                icon: "fa-sun",
                humidity: 45,
                wind_speed: 10,
                wind_direction: "NW",
                visibility: 10,
                pressure: 1010,
                uv_index: 9,
                sunrise: "6:05 AM",
                sunset: "6:50 PM",
                high: 36,
                low: 30,
                precipitation: 5,
                wind_gust: 15,
                dew_point: 22,
                aqi: 156,
                aqi_level: "Unhealthy",
                suggestion: "Very hot with unhealthy air quality. Limit outdoor activities during peak hours and stay hydrated."
            },
            hourly: generateHourlyData(34, 30, 36, 5),
            forecast: generateForecastData(34, 5)
        },
        "Mumbai": {
            current: {
                temp: 30,
                feels_like: 36,
                condition: "Humid",
                icon: "fa-cloud-rain",
                humidity: 85,
                wind_speed: 15,
                wind_direction: "SW",
                visibility: 6,
                pressure: 1008,
                uv_index: 6,
                sunrise: "6:30 AM",
                sunset: "7:00 PM",
                high: 32,
                low: 28,
                precipitation: 60,
                wind_gust: 25,
                dew_point: 26,
                aqi: 89,
                aqi_level: "Moderate",
                suggestion: "High humidity with chance of rain. Carry an umbrella and wear light, breathable clothing."
            },
            hourly: generateHourlyData(30, 28, 32, 60),
            forecast: generateForecastData(30, 5)
        },
        "Bangalore": {
            current: {
                temp: 26,
                feels_like: 28,
                condition: "Mostly Cloudy",
                icon: "fa-cloud",
                humidity: 70,
                wind_speed: 8,
                wind_direction: "E",
                visibility: 12,
                pressure: 1015,
                uv_index: 5,
                sunrise: "6:15 AM",
                sunset: "6:30 PM",
                high: 28,
                low: 22,
                precipitation: 30,
                wind_gust: 12,
                dew_point: 20,
                aqi: 65,
                aqi_level: "Moderate",
                suggestion: "Pleasant weather with moderate air quality. Great day for outdoor activities."
            },
            hourly: generateHourlyData(26, 22, 28, 30),
            forecast: generateForecastData(26, 5)
        },
        "Lucknow": {
            current: {
                temp: 33,
                feels_like: 37,
                condition: "Hazy",
                icon: "fa-smog",
                humidity: 60,
                wind_speed: 5,
                wind_direction: "N",
                visibility: 4,
                pressure: 1013,
                uv_index: 8,
                sunrise: "6:10 AM",
                sunset: "6:40 PM",
                high: 35,
                low: 29,
                precipitation: 10,
                wind_gust: 10,
                dew_point: 25,
                aqi: 178,
                aqi_level: "Unhealthy",
                suggestion: "Hazy conditions with poor air quality. Consider wearing a mask if sensitive to air pollution."
            },
            hourly: generateHourlyData(33, 29, 35, 10),
            forecast: generateForecastData(33, 5)
        }
    };

    // Generate realistic hourly data
    function generateHourlyData(currentTemp, low, high, precipitationChance) {
        const hours = [];
        const now = new Date();
        const currentHour = now.getHours();
        
        // Generate temperatures that follow a realistic daily pattern
        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            let temp;
            
            // Simulate temperature curve throughout the day
            if (hour >= 5 && hour < 10) {
                // Morning rise
                temp = low + (high - low) * (hour - 5) / 5;
            } else if (hour >= 10 && hour < 15) {
                // Afternoon peak
                temp = high - (high - low) * (hour - 10) / 10;
            } else if (hour >= 15 && hour < 20) {
                // Evening decline
                temp = high - (high - low) * (hour - 15) / 5;
            } else {
                // Night time
                temp = low + (high - low) * (1 - hour / 5) / 2;
            }
            
            // Add some randomness
            temp += (Math.random() - 0.5) * 2;
            temp = Math.round(temp * 10) / 10;
            
            // Determine weather condition based on precipitation chance
            let condition, icon;
            if (Math.random() * 100 < precipitationChance / 3 && hour > 6 && hour < 20) {
                condition = "Rain";
                icon = "fa-cloud-rain";
            } else if (Math.random() * 100 < precipitationChance && hour > 6 && hour < 20) {
                condition = "Light Rain";
                icon = "fa-cloud-sun-rain";
            } else if (hour > 6 && hour < 18) {
                condition = ["Sunny", "Partly Cloudy", "Mostly Cloudy"][Math.floor(Math.random() * 3)];
                icon = condition === "Sunny" ? "fa-sun" : 
                       condition === "Partly Cloudy" ? "fa-cloud-sun" : "fa-cloud";
            } else {
                condition = ["Clear", "Partly Cloudy"][Math.floor(Math.random() * 2)];
                icon = condition === "Clear" ? "fa-moon" : "fa-cloud-moon";
            }
            
            hours.push({
                hour: `${hour}:00`,
                temp: temp,
                condition: condition,
                icon: icon,
                precipitation: Math.random() * 100 < precipitationChance ? (Math.random() * 5).toFixed(1) + " mm" : "0 mm"
            });
        }
        
        return hours;
    }

    // Generate 5-day forecast data
    function generateForecastData(currentTemp, days) {
        const forecast = [];
        const now = new Date();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            const dayName = daysOfWeek[date.getDay()];
            
            // Generate temperatures with some variation
            const baseHigh = currentTemp + (Math.random() - 0.3) * 6;
            const baseLow = currentTemp - 4 + (Math.random() - 0.3) * 4;
            const high = Math.round(baseHigh * 10) / 10;
            const low = Math.round(baseLow * 10) / 10;
            
            // Generate weather conditions with some logic
            let condition, icon;
            const rand = Math.random();
            if (rand < 0.1) {
                condition = "Rain";
                icon = "fa-cloud-rain";
            } else if (rand < 0.3) {
                condition = "Partly Cloudy";
                icon = "fa-cloud-sun";
            } else if (rand < 0.6) {
                condition = "Mostly Cloudy";
                icon = "fa-cloud";
            } else {
                condition = "Sunny";
                icon = "fa-sun";
            }
            
            forecast.push({
                day: i === 0 ? "Today" : dayName,
                high: high,
                low: low,
                condition: condition,
                icon: icon,
                precipitation: Math.round(Math.random() * 40) + "%"
            });
        }
        
        return forecast;
    }

    // Get weather data for a location
    function getWeatherData(location) {
        return weatherData[location] || weatherData["Ghaziabad"];
    }

    // Convert Celsius to Fahrenheit
    function celsiusToFahrenheit(c) {
        return (c * 9/5) + 32;
    }

    // Format temperature based on unit
    function formatTemp(temp, unit) {
        if (unit === "fahrenheit") {
            return celsiusToFahrenheit(temp).toFixed(1);
        }
        return temp.toFixed(1);
    }

    // Get AQI level description
    function getAQIDescription(aqi) {
        if (aqi <= 50) return { level: "Good", color: "#00e400" };
        if (aqi <= 100) return { level: "Moderate", color: "#ffff00" };
        if (aqi <= 150) return { level: "Unhealthy for Sensitive Groups", color: "#ff7e00" };
        if (aqi <= 200) return { level: "Unhealthy", color: "#ff0000" };
        if (aqi <= 300) return { level: "Very Unhealthy", color: "#8f3f97" };
        return { level: "Hazardous", color: "#7e0023" };
    }

    // Get weather icon based on condition
    function getWeatherIcon(condition) {
        const icons = {
            "Sunny": "fa-sun",
            "Partly Cloudy": "fa-cloud-sun",
            "Mostly Cloudy": "fa-cloud",
            "Cloudy": "fa-cloud",
            "Rain": "fa-cloud-rain",
            "Light Rain": "fa-cloud-sun-rain",
            "Thunderstorm": "fa-bolt",
            "Snow": "fa-snowflake",
            "Fog": "fa-smog",
            "Hazy": "fa-smog",
            "Clear": "fa-moon",
            "Humid": "fa-water"
        };
        return icons[condition] || "fa-cloud";
    }

    // Get weather suggestion based on conditions
    function generateSuggestion(weather) {
        const temp = weather.current.temp;
        const condition = weather.current.condition;
        const aqi = weather.current.aqi;
        
        let suggestions = [];
        
        // Temperature based suggestions
        if (temp > 35) {
            suggestions.push("Extremely hot day. Stay in shade and drink plenty of water.");
        } else if (temp > 30) {
            suggestions.push("Hot day. Wear light clothing and stay hydrated.");
        } else if (temp < 15) {
            suggestions.push("Chilly weather. Dress warmly to stay comfortable.");
        } else {
            suggestions.push("Pleasant temperature. Enjoy the comfortable weather.");
        }
        
        // Condition based suggestions
        if (condition.includes("Rain")) {
            suggestions.push("Rain expected. Carry an umbrella or raincoat.");
        } else if (condition.includes("Cloudy")) {
            suggestions.push("Cloudy skies. Might be a good day to go out without harsh sun.");
        } else if (condition.includes("Sunny")) {
            suggestions.push("Sunny day. Don't forget your sunscreen!");
        } else if (condition.includes("Hazy") || condition.includes("Fog")) {
            suggestions.push("Reduced visibility. Be cautious if driving.");
        }
        
        // AQI based suggestions
        if (aqi > 150) {
            suggestions.push("Poor air quality. Limit outdoor activities, especially if you have respiratory issues.");
        } else if (aqi > 100) {
            suggestions.push("Moderate air quality. Sensitive individuals should consider reducing prolonged outdoor exertion.");
        }
        
        return suggestions.join(" ");
    }

    return {
        getWeatherData,
        formatTemp,
        getAQIDescription,
        getWeatherIcon,
        generateSuggestion
    };
})();

// ===== WEATHER UI CONTROLLER =====
const WeatherUIController = (function() {
    // DOM Elements
    const elements = {
        weatherContainer: document.querySelector('.weather-container'),
        locationSelect: document.getElementById('weather-location'),
        refreshButton: document.getElementById('refresh-weather'),
        unitButtons: document.querySelectorAll('.unit-btn'),
        weatherTemp: document.getElementById('weather-temp'),
        weatherSummary: document.getElementById('weather-summary'),
        weatherIcon: document.getElementById('weather-icon'),
        feelsLike: document.getElementById('feels-like'),
        windSpeed: document.getElementById('wind-speed'),
        humidity: document.getElementById('humidity'),
        visibility: document.getElementById('visibility'),
        smartSuggestion: document.getElementById('smart-suggestion'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        uvValue: document.getElementById('uv-value'),
        uvLevel: document.getElementById('uv-level'),
        highTemp: document.getElementById('high-temp'),
        lowTemp: document.getElementById('low-temp'),
        precipitation: document.getElementById('precipitation'),
        windGust: document.getElementById('wind-gust'),
        pressure: document.getElementById('pressure'),
        dewPoint: document.getElementById('dew-point'),
        aqiValue: document.getElementById('aqi-value'),
        aqiBar: document.getElementById('aqi-bar'),
        aqiMessage: document.getElementById('aqi-message'),
        hourlyForecast: document.getElementById('hourly-forecast'),
        forecastGrid: document.getElementById('forecast-grid'),
        viewWeatherMap: document.getElementById('view-weather-map'),
        scrollLeft: document.querySelector('.scroll-button.left'),
        scrollRight: document.querySelector('.scroll-button.right')
    };

    // Current state
    let state = {
        currentLocation: 'Ghaziabad',
        currentUnit: 'celsius',
        weatherData: null
    };

    // Initialize the weather module
    function init() {
        // Load initial weather data
        loadWeatherData(state.currentLocation);
        
        // Set up event listeners
        setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Location change
        elements.locationSelect.addEventListener('change', function() {
            state.currentLocation = this.value;
            loadWeatherData(state.currentLocation);
        });
        
        // Refresh button
        elements.refreshButton.addEventListener('click', function() {
            loadWeatherData(state.currentLocation);
            
            // Add refresh animation
            this.classList.add('refreshing');
            setTimeout(() => {
                this.classList.remove('refreshing');
            }, 1000);
        });
        
        // Unit toggle buttons
        elements.unitButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (!this.classList.contains('active')) {
                    // Switch active unit
                    elements.unitButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    state.currentUnit = this.dataset.unit;
                    
                    // Update all temperature displays
                    updateAllTemperatures();
                }
            });
        });
        
        // Hourly forecast scroll buttons
        elements.scrollLeft.addEventListener('click', scrollHourlyLeft);
        elements.scrollRight.addEventListener('click', scrollHourlyRight);
        
        // View weather map button
        elements.viewWeatherMap.addEventListener('click', function() {
            alert(`Weather map for ${state.currentLocation} would open here in a real application.`);
        });
    }

    // Load weather data for a location
    function loadWeatherData(location) {
        // Get weather data from our module
        state.weatherData = WeatherModule.getWeatherData(location);
        
        // Update all UI elements
        updateCurrentWeather();
        updateHourlyForecast();
        updateForecast();
        updateWeatherInsights();
        updateAirQuality();
    }

    // Update current weather display
    function updateCurrentWeather() {
        const current = state.weatherData.current;
        
        // Temperature
        elements.weatherTemp.textContent = WeatherModule.formatTemp(current.temp, state.currentUnit);
        
        // Summary and icon
        elements.weatherSummary.textContent = current.condition;
        elements.weatherIcon.innerHTML = `<i class="fas ${current.icon}"></i>`;
        
        // Details
        elements.feelsLike.textContent = `Feels like: ${WeatherModule.formatTemp(current.feels_like, state.currentUnit)}°`;
        elements.windSpeed.textContent = `Wind: ${current.wind_speed} km/h ${current.wind_direction}`;
        elements.humidity.textContent = `Humidity: ${current.humidity}%`;
        elements.visibility.textContent = `Visibility: ${current.visibility} km`;
        
        // Smart suggestion
        elements.smartSuggestion.textContent = current.suggestion;
        
        // Sun times
        elements.sunrise.textContent = current.sunrise;
        elements.sunset.textContent = current.sunset;
        
        // UV Index
        elements.uvValue.textContent = current.uv_index;
        elements.uvLevel.style.width = `${Math.min(100, current.uv_index * 10)}%`;
    }

    // Update all temperature displays when unit changes
    function updateAllTemperatures() {
        const current = state.weatherData.current;
        
        // Current temp
        elements.weatherTemp.textContent = WeatherModule.formatTemp(current.temp, state.currentUnit);
        elements.feelsLike.textContent = `Feels like: ${WeatherModule.formatTemp(current.feels_like, state.currentUnit)}°`;
        
        // High and low temps
        elements.highTemp.textContent = `${WeatherModule.formatTemp(current.high, state.currentUnit)}°`;
        elements.lowTemp.textContent = `${WeatherModule.formatTemp(current.low, state.currentUnit)}°`;
        
        // Hourly forecast
        updateHourlyForecast();
        
        // 5-day forecast
        updateForecast();
        
        // Dew point
        elements.dewPoint.textContent = `${WeatherModule.formatTemp(current.dew_point, state.currentUnit)}°`;
    }

    // Update hourly forecast
    function updateHourlyForecast() {
        // Clear existing content
        elements.hourlyForecast.innerHTML = '';
        
        // Add hourly items
        state.weatherData.hourly.forEach(hour => {
            const hourEl = document.createElement('div');
            hourEl.className = 'hourly-item';
            hourEl.innerHTML = `
                <div class="hour">${hour.hour}</div>
                <div class="hour-icon"><i class="fas ${hour.icon}"></i></div>
                <div class="hour-temp">${WeatherModule.formatTemp(hour.temp, state.currentUnit)}°</div>
            `;
            elements.hourlyForecast.appendChild(hourEl);
        });
    }

    // Update 5-day forecast
    function updateForecast() {
        // Clear existing content
        elements.forecastGrid.innerHTML = '';
        
        // Add forecast cards
        state.weatherData.forecast.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'forecast-card';
            dayEl.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-icon"><i class="fas ${day.icon}"></i></div>
                <div class="forecast-temps">
                    <span class="forecast-high">${WeatherModule.formatTemp(day.high, state.currentUnit)}°</span>
                    <span class="forecast-low">${WeatherModule.formatTemp(day.low, state.currentUnit)}°</span>
                </div>
            `;
            elements.forecastGrid.appendChild(dayEl);
        });
    }

    // Update weather insights
    function updateWeatherInsights() {
        const current = state.weatherData.current;
        
        elements.highTemp.textContent = `${WeatherModule.formatTemp(current.high, state.currentUnit)}°`;
        elements.lowTemp.textContent = `${WeatherModule.formatTemp(current.low, state.currentUnit)}°`;
        elements.precipitation.textContent = `${current.precipitation}%`;
        elements.windGust.textContent = `${current.wind_gust} km/h`;
        elements.pressure.textContent = `${current.pressure} hPa`;
        elements.dewPoint.textContent = `${WeatherModule.formatTemp(current.dew_point, state.currentUnit)}°`;
    }

    // Update air quality information
    function updateAirQuality() {
        const current = state.weatherData.current;
        const aqiInfo = WeatherModule.getAQIDescription(current.aqi);
        
        elements.aqiValue.textContent = current.aqi;
        elements.aqiBar.style.backgroundColor = aqiInfo.color;
        elements.aqiMessage.textContent = `Air quality is ${aqiInfo.level.toLowerCase()}. ${current.aqi_level} health concern.`;
    }

    // Scroll hourly forecast left
    function scrollHourlyLeft() {
        elements.hourlyForecast.scrollBy({
            left: -200,
            behavior: 'smooth'
        });
    }

    // Scroll hourly forecast right
    function scrollHourlyRight() {
        elements.hourlyForecast.scrollBy({
            left: 200,
            behavior: 'smooth'
        });
    }

    return {
        init: init
    };
})();

// Initialize the weather UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    WeatherUIController.init();
});