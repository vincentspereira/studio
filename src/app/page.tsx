"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Location, CurrentWeather, DailyForecast, HourlyForecast, GeocodedLocation } from '@/services/weather';
import { fetchOpenWeatherDataBundle, geocodeCity, reverseGeocode } from '@/services/weather';
import LocationInput from '@/components/skycast/LocationInput';
import CurrentWeatherDisplay from '@/components/skycast/CurrentWeatherDisplay';
import ForecastDisplay from '@/components/skycast/ForecastDisplay';
import HourlyForecastDisplay from '@/components/skycast/HourlyForecastDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatInTimeZone } from 'date-fns-tz';


interface DisplayLocationData extends Location {
  name: string; 
  county?: string;
  country?: string;
  timezone: string; 
}

export default function SkyCastPage() {
  const [activeDisplayLocation, setActiveDisplayLocation] = useState<DisplayLocationData | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecasts, setDailyForecasts] = useState<DailyForecast[] | null>(null);
  const [rawHourlyForecasts, setRawHourlyForecasts] = useState<HourlyForecast[] | null>(null); // Store all 48h
  
  const [loading, setLoading] = useState(true); // Start true for initial load
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDayForecast, setSelectedDayForecast] = useState<DailyForecast | null>(null);
  const [selectedDateForHourly, setSelectedDateForHourly] = useState<Date | null>(null);
  const [displayableHourlyForecasts, setDisplayableHourlyForecasts] = useState<HourlyForecast[] | null>(null);
  const [loadingHourly, setLoadingHourly] = useState(false);
  const [errorHourly, setErrorHourly] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchWeatherData = useCallback(async (coords: Location, initialName: string, initialCounty?: string, initialCountry?: string) => {
    setLoading(true);
    setError(null);
    setCurrentWeather(null);
    setDailyForecasts(null);
    setRawHourlyForecasts(null);
    setDisplayableHourlyForecasts(null); 
    setSelectedDayForecast(null);
    setSelectedDateForHourly(null);
    // activeDisplayLocation will be set after data is fetched and timezone is known

    try {
      const bundle = await fetchOpenWeatherDataBundle(coords);
      
      const displayLocation: DisplayLocationData = {
        lat: bundle.lat,
        lng: bundle.lng,
        name: bundle.locationName || initialName,
        county: initialCounty, // Geocoding provides this, reverse geocoding could also. For now, use initial from geocoding.
        country: initialCountry, // Same as county.
        timezone: bundle.timezone,
      };
      setActiveDisplayLocation(displayLocation);

      setCurrentWeather(bundle.current);
      setDailyForecasts(bundle.daily);
      setRawHourlyForecasts(bundle.hourly);
      
      toast({
        title: "Weather Updated",
        description: `Displaying weather for ${displayLocation.name}.`,
      });
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch weather data: ${errorMessage}`);
      setActiveDisplayLocation(null); // Clear location if fetch fails
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch weather data. ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCitySubmit = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const geocodedResults = await geocodeCity(city);
      if (geocodedResults && geocodedResults.length > 0) {
        const GARS = geocodedResults[0] as GeocodedLocation; // Type assertion
        const coords = { lat: GARS.lat, lng: GARS.lng };
        fetchWeatherData(coords, GARS.name, GARS.state, GARS.country);
      } else {
        setError(`Could not find location data for "${city}".`);
        toast({
          variant: "destructive",
          title: "Location Not Found",
          description: `We could not find geocoding information for "${city}".`,
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown geocoding error occurred";
      setError(`Geocoding error: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Geocoding Error",
        description: errorMessage,
      });
      setLoading(false);
    }
  }, [fetchWeatherData, toast]);


  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        
        // Attempt to get city name from reverse geocoding for a better display name
        let initialName = "Current Location";
        let initialCounty: string | undefined;
        let initialCountry: string | undefined;
        try {
            const geoInfo = await reverseGeocode(coords);
            if (geoInfo) {
                initialName = geoInfo.name;
                initialCounty = geoInfo.state;
                initialCountry = geoInfo.country;
            }
        } catch (e) {
            console.warn("Reverse geocoding failed for current location, using default name.", e);
        }
        
        fetchWeatherData(coords, initialName, initialCounty, initialCountry);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: `Could not get your location: ${err.message}`,
        });
        setLoading(false);
      }
    );
  };

  const handleDayCardClick = useCallback((dayForecast: DailyForecast, dateClicked: Date) => {
    if (selectedDateForHourly && selectedDateForHourly.toDateString() === dateClicked.toDateString()) {
        // Clicking the same day card again closes the hourly view
        setSelectedDayForecast(null);
        setSelectedDateForHourly(null);
        setDisplayableHourlyForecasts(null);
        setErrorHourly(null);
        return;
    }

    setSelectedDayForecast(dayForecast);
    setSelectedDateForHourly(dateClicked);
    setDisplayableHourlyForecasts(null); 
    setLoadingHourly(true);
    setErrorHourly(null);

    if (!rawHourlyForecasts || !activeDisplayLocation) {
      setErrorHourly("Hourly forecast data or location timezone is not available.");
      setLoadingHourly(false);
      toast({ variant: "destructive", title: "Error", description: "Cannot display hourly forecast." });
      return;
    }

    try {
      const locationTimezone = activeDisplayLocation.timezone;
      const nowInLocationTimezone = new Date(formatInTimeZone(new Date(), locationTimezone, "yyyy-MM-dd HH:mm:ssXXX"));
      
      const currentHourInLocationTimezone = nowInLocationTimezone.getHours();
      const isTodayInLocationTimezone = nowInLocationTimezone.toDateString() === dateClicked.toDateString();

      const filteredHourly = rawHourlyForecasts.filter(hourly => {
        // Convert hourly.dateTime (UTC) to location's timezone for date comparison
        const forecastDateInLocationTz = new Date(formatInTimeZone(hourly.dateTime, locationTimezone, "yyyy-MM-dd HH:mm:ssXXX"));
        
        if (forecastDateInLocationTz.toDateString() !== dateClicked.toDateString()) {
          return false; // Not the selected day
        }

        if (isTodayInLocationTimezone) {
          const forecastHour = forecastDateInLocationTz.getHours();
          return forecastHour >= currentHourInLocationTimezone +1 ; // Show from next full hour onwards for today
        }
        return true; // For future days, show all hours
      });

      setDisplayableHourlyForecasts(filteredHourly);
    } catch (err) {
      console.error("Error processing hourly forecast:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setErrorHourly(`Failed to process hourly forecast: ${errorMessage}`);
      toast({ variant: "destructive", title: "Hourly Forecast Error", description: errorMessage });
    } finally {
      setLoadingHourly(false);
    }
  }, [rawHourlyForecasts, activeDisplayLocation, toast, selectedDateForHourly]);
  
  useEffect(() => {
    handleCitySubmit("London");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load for London


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8">
      <main className="container mx-auto max-w-4xl px-4">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary">
            SkyCast
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Your daily dose of weather, simplified.
          </p>
        </header>

        <LocationInput onCitySubmit={handleCitySubmit} onGeolocate={handleGeolocate} loading={loading} />

        {loading && (
          <div className="flex flex-col items-center justify-center my-10 p-6 bg-card/50 rounded-lg shadow-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-card-foreground">Fetching weather data...</p>
          </div>
        )}

        {error && !loading && (
           <Alert variant="destructive" className="my-8 shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && currentWeather && dailyForecasts && activeDisplayLocation && (
          <div className="space-y-10 animate-fadeIn">
            <CurrentWeatherDisplay weather={currentWeather} location={activeDisplayLocation} />
            <ForecastDisplay 
              forecasts={dailyForecasts} 
              onDayClick={handleDayCardClick}
              selectedDate={selectedDateForHourly}
            />
          </div>
        )}

        {loadingHourly && (
          <div className="flex flex-col items-center justify-center my-10 p-6 bg-card/50 rounded-lg shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-md text-card-foreground">Fetching hourly forecast...</p>
          </div>
        )}

        {errorHourly && !loadingHourly && (
           <Alert variant="destructive" className="my-8 shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Hourly Forecast Error</AlertTitle>
            <AlertDescription>{errorHourly}</AlertDescription>
          </Alert>
        )}
        
        {!loadingHourly && displayableHourlyForecasts && selectedDayForecast && selectedDateForHourly && (
          <div className="my-10 animate-fadeIn">
            <HourlyForecastDisplay 
              hourlyForecasts={displayableHourlyForecasts} 
              selectedDay={selectedDayForecast} 
              selectedDate={selectedDateForHourly}
              onClose={() => {
                setDisplayableHourlyForecasts(null);
                setSelectedDayForecast(null);
                setSelectedDateForHourly(null);
              }}
            />
          </div>
        )}

         <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </main>
       <footer className="text-center mt-12 py-6 border-t">
        <p className="text-sm text-muted-foreground">
          SkyCast &copy; {new Date().getFullYear()}. 
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Weather data provided by OpenWeatherMap.org.
        </p>
      </footer>
    </div>
  );
}
