
/**
 * @fileOverview Weather service for generating sample weather data.
 * Temperatures are in Celsius. Wind speed in mph. Precipitation probability in %.
 */
'use client';

import { formatInTimeZone } from 'date-fns-tz';

// Interfaces for data structures
export interface Location {
  lat: number;
  lng: number;
}

export interface CurrentWeather {
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  conditions: string;
  humidity: number;
  windSpeed: number; // mph
  precipitationProbability: number; // 0-100%
  timezone: string; // IANA timezone string
}

export interface DailyForecast {
  date: Date;
  highTemperatureCelsius: number;
  lowTemperatureCelsius: number;
  conditions: string;
  precipitationProbability: number; // 0-100%
  sunrise: string; // "HH:mm"
  sunset: string; // "HH:mm"
}

export interface HourlyForecast {
  time: string; // "HH:00"
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  conditions: string;
  precipitationProbability: number; // 0-100%
  dateTime: Date; // Full Date object for this hour
}

export interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  country: string;
  state?: string; // e.g., state for US, admin area for others
  timezone: string; // Added IANA timezone string
}

export interface OpenWeatherDataBundle {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  timezone: string;
  lat: number;
  lng: number;
  locationName?: string;
  county?: string;
  country?: string;
}

// Helper function
function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Mock data
const MOCK_LOCATIONS: Record<string, GeocodedLocation> = {
  "london": { name: "London", lat: 51.5074, lng: 0.1278, country: "GB", state: "England", timezone: "Europe/London" },
  "new york": { name: "New York", lat: 40.7128, lng: -74.0060, country: "US", state: "NY", timezone: "America/New_York" },
  "tokyo": { name: "Tokyo", lat: 35.6895, lng: 139.6917, country: "JP", state: "Tokyo", timezone: "Asia/Tokyo" },
  "paris": { name: "Paris", lat: 48.8566, lng: 2.3522, country: "FR", state: "Île-de-France", timezone: "Europe/Paris" },
};

const DEFAULT_LOCATION: GeocodedLocation = { 
  name: "Sampleville", 
  lat: 34.0522, 
  lng: -118.2437, 
  country: "US", 
  state: "CA", 
  timezone: "America/Los_Angeles" 
};

const WEATHER_CONDITIONS = ["Clear Sky", "Few Clouds", "Scattered Clouds", "Broken Clouds", "Shower Rain", "Rain", "Thunderstorm", "Snow", "Mist"];

function getRandomCondition(): string {
  return WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
}

/**
 * Simulates geocoding information for a city name.
 * @param cityName The name of the city.
 * @returns A promise that resolves to an array of GeocodedLocation objects.
 */
export async function geocodeCity(cityName: string): Promise<GeocodedLocation[]> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate network delay
  const normalizedCityName = cityName.toLowerCase();
  const foundLocation = MOCK_LOCATIONS[normalizedCityName];
  
  if (foundLocation) {
    return [{ ...foundLocation }]; // Return a copy
  }
  if (cityName.toLowerCase() === "unknown" || !cityName.trim()) {
    return []; // Simulate not found
  }
  // For any other city, return a modified default to make it seem dynamic
  return [{ 
    ...DEFAULT_LOCATION, 
    name: capitalizeFirstLetter(cityName), 
    lat: parseFloat((Math.random() * 180 - 90).toFixed(4)), // Random lat/lng
    lng: parseFloat((Math.random() * 360 - 180).toFixed(4)),
    state: `State of ${capitalizeFirstLetter(cityName)}`, // Mock state
    timezone: DEFAULT_LOCATION.timezone // Use default timezone for unmapped cities
  }];
}

/**
 * Simulates reverse geocoding.
 * @param coords The latitude and longitude.
 * @returns A promise that resolves to a GeocodedLocation object or null.
 */
export async function reverseGeocode(coords: Location): Promise<GeocodedLocation | null> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate network delay
  
  // Try to find a "close" mock location (very simplified)
  for (const key in MOCK_LOCATIONS) {
    const loc = MOCK_LOCATIONS[key];
    if (Math.abs(loc.lat - coords.lat) < 5 && Math.abs(loc.lng - coords.lng) < 5) { // Increased tolerance for mock
      return { ...loc, name: `${loc.name}` }; // Return a copy
    }
  }
  // Default for current location if no mock is "close"
  return { 
    ...DEFAULT_LOCATION, 
    name: "My Current Location", 
    lat: coords.lat, 
    lng: coords.lng,
    state: "Current State" // Keeping state for consistency with GeocodedLocation
  };
}

const NUM_DAYS_FORECAST = 8; // Number of days for daily and hourly forecasts

/**
 * Generates a sample weather data bundle.
 * This function is called when weather data for specific coordinates is needed.
 * @param coords The location (latitude and longitude) for which to generate weather data.
 * @returns A promise that resolves to an OpenWeatherDataBundle.
 */
