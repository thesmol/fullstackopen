import { useEffect, useState } from "react";
import weatherService from "../services/weatherService";

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const coordinates = country.capitalInfo.latlng;
    if (!coordinates?.length) return;

    weatherService
      .getByCoordinates(coordinates[0], coordinates[1])
      .then((weather) => setWeather(weather));
  }, [country.capitalInfo]);

  console.log(weather);

  if (!weather) return null;

  return (
    <div>
      <h2>Weather in {country.capital.join(",")}</h2>
      <p>Temperature {weather.main.temp} Celsius</p>
      <img
        src={`https://openweathermap.org/payload/api/media/file/${weather.weather[0].icon}.png`}
        alt="weather state icon"
      />
      <p>Wind {weather.wind.speed} M/s</p>
    </div>
  );
};

export default Weather;
