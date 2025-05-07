
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

export interface GeocodedLocationQuery {
  city: string;
  state?: string;
  country?: string;
}

// GeocodedLocation now uses `name` for the main display city name,
// and `city` can be the original input or matched city.
export interface GeocodedLocation extends Location {
  name: string; // Primary display name for the city (e.g., "New York", "London")
  city: string; // The matched city name, can be same as name or more specific
  state?: string;
  country?: string;
  timezone: string;
}


export interface OpenWeatherDataBundle {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  timezone: string;
  lat: number;
  lng: number;
  locationName?: string; // This is the primary name from geocoding/reverse geocoding
  county?: string;
  country?: string;
}

// Helper function to convert string to Title Case
function toTitleCase(str: string | undefined): string | undefined {
  if (!str) return undefined;
  return str.toLowerCase().split(' ').map(word => {
    if (word.length === 0) return '';
    // Handle cases like "US" or "UK" - keep them uppercase if they are short and all caps.
    if (word.length <= 2 && word === word.toUpperCase()) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}


// Mock data - ensuring Title Case for displayable names.
const MOCK_LOCATIONS: Record<string, GeocodedLocation> = {
  "new york": { name: "New York", city: "New York", lat: 40.7128, lng: -74.0060, country: "US", state: "NY", timezone: "America/New_York" },
  "tokyo": { name: "Tokyo", city: "Tokyo", lat: 35.6895, lng: 139.6917, country: "JP", state: "Tokyo", timezone: "Asia/Tokyo" },
  "paris": { name: "Paris", city: "Paris", lat: 48.8566, lng: 2.3522, country: "FR", state: "Île-de-France", timezone: "Europe/Paris" },
};

const MOCK_LOCATIONS_MULTI: Record<string, GeocodedLocation[]> = {
  "london": [
    { name: "London", city: "London", lat: 51.5074, lng: 0.1278, country: "GB", state: "England", timezone: "Europe/London" },
    { name: "London", city: "London", lat: 42.9849, lng: -81.2453, country: "CA", state: "ON", timezone: "America/Toronto" },
    { name: "London", city: "London", lat: 37.1280, lng: -84.0833, country: "US", state: "KY", timezone: "America/New_York" },
  ],
   "springfield": [
    { name: "Springfield", city: "Springfield", lat: 39.7817, lng: -89.6501, country: "US", state: "IL", timezone: "America/Chicago" },
    { name: "Springfield", city: "Springfield", lat: 37.2153, lng: -93.2982, country: "US", state: "MO", timezone: "America/Chicago" },
    { name: "Springfield", city: "Springfield", lat: 42.1015, lng: -72.5898, country: "US", state: "MA", timezone: "America/New_York" },
  ]
};


const DEFAULT_LOCATION_BASE: Omit<GeocodedLocation, 'city' | 'name' | 'lat' | 'lng'> = {
  country: undefined,
  state: undefined,
  timezone: "America/Los_Angeles"
};


const WEATHER_CONDITIONS = ["Clear Sky", "Few Clouds", "Scattered Clouds", "Broken Clouds", "Shower Rain", "Rain", "Thunderstorm", "Snow", "Mist"];

function getRandomCondition(): string {
  return WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
}

/**
 * Simulates geocoding information.
 * @param query The city name as a string, or a GeocodedLocationQuery object.
 * @returns A promise that resolves to an array of GeocodedLocation objects.
 */
export async function geocodeCity(query: string | GeocodedLocationQuery): Promise<GeocodedLocation[]> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate network delay

  const inputCityName = typeof query === 'string' ? query : query.city;
  const normalizedInputCityName = inputCityName.toLowerCase();

  // Helper to create a result with consistent casing from mock data
  const processMockResult = (loc: Omit<GeocodedLocation, 'name'> & {city: string}): GeocodedLocation => ({
    ...loc,
    name: toTitleCase(loc.city) || "Unknown", // name is for display
    city: loc.city, // city is the matched city name
    state: toTitleCase(loc.state),
    country: loc.country ? loc.country.toUpperCase() : undefined, // Countries often as 2-letter codes
  });


  if (typeof query === 'object') {
    // Handle structured query (city, state, country)
    const { city, state, country } = query;
    const lcCity = city.toLowerCase();
    const lcState = state?.toLowerCase();
    const lcCountry = country?.toLowerCase();

    let results: GeocodedLocation[] = [];

    const allPossibleLocations: GeocodedLocation[] = [];
    if (MOCK_LOCATIONS_MULTI[lcCity]) {
      allPossibleLocations.push(...MOCK_LOCATIONS_MULTI[lcCity]);
    }
    if (MOCK_LOCATIONS[lcCity]) {
      allPossibleLocations.push(MOCK_LOCATIONS[lcCity]);
    }
    
    // Filter based on provided state and country
    if (allPossibleLocations.length > 0) {
        results = allPossibleLocations.filter(loc => {
        const stateMatch = !lcState || loc.state?.toLowerCase() === lcState;
        const countryMatch = !lcCountry || loc.country?.toLowerCase() === lcCountry;
        return stateMatch && countryMatch;
      }).map(processMockResult);
    }
    
    // If no exact match with state/country, but we have the city, and only one entry for that city in mocks
    // (or if state/country were not provided)
    if (results.length === 0 && allPossibleLocations.length === 1 && !lcState && !lcCountry) {
        results = allPossibleLocations.map(processMockResult);
    }


    return results;
  }

  // Handle string query (original logic)
  if (MOCK_LOCATIONS_MULTI[normalizedInputCityName]) {
    return MOCK_LOCATIONS_MULTI[normalizedInputCityName].map(processMockResult);
  }

  const foundLocation = MOCK_LOCATIONS[normalizedInputCityName];
  if (foundLocation) {
    return [processMockResult(foundLocation)];
  }

  if (inputCityName.toLowerCase() === "unknown" || !inputCityName.trim()) {
    return []; // Simulate not found
  }

  // Generic fallback for string queries that don't match mocks
  return [{
    ...DEFAULT_LOCATION_BASE,
    name: toTitleCase(inputCityName) || "Unknown Location",
    city: toTitleCase(inputCityName) || "Unknown Location",
    lat: parseFloat((Math.random() * 180 - 90).toFixed(4)),
    lng: parseFloat((Math.random() * 360 - 180).toFixed(4)),
    // No state/country for purely random fallback
  }];
}

/**
 * Simulates reverse geocoding.
 * @param coords The latitude and longitude.
 * @returns A promise that resolves to a GeocodedLocation object or null.
 */
export async function reverseGeocode(coords: Location): Promise<GeocodedLocation | null> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

  // Helper to process mock result with casing
   const processMockResult = (loc: Omit<GeocodedLocation, 'name'> & {city: string}): GeocodedLocation => ({
    ...loc,
    name: toTitleCase(loc.city) || "Unknown",
    city: loc.city,
    state: toTitleCase(loc.state),
    country: loc.country ? loc.country.toUpperCase() : undefined,
  });

  for (const key in MOCK_LOCATIONS_MULTI) {
    for (const loc of MOCK_LOCATIONS_MULTI[key]) {
       if (Math.abs(loc.lat - coords.lat) < 0.1 && Math.abs(loc.lng - coords.lng) < 0.1) {
         return processMockResult(loc);
       }
    }
  }

  for (const key in MOCK_LOCATIONS) {
    const loc = MOCK_LOCATIONS[key];
    if (Math.abs(loc.lat - coords.lat) < 1 && Math.abs(loc.lng - coords.lng) < 1) {
      return processMockResult(loc);
    }
  }
  // Fallback for "Current Location"
  return {
    name: "Current Location",
    city: "Current Location",
    lat: coords.lat,
    lng: coords.lng,
    state: toTitleCase("Current State"),
    country: "Current Country".toUpperCase(), // Assuming 2-letter code or consistent casing
    timezone: "America/Los_Angeles"
  };
}

const NUM_DAYS_FORECAST = 10;

/**
 * Generates a sample weather data bundle.
 * @param coords The location (latitude and longitude) for which to generate weather data.
 * @returns A promise that resolves to an OpenWeatherDataBundle.
 */
export async function fetchOpenWeatherDataBundle(coords: Location): Promise<OpenWeatherDataBundle> {
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  const geoInfo = await reverseGeocode(coords);

  // locationName, county, country now come from reverseGeocode which applies casing.
  const locationName = geoInfo?.name; // This is the primary display name
  const county = geoInfo?.state;
  const country = geoInfo?.country;
  const timezone = geoInfo?.timezone || "America/Los_Angeles";

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
        const safeAmplitude = Math.max(1, dayAmplitude);
        const tempFluctuation = -Math.cos((hourInDay - 3) * (Math.PI / 12)) * safeAmplitude;
        finalHourlyTemp = Math.round(dayMeanTemp + tempFluctuation + (Math.random() * 2 - 1));
    } else {
        // Fallback if no daily forecast matches (should be rare with current logic)
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

