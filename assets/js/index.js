const searchInput = $("#search-input");
const recentSearchesContainer = $("#recentSearchList");
const apiKey = "59d35777f6ec5554a91df4c08291fafc";

// local storage
const readFromLocalStorage = (key, defaultValue) => {
  // get from LS using key name
  const dataFromLS = localStorage.getItem(key);

  // parse data from LS
  const parsedData = JSON.parse(dataFromLS);

  if (parsedData) {
    return parsedData;
  } else {
    return defaultValue;
  }
};

const writeToLocalStorage = (key, value) => {
  // convert value to string
  const stringifiedValue = JSON.stringify(value);

  // set stringified value to LS for key name
  localStorage.setItem(key, stringifiedValue);
};

// location permissions

const getUserLocation = () => {
  if ("geolocation" in navigator) {
    /* geolocation is available */
    const data = navigator.geolocation.getCurrentPosition(async (position) => {
      const localData = await getForecastData(
        position.coords.latitude,
        position.coords.longitude
      );
      $("#headerContainer").append(
        `<h3 id="localWeatherHeader">Local Weather</h3>`
      );
      setForecastData({ cityName: "Local Weather", weatherData: localData });
    });
  }
};

// construct URL and fetch data

const constructUrl = (baseUrl, params) => {
  const queryParams = new URLSearchParams(params).toString();

  return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
};

const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      $("#weatherError").removeClass("hide");
      $("#weatherContainer").addClass("hide");
      $("#currentWeatherSection").addClass("hide");

      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const fetchWeatherData = async (cityName) => {
  // fetch data from API
  // current data url
  const currentDataUrl = constructUrl(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      q: cityName,
      appid: apiKey,
    }
  );

  const currentData = await fetchData(currentDataUrl);
  if (currentData) {
    updateRecentSearch(cityName);
  }

  // get lat, lon and city name
  const lat = currentData?.coord?.lat;
  const lon = currentData?.coord?.lon;
  const displayCityName = currentData?.name;

  const forecastData = await getForecastData(lat, lon);

  return {
    cityName: displayCityName,
    weatherData: forecastData,
  };
};

const getForecastData = async (lat, lon) => {
  // forecast url
  const forecastDataUrl = constructUrl(
    "https://api.openweathermap.org/data/2.5/onecall",
    {
      lat: lat,
      lon: lon,
      exclude: "minutely,hourly",
      units: "metric",
      appid: apiKey,
    }
  );

  const forecastData = await fetchData(forecastDataUrl);

  return forecastData;
};

// display recently searched section

const displayRecentSearches = () => {
  const recentlySearched = readFromLocalStorage("recentlySearched", []);
  if (recentlySearched.length) {
    $("#recentSearchList").empty();
    recentlySearched.forEach((city) => createRecentCity(city, true));
  } else {
    createRecentCity(null, false);
  }
};

const createRecentCity = (city, canDisplay) => {
  if (canDisplay) {
    $("#recentSearchList").append(
      `<li type="button" data-city="${city}" class="btn btn-primary recent-btn">${city}</li>`
    );
    if ($("#recentPlaceholder")) {
      $("#recentPlaceholder").remove();
    }
  }
};

// handle user input

const handleFormSubmit = async (event) => {
  event.preventDefault();
  const cityName = $("#searchInput").val();
  let reformattedCityName = "";

  if (cityName) {
    // get recent search data
    reformattedCityName = reformatString(cityName.trim());
  }

  // call from API to get data
  const currentForecast = await fetchWeatherData(reformattedCityName);

  setCurrentData(currentForecast);
  setForecastData(currentForecast);
};

const reformatString = (cityName) => {
  lowerCity = cityName.toLowerCase();
  return cityName.charAt(0).toUpperCase() + lowerCity.slice(1);
};

const updateRecentSearch = (reformattedCityName) => {
  const recentlySearched = readFromLocalStorage("recentlySearched", []);

  if (!recentlySearched.includes(reformattedCityName)) {
    // add city to recently searched
    recentlySearched.unshift(reformattedCityName);
  }
  if (recentlySearched.length > 5) {
    recentlySearched.pop();
  }

  writeToLocalStorage("recentlySearched", recentlySearched);
  displayRecentSearches();
};

// display data

const setCurrentData = (currentData) => {
  $("#localWeatherHeader").remove();
  $("#currentWeatherSection").empty();
  let now = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
  const uviColor = getUVIClass(currentData.weatherData.current.uvi);
  $("#currentWeatherSection").append(
    `<h2 id="cityName">${currentData.cityName}</h2>
    <p>${now}</p>
    <p id="temp">Temperature: ${currentData.weatherData.current.temp}</p>
    <p id="wind">Wind: ${currentData.weatherData.current.wind_speed} Mph</p>
    <p id="humidity">Humidity: ${currentData.weatherData.current.humidity}%</p>
    <p id="UV" class=${uviColor}>UV index: ${currentData.weatherData.current.uvi}</p>`
  );
};

const getUVIClass = (uvi) => {
  if (uvi >= 0 && uvi <= 2) {
    return "bg-success";
  }

  if (uvi > 2 && uvi <= 8) {
    return "bg-warning";
  }
  if (uvi > 8) {
    return "bg-danger";
  }
};

const setForecastData = (forecastData) => {
  const dailyData = forecastData.weatherData.daily;
  dailyData.shift();
  dailyData.length = 5;
  $("#forecastSection").empty();
  $("#forecase-title").removeClass("hide");
  dailyData.forEach((dailyWeather) => generateWeatherCard(dailyWeather));
};

const generateWeatherCard = (weatherData) => {
  const dateString = moment.unix(weatherData.dt).format("DD/MM/YYYY");
  $("#forecastSection").append(`
    <div class="card" style="width: 18rem;">
      <img src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${dateString}</h5>
        <p class="card-text">Temp: ${weatherData.temp.max}</p>
        <p class="card-text">Wind: ${weatherData.wind_speed} Mph</p>
        <p class="card-text">Humidity: ${weatherData.humidity}%</p>
      </div>
    </div>
`);
};

const handleSearchClick = async (event) => {
  const target = $(event.target);
  // restrict clicks only from li
  if (target.is("li")) {
    // get data city attribute
    const cityName = target.attr("data-city");
    const weatherData = await fetchWeatherData(cityName);
    setCurrentData(weatherData);
    setForecastData(weatherData);
  }
};

const onReady = () => {
  getUserLocation();
  displayRecentSearches();
};

$(document).ready(onReady);
recentSearchesContainer.click(handleSearchClick);
searchInput.submit(handleFormSubmit);
