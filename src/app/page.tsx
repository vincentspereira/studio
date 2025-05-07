"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Location, CurrentWeather, DailyForecast, HourlyForecast } from '@/services/weather';
import { getCurrentWeather, get10DayForecast, getHourlyForecast } from '@/services/weather';
import LocationInput from '@/components/skycast/LocationInput';
import CurrentWeatherDisplay from '@/components/skycast/CurrentWeatherDisplay';
import ForecastDisplay from '@/components/skycast/ForecastDisplay';
import HourlyForecastDisplay from '@/components/skycast/HourlyForecastDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_GEOCODING: Record<string, Location> = {
  "london": { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.0060 },
  "tokyo": { lat: 35.6895, lng: 139.6917 },
  "paris": { lat: 48.8566, lng: 2.3522 },
  "berlin": { lat: 52.5200, lng: 13.4050 },
};

export default function SkyCastPage() {
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDayForecast, setSelectedDayForecast] = useState<DailyForecast | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hourlyForecasts, setHourlyForecasts] = useState<HourlyForecast[] | null>(null);
  const [loadingHourly, setLoadingHourly] = useState(false);
  const [errorHourly, setErrorHourly] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchWeatherData = useCallback(async (location: Location, name?: string) => {
    setLoading(true);
    setError(null);
    setCurrentWeather(null);
    setForecast(null);
    setHourlyForecasts(null); // Reset hourly forecast when new main weather data is fetched
    setSelectedDayForecast(null);
    setSelectedDate(null);
    setActiveLocation(location);

    try {
      const [current, dailyForecast] = await Promise.all([
        getCurrentWeather(location),
        get10DayForecast(location),
      ]);
      setCurrentWeather(current);
      setForecast(dailyForecast);
      setLocationName(name || 'Current Location');
      toast({
        title: "Weather Updated",
        description: `Displaying weather for ${name || 'your current location'}.`,
      });
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch weather data: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch weather data. ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCitySubmit = (city: string) => {
    const locationKey = city.toLowerCase();
    const location = MOCK_GEOCODING[locationKey];
    if (location) {
      fetchWeatherData(location, city.charAt(0).toUpperCase() + city.slice(1));
    } else {
      setError(`Could not find coordinates for "${city}". Please try a known city (e.g., London, New York) or use geolocation.`);
      toast({
        variant: "destructive",
        title: "Location Not Found",
        description: `We don't have coordinates for "${city}" in our demo. Try "London" or use geolocation.`,
      });
    }
  };

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
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData({ lat: latitude, lng: longitude });
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

  const handleDayCardClick = useCallback(async (dayForecast: DailyForecast, date: Date) => {
    // If the same day is clicked again, hide the hourly forecast
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
        setSelectedDayForecast(null);
        setSelectedDate(null);
        setHourlyForecasts(null);
        setErrorHourly(null);
        return;
    }

    setSelectedDayForecast(dayForecast);
    setSelectedDate(date);
    setHourlyForecasts(null); // Clear previous hourly data
    setLoadingHourly(true);
    setErrorHourly(null);

    if (!activeLocation) {
      setErrorHourly("Location data is not available to fetch hourly forecast.");
      setLoadingHourly(false);
      toast({ variant: "destructive", title: "Error", description: "Location data missing for hourly forecast." });
      return;
    }

    try {
      const hourly = await getHourlyForecast(date, activeLocation);
      setHourlyForecasts(hourly);
    } catch (err) {
      console.error("Failed to fetch hourly forecast:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setErrorHourly(`Failed to fetch hourly forecast: ${errorMessage}`);
      toast({ variant: "destructive", title: "Hourly Forecast Error", description: errorMessage });
    } finally {
      setLoadingHourly(false);
    }
  }, [activeLocation, toast, selectedDate]);
  
  useEffect(() => {
    handleCitySubmit("London");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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

        {!loading && currentWeather && forecast && (
          <div className="space-y-10 animate-fadeIn">
            <CurrentWeatherDisplay weather={currentWeather} cityName={locationName} />
            <ForecastDisplay 
              forecasts={forecast} 
              onDayClick={handleDayCardClick}
              selectedDate={selectedDate}
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
        
        {!loadingHourly && hourlyForecasts && selectedDayForecast && selectedDate && (
          <div className="my-10 animate-fadeIn">
            <HourlyForecastDisplay 
              hourlyForecasts={hourlyForecasts} 
              selectedDay={selectedDayForecast} 
              selectedDate={selectedDate}
              onClose={() => {
                setHourlyForecasts(null);
                setSelectedDayForecast(null);
                setSelectedDate(null);
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
          SkyCast &copy; {new Date().getFullYear()}. Weather data is for demonstration purposes.
        </p>
      </footer>
    </div>
  );
}