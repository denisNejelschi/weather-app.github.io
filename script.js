const forecastResult = document.getElementById("forecastResult");
forecastResult.textContent = "loading...";
let dateStart;
let dateEnd;

async function getForecastAndCurrent() {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    const data = await response.json();
    const { latitude, longitude, city, country } = data;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m,windspeed_10m`;
    const response2 = await fetch(url);
    const data2 = await response2.json();
    const { current_weather } = data2;

    const { temperature, relativehumidity, windspeed } = current_weather;

    forecastResult.innerHTML = `
              <h2>Текущая погода в</h2>
              <p>${city}, ${country}</p>
              <p>Температура: ${temperature}°C</p>
              <p>Влажность: ${relativehumidity}%</p>
              <p>Скорость ветра: ${windspeed} м/с</p>
          `;
  } catch (error) {
    forecastResult.textContent = "Error: " + error.message;
  }
}

async function getLastTenDays() {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    const data = await response.json();
    const { latitude, longitude, city, country } = data;
    const urlTenDays = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&past_days=10&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const responseTenDays = await fetch(urlTenDays);
    const dataTenDays = await responseTenDays.json();

    const temperatures = dataTenDays.hourly.temperature_2m;
    const sortedTemperatures = temperatures.sort((a, b) => a - b);
    let medianTemperature;
    if (sortedTemperatures.length % 2 === 0) {
      medianTemperature =
        (sortedTemperatures[sortedTemperatures.length / 2 - 1] +
          sortedTemperatures[sortedTemperatures.length / 2]) /
        2;
    } else {
      medianTemperature =
        sortedTemperatures[Math.floor(sortedTemperatures.length / 2)];
    }

    const humidity = dataTenDays.hourly.relative_humidity_2m;
    const sortedHumidity = humidity.sort((a, b) => a - b);
    let medianHumidity;
    if (sortedHumidity.length % 2 === 0) {
      medianHumidity =
        (sortedHumidity[sortedHumidity.length / 2 - 1] +
          sortedHumidity[sortedHumidity.length / 2]) /
        2;
    } else {
      medianHumidity = sortedHumidity[Math.floor(sortedHumidity.length / 2)];
    }

    const windSpeed = dataTenDays.hourly.wind_speed_10m;
    const sortedWindSpeed = windSpeed.sort((a, b) => a - b);
    let medianWindSpeed;
    if (sortedWindSpeed.length % 2 === 0) {
      medianWindSpeed =
        (sortedWindSpeed[sortedWindSpeed.length / 2 - 1] +
          sortedWindSpeed[sortedWindSpeed.length / 2]) /
        2;
    } else {
      medianWindSpeed = sortedWindSpeed[Math.floor(sortedWindSpeed.length / 2)];
    }

    forecastResult.innerHTML = ` 
            <h2>Погода за 10 дней в</h2> 
            <p>${city}, ${country}</p>
            <p>Медианная температура: ${medianTemperature}°C</p>
            <p>Медианная влажность: ${medianHumidity}% </p>
            <p>Медианная скорость ветра: ${medianWindSpeed} м/с</p>
        `;
  } catch (error) {
    forecastResult.textContent = "Error: " + error.message;
  }
}

function getDates() {
  forecastResult.innerHTML = "";
  dateStart = document.createElement("input");
  dateEnd = document.createElement("input");
  dateStart.setAttribute("type", "date");
  dateEnd.setAttribute("type", "date");
  dateStart.setAttribute("id", "dateStart");
  dateEnd.setAttribute("id", "dateEnd");
  dateStart.setAttribute("placeholder", "date from YYYY-MM-DD");
  dateEnd.setAttribute("placeholder", "date to YYYY-MM-DD");
  dateStart.setAttribute("class", "dateInput");
  dateEnd.setAttribute("class", "dateInput");
  forecastResult.appendChild(dateStart);
  forecastResult.appendChild(dateEnd);
  const linkBtn = document.createElement("button");
  linkBtn.textContent = "submit";
  forecastResult.appendChild(linkBtn);
  linkBtn.addEventListener("click", getHistoricalData);
}

async function getHistoricalData() {
    try {
      const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await response.json();
      const { latitude, longitude, city, country } = data;
      const urlSelectedTime = `https://archive-api.open-meteo.com/v1/era5?latitude=${latitude}&longitude=${longitude}&start_date=${dateStart.value}&end_date=${dateEnd.value}&hourly=temperature_2m`;
      const responseSelectedTime = await fetch(urlSelectedTime);
      const dataSelectedTime = await responseSelectedTime.json();
      const tempsArray = dataSelectedTime.hourly.temperature_2m;
  
      // Вычисляем среднюю температуру
      const tempMedium = tempsArray.reduce((a, b) => a + b, 0) / tempsArray.length;
  
      forecastResult.innerHTML = ` 
            <h2>За указанный период в</h2> 
            <p>${city}, ${country}</p>
            <p>Средняя температура: ${tempMedium.toFixed(2)}°C</p>       
        `;
    } catch (error) {
      forecastResult.textContent = "Error: " + error.message;
    }
  }
document
  .getElementById("forecastButton")
  .addEventListener("click", getForecastAndCurrent);
document
  .getElementById("lastTenDaysButton")
  .addEventListener("click", getLastTenDays);
document
  .getElementById("historicalDataButton")
  .addEventListener("click", getDates);
