import axios from "axios";

const api_key = import.meta.env.VITE_WEATHER_KEY;
const baseUrl = (lat, lon) =>
  `https://api.openweathermap.org/data/2.5/weather/?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

const getByCoordinates = (lat, lon) => {
  return axios.get(baseUrl(lat, lon)).then((response) => response.data);
};

export default {
  getByCoordinates,
};
