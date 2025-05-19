const axios = require("axios");

const { transliterate } = require('transliteration');

const API_KEY = "f26f012163284b8fb39105415251805"; // заміни своїм реальним ключем
const BASE_URL = "http://api.weatherapi.com/v1/current.json";
async function getWeather(city) {
    try {

        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: transliterate(city),
                aqi: "no",
            },
        });

        const data = response.data;
        return {
            city: `In ${city.split(",")[0]} will be:`,
            temperature: data.current.temp_c,
            humidity: data.current.humidity,
            description: data.current.condition.text,
        };
    } catch (error) {
        if(error.status === 400) return {status: 404}
        return console.error("Error fetching weather data:", error);
    }
}

module.exports = { getWeather };
