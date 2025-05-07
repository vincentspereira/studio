/**
 * @fileOverview Weather service for fetching weather data from OpenWeatherMap.org.
 * Temperatures are in Celsius. Wind speed in mph. Precipitation probability in %.
 */

import { formatInTimeZone } from 'date-fns-tz';

// IMPORTANT: In a production application, API keys should be stored in environment variables
// and not hardcoded. For this exercise, the key is embedded directly.
const API_KEY = "adeaef8cfe7858f48349f3f511042832";
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";


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
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  conditions: string;
  humidity: number;
  windSpeed: number; // mph
  precipitationProbability: number; // 0-100%
  timezone: string; // IANA timezone string
}

/**
 * Represents a daily weather forecast.
 */
export interface DailyForecast {
  date: Date; // Store actual date object for easier comparison
  highTemperatureCelsius: number;
  lowTemperatureCelsius: number;
  conditions: string;
  precipitationProbability: number; // 0-100%
  sunrise: string; // "HH:mm"
  sunset: string; // "HH:mm"
}

/**
 * Represents an hourly weather forecast.
 */
export interface HourlyForecast {
  time: string; // "HH:00"
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  conditions: string;
  precipitationProbability: number; // 0-100%
  dateTime: Date; // Full Date object for this hour, in location's timezone
}

export interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number; // OpenWeatherMap uses 'lon', we map to 'lng'
  country: string;
  state?: string; // e.g., state for US, admin area for others
}

export interface OpenWeatherDataBundle {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[]; // All 48 hours of hourly forecast
  timezone: string; // IANA timezone from API
  lat: number;
  lng: number;
  locationName?: string; // City name from reverse geocoding if available
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function mpsToMph(mps: number): number {
  return Math.round(mps * 2.23694);
}

/**
 * Fetches geocoding information for a city name.
 * @param cityName The name of the city.
 * @returns A promise that resolves to an array of GeocodedLocation objects.
 */
export async function geocodeCity(cityName: string): Promise<GeocodedLocation[]> {
  const response = await fetch(`${GEO_BASE_URL}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to geocode city: ${errorData.message || response.statusText}`);
  }
  const data = await response.json();
  return data.map((item: any) => ({
    name: item.name,
    lat: item.lat,
    lng: item.lon,
    country: item.country,
    state: item.state,
  }));
}

/**
 * Fetches location name via reverse geocoding.
 * @param coords The latitude and longitude.
 * @returns A promise that resolves to a GeocodedLocation object or null.
 */
export async function reverseGeocode(coords: Location): Promise<GeocodedLocation | null> {
  const response = await fetch(`${GEO_BASE_URL}/reverse?lat=${coords.lat}&lon=${coords.lng}&limit=1&appid=${API_KEY}`);
  if (!response.ok) {
    console.error("Failed to reverse geocode:", response.statusText);
    return null;
  }
  const data = await response.json();
  if (data && data.length > 0) {
    const item = data[0];
    return {
      name: item.name,
      lat: item.lat,
      lng: item.lon,
      country: item.country,
      state: item.state,
    };
  }
  return null;
}

/**
 * Fetches comprehensive weather data (current, daily, hourly) from OpenWeatherMap One Call API.
 * @param coords The location (latitude and longitude) for which to fetch weather data.
 * @returns A promise that resolves to an OpenWeatherDataBundle.
 */
export async function fetchOpenWeatherDataBundle(coords: Location): Promise<OpenWeatherDataBundle> {
  const url = `${WEATHER_BASE_URL}?lat=${coords.lat}&lon=${coords.lng}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch weather data: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  const timezone = data.timezone;

  const current: CurrentWeather = {
    temperatureCelsius: Math.round(data.current.temp),
    feelsLikeCelsius: Math.round(data.current.feels_like),
    conditions: data.current.weather[0] ? capitalizeFirstLetter(data.current.weather[0].description) : 'N/A',
    humidity: data.current.humidity,
    windSpeed: mpsToMph(data.current.wind_speed),
    precipitationProbability: data.daily[0] ? Math.round(data.daily[0].pop * 100) : 0, // PoP for today
    timezone: timezone,
  };

  // OWM OneCall free tier gives 8 days of daily forecast (current day + 7 future days)
  const daily: DailyForecast[] = data.daily.slice(0, 8).map((d: any) => {
    const dayDate = new Date(d.dt * 1000);
    return {
      date: dayDate, // Store actual date for easier processing later
      highTemperatureCelsius: Math.round(d.temp.max),
      lowTemperatureCelsius: Math.round(d.temp.min),
      conditions: d.weather[0] ? capitalizeFirstLetter(d.weather[0].description) : 'N/A',
      precipitationProbability: Math.round(d.pop * 100),
      sunrise: formatInTimeZone(new Date(d.sunrise * 1000), timezone, 'HH:mm'),
      sunset: formatInTimeZone(new Date(d.sunset * 1000), timezone, 'HH:mm'),
    };
  });
  
  const hourly: HourlyForecast[] = data.hourly.map((h: any) => {
     const hourlyDt = new Date(h.dt * 1000);
     return {
      time: formatInTimeZone(hourlyDt, timezone, 'HH:00'),
      temperatureCelsius: Math.round(h.temp),
      feelsLikeCelsius: Math.round(h.feels_like),
      conditions: h.weather[0] ? capitalizeFirstLetter(h.weather[0].description) : 'N/A',
      precipitationProbability: Math.round(h.pop * 100),
      dateTime: hourlyDt, // Keep the full Date object, it will be in UTC, but when formatting, use timezone
    };
  });

  // Attempt to get a location name if not provided (e.g. for geolocation)
  // This adds an extra API call, could be optimized if name is already known
  let locationName = "";
  try {
    const geo = await reverseGeocode(coords);
    if (geo) {
        locationName = geo.name;
        // Could also update country/state from here if needed
    }
  } catch (e) {
    console.warn("Could not reverse geocode for bundle:", e);
  }


  return {
    current,
    daily,
    hourly,
    timezone,
    lat: data.lat, // OWM returns lat/lon which might be slightly different from input
    lng: data.lon,
    locationName: locationName || undefined,
  };
}
