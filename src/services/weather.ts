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
}

/**
 * Represents an hourly weather forecast.
 */
export interface HourlyForecast {
  /**
   * The time for the forecast (e.g., "10:00 AM").
   */
  time: string;
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
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
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to a CurrentWeather object containing current weather conditions.
 */
export async function getCurrentWeather(location: Location): Promise<CurrentWeather> {
  // Mock data, normally fetched from an API
  // 75F ~ 24C
  // Feels like 77F ~ 25C
  console.log("Fetching current weather for:", location);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return {
    temperatureCelsius: 24,
    feelsLikeCelsius: 25,
    conditions: 'Partly Cloudy',
    humidity: 60,
    windSpeed: 5, // mph
    precipitationProbability: 10, // 10%
  };
}

/**
 * Asynchronously retrieves a weather forecast for the next 10 days for a given location.
 *
 * @param location The location for which to retrieve the weather forecast.
 * @returns A promise that resolves to an array of DailyForecast objects representing the 10-day forecast.
 */
export async function get10DayForecast(location: Location): Promise<DailyForecast[]> {
  // Mock data, normally fetched from an API
  console.log("Fetching 10-day forecast for:", location);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

  // Example F to C conversions:
  // 80F ~ 27C, 65F ~ 18C
  // 78F ~ 26C, 63F ~ 17C
  // 77F ~ 25C, 62F ~ 17C
  // 76F ~ 24C, 61F ~ 16C
  // 79F ~ 26C, 64F ~ 18C
  // 81F ~ 27C, 66F ~ 19C
  // 82F ~ 28C, 67F ~ 19C
  const forecast: DailyForecast[] = [
    { highTemperatureCelsius: 27, lowTemperatureCelsius: 18, conditions: 'Sunny' },
    { highTemperatureCelsius: 26, lowTemperatureCelsius: 17, conditions: 'Sunny' },
    { highTemperatureCelsius: 25, lowTemperatureCelsius: 17, conditions: 'Cloudy' },
    { highTemperatureCelsius: 24, lowTemperatureCelsius: 16, conditions: 'Rainy' },
    { highTemperatureCelsius: 26, lowTemperatureCelsius: 18, conditions: 'Sunny' },
    { highTemperatureCelsius: 27, lowTemperatureCelsius: 19, conditions: 'Sunny' },
    { highTemperatureCelsius: 28, lowTemperatureCelsius: 19, conditions: 'Partly Cloudy' },
    { highTemperatureCelsius: 26, lowTemperatureCelsius: 18, conditions: 'Cloudy' },
    { highTemperatureCelsius: 25, lowTemperatureCelsius: 17, conditions: 'Rainy' },
    { highTemperatureCelsius: 24, lowTemperatureCelsius: 16, conditions: 'Sunny' },
  ];

  return forecast;
}


/**
 * Asynchronously retrieves an hourly weather forecast for a specific date and location.
 *
 * @param date The date for which to retrieve the hourly forecast.
 * @param location The location for which to retrieve the weather forecast.
 * @returns A promise that resolves to an array of HourlyForecast objects.
 */
export async function getHourlyForecast(date: Date, location: Location): Promise<HourlyForecast[]> {
  // Mock data, normally fetched from an API
  console.log("Fetching hourly forecast for:", date.toDateString(), "at", location);
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Showers'];
  const hourlyForecasts: HourlyForecast[] = [];
  const baseTemp = 15 + Math.random() * 10; // Base temperature for the day in Celsius

  for (let i = 0; i < 24; i += 3) { // Forecast every 3 hours
    const hour = i;
    // Simulate temperature variation throughout the day
    const tempVariation = Math.sin((hour / 24) * Math.PI * 2 - Math.PI / 2) * 5; // Sinusoidal variation peaking mid-day
    const temperatureCelsius = Math.round(baseTemp + tempVariation + (Math.random() * 2 - 1)); // Add small random fluctuation
    
    hourlyForecasts.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      temperatureCelsius: temperatureCelsius,
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      precipitationProbability: Math.floor(Math.random() * 50), // Random precip probability up to 50%
    });
  }

  return hourlyForecasts;
}
