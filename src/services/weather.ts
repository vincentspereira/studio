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
   * The temperature in Fahrenheit.
   */
  temperatureFarenheit: number;
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
   * The precipitation amount in inches.
   */
  precipitation: number;
}

/**
 * Represents a daily weather forecast.
 */
export interface DailyForecast {
  /**
   * The high temperature in Fahrenheit for the day.
   */
  highTemperatureFarenheit: number;
  /**
   * The low temperature in Fahrenheit for the day.
   */
  lowTemperatureFarenheit: number;
  /**
   * The weather conditions for the day (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
}

/**
 * Asynchronously retrieves current weather conditions for a given location.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to a CurrentWeather object containing current weather conditions.
 */
export async function getCurrentWeather(location: Location): Promise<CurrentWeather> {
  // TODO: Implement this by calling an external API.

  return {
    temperatureFarenheit: 75,
    conditions: 'Partly Cloudy',
    humidity: 60,
    windSpeed: 5,
    precipitation: 0,
  };
}

/**
 * Asynchronously retrieves a weather forecast for the next 10 days for a given location.
 *
 * @param location The location for which to retrieve the weather forecast.
 * @returns A promise that resolves to an array of DailyForecast objects representing the 10-day forecast.
 */
export async function get10DayForecast(location: Location): Promise<DailyForecast[]> {
  // TODO: Implement this by calling an external API.

  const forecast: DailyForecast[] = [
    {
      highTemperatureFarenheit: 80,
      lowTemperatureFarenheit: 65,
      conditions: 'Sunny',
    },
    {
      highTemperatureFarenheit: 78,
      lowTemperatureFarenheit: 63,
      conditions: 'Sunny',
    },
    {
      highTemperatureFarenheit: 77,
      lowTemperatureFarenheit: 62,
      conditions: 'Cloudy',
    },
    {
      highTemperatureFarenheit: 76,
      lowTemperatureFarenheit: 61,
      conditions: 'Rainy',
    },
    {
      highTemperatureFarenheit: 79,
      lowTemperatureFarenheit: 64,
      conditions: 'Sunny',
    },
    {
      highTemperatureFarenheit: 81,
      lowTemperatureFarenheit: 66,
      conditions: 'Sunny',
    },
    {
      highTemperatureFarenheit: 82,
      lowTemperatureFarenheit: 67,
      conditions: 'Partly Cloudy',
    },
    {
      highTemperatureFarenheit: 79,
      lowTemperatureFarenheit: 64,
      conditions: 'Cloudy',
    },
    {
      highTemperatureFarenheit: 78,
      lowTemperatureFarenheit: 63,
      conditions: 'Rainy',
    },
    {
      highTemperatureFarenheit: 77,
      lowTemperatureFarenheit: 62,
      conditions: 'Sunny',
    },
  ];

  return forecast;
}
