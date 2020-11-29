let defaultCity = encodeURI('Houston');
let defaultCoords = {latitude: 0, longitude: 0};
let forecast;
let multiCity = ["New York", "Chicago", "Houston", "Denver", "Los Angeles", "Washington D.C."];
let multiCityWeather = [];
let searchedLocation = '';

let allLocalWeatherData;
let localWeatherData;

let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const main = async () => {
  let coords = await getDefaultLocation();
  localWeatherData = await getLocalWeather(coords.latitude, coords.longitude);
  allLocalWeatherData = await fetchOneCall(coords.latitude, coords.longitude);
  multiCityWeather = await getMultiLocation();
  console.log(multiCityWeather);
  displayMultiCity();
  displayCityHeader(localWeatherData);
  displayMainTemp(localWeatherData, allLocalWeatherData);
  displayFirstFive(allLocalWeatherData);
}

const getDefaultLocation = async () => {
  let newCoords = defaultCoords;
  if('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      newCoords.latitude = position.coords.latitude;
      newCoords.longitude = position.coords.longitude;
    })
  }
  return await newCoords;
}

const getLocalWeather = async (latitude, longitude) => {
  let localWeatherData;
  if(latitude, longitude) {
    localWeatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key.open_weather_api}&units=imperial`);
  }else{
    localWeatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${key.open_weather_api}&units=imperial`)

  }
  return await localWeatherData.json();
}

const getMultiLocation = async () => {
  return await Promise.all(multiCity.map(async (city) => {
    let data = await fetchCity(encodeURI(city));
    let oneCall = await fetchOneCall(data.coord.lat, data.coord.lon);
    return await oneCall;
  }))
}

const fetchCity = async (city) => {
  const cityData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key.open_weather_api}&units=imperial`);
  return await cityData.json();
}

const fetchOneCall = async (lat, long) => {
  const oneCallData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${key.open_weather_api}&units=imperial`);
  return await oneCallData.json();
}

const updateLocation = (e) => {
  searchedLocation = e.target.value;
}

const searchLocation = async (e) => {
  console.log(e);
  if(e.type === "click" || e.key === "Enter")
  try {
    console.log(searchedLocation);
    const data = await fetchCity(encodeURI(searchedLocation));
    if(data.cod === "404" || data.cod === 404 || data.cod === "400" || data.cod === 400) {
      return data.message;
    }else {
      searchedLocation = "";
      search.value = "";
      return data;
    }
  }catch(e) {
    console.log(`Error: ${e}`);
  }
}

const displayMultiCity = () => {
  const parent = document.querySelector("#multi-city");
  multiCity.forEach((city, index) => {
    parent.innerHTML += 
      `<div>
        <div class='mc-city'>${city}</div>
        <img src="http://openweathermap.org/img/wn/${multiCityWeather[index].daily[0].weather[0].icon}.png" alt="${multiCityWeather[index].daily[0].weather[0].description}" />
        <div>
          <div class='mc-high-temp'>High: ${Math.round(multiCityWeather[index].daily[0].temp.max)}</div>
          <div class='mc-low-temp'>Low: ${Math.round(multiCityWeather[index].daily[0].temp.min)}</div>
        </div>
      </div>`
  })
}

const displayCityHeader = (localWeatherData) => {
  const header = document.querySelector("#city-header");
  header.textContent = `Current Weather for ${localWeatherData.name}`;
}

const displayMainTemp = (currentLocationData, allLocalData) => {
  console.log(allLocalData);
  document.querySelector("#main-temp").innerHTML = `${Math.round(currentLocationData.main.temp)}&#176`;
  document.querySelector("#main-temp-icon").innerHTML = `<img src="http://openweathermap.org/img/wn/${allLocalData.current.weather[0].icon}@4x.png" alt=${allLocalData.current.weather[0].description} />`
  document.querySelector("#high-today div").innerHTML = `${Math.round(allLocalData.daily[0].temp.max)}&#176`;
  document.querySelector("#feels-like div").innerHTML = `${Math.round(allLocalData.current.feels_like)}&#176`;
  document.querySelector("#low-today div").innerHTML = `${Math.round(allLocalData.daily[0].temp.min)}&#176`;
  document.querySelector("#humidity div").innerHTML = `${Math.round(allLocalData.current.humidity)}%`;
}

const displayFirstFive = (allLocalData) => {
  const parent = document.querySelector("#forecast");
  allLocalData.daily.forEach((day, index) => {
    if(index > 0 && index < 6) {
      console.log(day);
      const newdt = day.dt * 1000;
      const dayOfWeek = days[new Date(newdt).getDay()];
      const currDate = new Date(newdt).getDate();
      const currMonth = new Date(newdt).getMonth() + 1;
      // const currYear = new Date(newdt ).getFullYear();
      const sunrise = (day.sunrise * 1000) - 21600;
      const sunset = (day.sunset * 1000) - 21600;
      const sunriseMinutes = validateMinutes(sunrise);
      const sunsetMinutes = validateMinutes(sunset);
      parent.innerHTML += `
        <div class="forecast-block">
          <div class="forecast-date">
            <span>${dayOfWeek} ${currMonth}/${currDate}</span>
          </div>
          <div class="forecast-high">
            <span>High: ${Math.round(day.temp.max)}&#176</span>
          </div>
          <div class="forecast-icon">
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt=${day.weather[0].description} />
          </div>
          <div class="forecast-low">
            <span>Low: ${Math.round(day.temp.min)}&#176</span>
          </div>
          <div class="forecast-extras">
            <div class="forecast-sunrise">
              <span>Sunrise:<br> ${new Date(sunrise).getHours()}:${sunriseMinutes} AM</span>
            </div>
            <div class="forecast-humidity">
              <span>Humidity:<br> ${day.humidity}%</span>
            </div>
            <div class="forecast-sunset">
              <span>Sunset:<br> ${new Date(sunset).getHours() - 12}:${sunsetMinutes} PM </span>
            </div>
          </div>
        </div>
      `
    }
  })
}

const validateMinutes = (minutes) => {
  const mins = new Date(minutes).getMinutes();
  const adjusted = mins > 9 ? mins : `0${mins}`;
  return adjusted;
}

const displaySecondFive = () => {

}

main();