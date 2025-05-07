/**
 * @fileOverview Weather service for fetching mock weather data.
 * All data provided by this service is for demonstration purposes and is not real-time or actual weather data.
 * Temperatures are in Celsius.
 */

/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents current weather conditions.
 */
export interface CurrentWeather {
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
  /**
   * The "feels like" temperature in Celsius.
   */
  feelsLikeCelsius: number;
  /**
   * The weather conditions (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
  /**
   * The humidity percentage.
   */
  humidity: number;
  /**
   * The wind speed in miles per hour.
   */
  windSpeed: number;
  /**
   * The probability of precipitation as a percentage (0-100).
   */
  precipitationProbability: number;
  /**
   * The IANA timezone string for the location (e.g., "Europe/London").
   * Optional, as it might not be available for all location sources (e.g., raw geolocation).
   */
  timezone?: string;
}

/**
 * Represents a daily weather forecast.
 */
export interface DailyForecast {
  /**
   * The high temperature in Celsius for the day.
   */
  highTemperatureCelsius: number;
  /**
   * The low temperature in Celsius for the day.
   */
  lowTemperatureCelsius: number;
  /**
   * The weather conditions for the day (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
  /**
   * The probability of precipitation as a percentage (0-100).
   */
  precipitationProbability: number;
  /**
   * Sunrise time, e.g., "06:30".
   */
  sunrise: string;
  /**
   * Sunset time, e.g., "18:45".
   */
  sunset: string;
}

/**
 * Represents an hourly weather forecast.
 */
export interface HourlyForecast {
  /**
   * The time for the forecast (e.g., "10:00").
   */
  time: string;
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
  /**
   * The "feels like" temperature in Celsius.
   */
  feelsLikeCelsius: number;
  /**
   * The weather conditions (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
  /**
   * The probability of precipitation as a percentage (0-100).
   */
  precipitationProbability: number;
}


/**
 * Asynchronously retrieves current weather conditions for a given location.
 * This function returns MOCK data.
 * @param location The location for which to retrieve weather data.
 * @param timezone Optional IANA timezone string.
 * @returns A promise that resolves to a CurrentWeather object containing current weather conditions.
 */
export async function getCurrentWeather(location: Location, timezone?: string): Promise<CurrentWeather> {
  console.log("Fetching current weather for:", location, "Timezone:", timezone);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // More realistic Celsius temperatures for a temperate climate
  const baseTemp = 10 + (Math.random() * 15); // Base temp between 10°C and 25°C
  
  return {
    temperatureCelsius: Math.round(baseTemp + (Math.random() * 4 - 2)), // +/- 2°C variation
    feelsLikeCelsius: Math.round(baseTemp + (Math.random() * 6 - 3)), // Feels like can vary a bit more
    conditions: ['Partly Cloudy', 'Sunny', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
    humidity: 40 + Math.floor(Math.random() * 50), // Humidity 40-90%
    windSpeed: 3 + Math.floor(Math.random() * 12), // mph
    precipitationProbability: Math.floor(Math.random() * 101),
    timezone: timezone,
  };
}

/**
 * Asynchronously retrieves a weather forecast for the next 10 days for a given location.
 * This function returns MOCK data.
 * @param location The location for which to retrieve the weather forecast.
 * @returns A promise that resolves to an array of DailyForecast objects representing the 10-day forecast.
 */
export async function get10DayForecast(location: Location): Promise<DailyForecast[]> {
  console.log("Fetching 10-day forecast for:", location);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Showers', 'Thunderstorm'];
  const forecast: DailyForecast[] = Array.from({ length: 10 }, (_, i) => {
    const baseHigh = 12 + Math.random() * 13; // Base high temp in Celsius (12 to 25°C)
    const highTemperatureCelsius = Math.round(baseHigh + (Math.random() * 4 - 2));
    const lowTemperatureCelsius = Math.round(highTemperatureCelsius - (5 + Math.random() * 5)); // Low is 5-10°C lower
    
    // Mock sunrise/sunset times (very simplified)
    const sunriseHour = 6 + Math.floor(Math.random()*2); // 6 or 7
    const sunriseMinute = Math.floor(Math.random()*4) * 15; // 00, 15, 30, 45
    const sunsetHour = 18 + Math.floor(Math.random()*3); // 18, 19, 20
    const sunsetMinute = Math.floor(Math.random()*4) * 15;

    return {
      highTemperatureCelsius,
      lowTemperatureCelsius,
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      precipitationProbability: Math.floor(Math.random() * 101), // 0-100%
      sunrise: `${sunriseHour.toString().padStart(2, '0')}:${sunriseMinute.toString().padStart(2, '0')}`,
      sunset: `${sunsetHour.toString().padStart(2, '0')}:${sunsetMinute.toString().padStart(2, '0')}`,
    };
  });

  return forecast;
}


/**
 * Asynchronously retrieves an hourly weather forecast for a specific date and location.
 * This function returns MOCK data.
 * For "Today", it starts from the next full hour based on system time.
 * For other days, it provides a full 24-hour forecast.
 *
 * @param date The date for which to retrieve the hourly forecast.
 * @param location The location for which to retrieve the weather forecast.
 * @returns A promise that resolves to an array of HourlyForecast objects.
 */
export async function getHourlyForecast(date: Date, location: Location): Promise<HourlyForecast[]> {
  console.log("Fetching hourly forecast for:", date.toDateString(), "at", location);
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Showers', 'Clear'];
  let hourlyForecasts: HourlyForecast[] = [];
  // Base temperature for the day, adjusted for Celsius
  const baseTemp = 8 + Math.random() * 12; // Base temp for the day between 8°C and 20°C

  for (let hour = 0; hour < 24; hour++) {
    // Simulate temperature variation throughout the day
    const tempVariation = Math.sin((hour / 23) * Math.PI * 2 - Math.PI / 2) * 5; // Sinusoidal variation peaking mid-day
    const temperatureCelsius = Math.round(baseTemp + tempVariation + (Math.random() * 2 - 1)); // Add small random fluctuation
    const feelsLikeCelsius = Math.round(temperatureCelsius + (Math.random() * 3 - 1.5)); // Feels like can be +/- 1.5C
    
    hourlyForecasts.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      temperatureCelsius: temperatureCelsius,
      feelsLikeCelsius: feelsLikeCelsius,
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      precipitationProbability: Math.floor(Math.random() * 101), // Random precip probability up to 100%
    });
  }

  // If the date is today, filter out past hours and the current hour
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    const nextFullHour = now.getHours() + 1; // Start from the next full hour
    hourlyForecasts = hourlyForecasts.filter(forecast => {
      const forecastHour = parseInt(forecast.time.split(':')[0], 10);
      return forecastHour >= nextFullHour;
    });
  }

  return hourlyForecasts;
}
