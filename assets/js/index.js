const searchInput = $("#search-input");
const apiKey = "59d35777f6ec5554a91df4c08291fafc";

const onReady = () => {
  console.log("ready");
};

// user input
const handleFormSubmit = (event) => {
  event.preventDefault();
  const cityName = $("#searchInput").val();
  console.log(cityName);

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

$(document).ready(onReady);
searchInput.submit(handleFormSubmit);
