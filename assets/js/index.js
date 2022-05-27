const searchInput = $("#search-input");
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

// get api data

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
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


// get user input

// read and save to recently searched

// display only 5 recently searched

// get current data

// get forecast



const displayRecentSearches = () => {
  const recentlySearched = readFromLocalStorage("recentlySearched", []);
  if (recentlySearched.length) {
    console.log(recentlySearched.length)
    $("#recentSearchList").empty();
    recentlySearched.forEach(city => createRecentCity(city, true));
  } else {
    createRecentCity(null, false)
  }
}

const createRecentCity = (city, canDisplay) => {

  if (canDisplay){
    $("#recentSearchList").append(`<li type="button" class="btn btn-primary recent-btn">${city}</li>`)
    if ($("#recentPlaceholder")){
      $("#recentPlaceholder").remove();
    }
  } else {
    $("#recentSearchList").append(`<li id="recentPlaceholder" class="btn btn-primary recent-btn">Please Search</li>`)
  }
  
}





// user input
const handleFormSubmit = async (event) => {
  event.preventDefault();
  const cityName = $("#searchInput").val();

  if (cityName) {
    // get recent search data
    const recentlySearched = readFromLocalStorage("recentlySearched", []);

    if (!recentlySearched.includes(cityName)) {
      // add city to recently searched
      recentlySearched.unshift(cityName)
    }
    if (recentlySearched.length > 5){
      recentlySearched.pop();
      console.log("popped")
    }

    writeToLocalStorage("recentlySearched", recentlySearched);
    displayRecentSearches();
  }

  // call from API to get data
  const currentForecast = getCurrentForecast();

  console.log(currentForecast);
};

const getCurrentForecast = async () => {
  const currentData = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=birmingham&appid=59d35777f6ec5554a91df4c08291fafc"
  );

  return currentData;
};

const onReady = () => {
  displayRecentSearches();
};

$(document).ready(onReady);
searchInput.submit(handleFormSubmit);