export async function fetchOpenWeatherDataBundle(coords: Location): Promise<OpenWeatherDataBundle> {
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500)); // Simulate network delay

  const geoInfo = await reverseGeocode(coords);

  const locationName = geoInfo?.name || DEFAULT_LOCATION.name;
  const county = geoInfo?.state; 
  const country = geoInfo?.country || DEFAULT_LOCATION.country;
  const timezone = geoInfo?.timezone || DEFAULT_LOCATION.timezone;
  
  const baseTemp = 5 + Math.random() * 20; 

  const current: CurrentWeather = {
    temperatureCelsius: Math.round(baseTemp + (Math.random() * 6 - 3)),
    feelsLikeCelsius: Math.round(baseTemp + (Math.random() * 8 - 4)),
    conditions: getRandomCondition(),
    humidity: Math.floor(30 + Math.random() * 60), 
    windSpeed: Math.floor(2 + Math.random() * 28), 
    precipitationProbability: Math.floor(Math.random() * 101),
    timezone: timezone,
  };

  const daily: DailyForecast[] = [];
  const today = new Date();
  for (let i = 0; i < NUM_DAYS_FORECAST; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dayBaseTemp = baseTemp + (Math.random() * 6 - 3); 
    
    let low = Math.round(dayBaseTemp - 2 - Math.random() * 5);
    let high = Math.round(dayBaseTemp + 2 + Math.random() * 5);
    if (low >= high) low = high - Math.floor(1 + Math.random() * 3);

    daily.push({
      date: new Date(forecastDate), 
      highTemperatureCelsius: high,
      lowTemperatureCelsius: low,
      conditions: getRandomCondition(),
      precipitationProbability: Math.floor(Math.random() * 101),
      sunrise: formatInTimeZone(new Date(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate(), 6, Math.floor(Math.random()*30)), timezone, 'HH:mm'),
      sunset: formatInTimeZone(new Date(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate(), 20, Math.floor(Math.random()*30)), timezone, 'HH:mm'),
    });
  }
  
  const hourly: HourlyForecast[] = [];
  const firstHourDate = new Date(); 
  firstHourDate.setMinutes(0,0,0); 

  const TOTAL_HOURS_FORECAST = NUM_DAYS_FORECAST * 24;

  for (let i = 0; i < TOTAL_HOURS_FORECAST; i++) { 
    const hourDateTime = new Date(firstHourDate);
    hourDateTime.setHours(firstHourDate.getHours() + i);
    
    const hourInDay = hourDateTime.getHours(); 

    let dayMatch: DailyForecast | undefined = undefined;
    for(const dayF of daily) {
        const dDate = dayF.date;
        if (hourDateTime.getFullYear() === dDate.getFullYear() &&
            hourDateTime.getMonth() === dDate.getMonth() &&
            hourDateTime.getDate() === dDate.getDate()) {
            dayMatch = dayF;
            break;
        }
    }

    let finalHourlyTemp: number;
    if (dayMatch) {
        const dayMeanTemp = (dayMatch.highTemperatureCelsius + dayMatch.lowTemperatureCelsius) / 2;
        const dayAmplitude = (dayMatch.highTemperatureCelsius - dayMatch.lowTemperatureCelsius) / 2;
        const safeAmplitude = Math.max(1, dayAmplitude); // Ensure some variation even if high=low
        // Sinusoidal fluctuation: min around 3 AM, max around 3 PM (15:00)
        const tempFluctuation = -Math.cos((hourInDay - 3) * (Math.PI / 12)) * safeAmplitude;
        finalHourlyTemp = Math.round(dayMeanTemp + tempFluctuation + (Math.random() * 2 - 1)); // Add small noise
    } else {
        // Fallback: if no matching day forecast (e.g. if hourly extends beyond daily, though configured not to)
        const tempFluctuationGlobal = Math.sin((hourInDay - 9) * (Math.PI / 12)) * 5;
        finalHourlyTemp = Math.round(baseTemp + tempFluctuationGlobal + (Math.random() * 2 - 1));
    }

    hourly.push({
      time: formatInTimeZone(hourDateTime, timezone, 'HH:00'), 
      temperatureCelsius: finalHourlyTemp,
      feelsLikeCelsius: Math.round(finalHourlyTemp - (Math.random() * 4 - 1)), 
      conditions: getRandomCondition(), 
      precipitationProbability: Math.floor(Math.random() * 71), 
      dateTime: new Date(hourDateTime), 
    });
  }

  return {
    current,
    daily,
    hourly,
    timezone,
    lat: coords.lat,
    lng: coords.lng,
    locationName: locationName,
    county: county, 
    country: country, 
  };
}
