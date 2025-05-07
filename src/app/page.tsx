"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Location, CurrentWeather, DailyForecast, HourlyForecast, GeocodedLocation, GeocodedLocationQuery } from '@/services/weather';
import { fetchOpenWeatherDataBundle, geocodeCity } from '@/services/weather';
import LocationInput from '@/components/skycast/LocationInput';
import CurrentWeatherDisplay from '@/components/skycast/CurrentWeatherDisplay';
import ForecastDisplay from '@/components/skycast/ForecastDisplay';
import HourlyForecastDisplay from '@/components/skycast/HourlyForecastDisplay';
import LocationSelectorDialog from '@/components/skycast/LocationSelectorDialog';
import RefineLocationDialog from '@/components/skycast/RefineLocationDialog';
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
  const [rawHourlyForecasts, setRawHourlyForecasts] = useState<HourlyForecast[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDayForecast, setSelectedDayForecast] = useState<DailyForecast | null>(null);
  const [selectedDateForHourly, setSelectedDateForHourly] = useState<Date | null>(null);
  const [displayableHourlyForecasts, setDisplayableHourlyForecasts] = useState<HourlyForecast[] | null>(null);
  const [loadingHourly, setLoadingHourly] = useState(false);
  const [errorHourly, setErrorHourly] = useState<string | null>(null);

  const [locationOptions, setLocationOptions] = useState<GeocodedLocation[] | null>(null);
  const [cityForDialog, setCityForDialog] = useState("");

  const [refineDialogOpen, setRefineDialogOpen] = useState(false);
  const [cityToRefine, setCityToRefine] = useState<string | null>(null);
  const [fallbackLocationForRefine, setFallbackLocationForRefine] = useState<GeocodedLocation | null>(null);


  const { toast } = useToast();

  const clearWeatherData = () => {
    setActiveDisplayLocation(null);
    setCurrentWeather(null);
    setDailyForecasts(null);
    setRawHourlyForecasts(null);
    setDisplayableHourlyForecasts(null);
    setSelectedDayForecast(null);
    setSelectedDateForHourly(null);
    setError(null);
    setErrorHourly(null);
  };

  const fetchWeatherData = useCallback(async (coords: Location, name?: string, county?: string, country?: string) => {
    setLoading(true);
    setCurrentWeather(null);
    setDailyForecasts(null);
    setRawHourlyForecasts(null);
    setDisplayableHourlyForecasts(null);
    setSelectedDayForecast(null);
    setSelectedDateForHourly(null);
    setErrorHourly(null);

    try {
      const bundle = await fetchOpenWeatherDataBundle(coords);

      // Values passed as arguments (name, county, country) take precedence.
      // If not provided, fall back to values from the bundle (which come from reverse geocoding).
      // The geocodeCity and reverseGeocode services are expected to provide correctly cased names.
      const displayLocation: DisplayLocationData = {
        lat: bundle.lat,
        lng: bundle.lng,
        name: name || bundle.locationName || "Unknown Location",
        county: county || bundle.county,
        country: country || bundle.country,
        timezone: bundle.timezone,
      };
      setActiveDisplayLocation(displayLocation);

      setCurrentWeather(bundle.current);
      setDailyForecasts(bundle.daily);
      setRawHourlyForecasts(bundle.hourly);
      setError(null);

      toast({
        title: "Weather Updated",
        description: `Displaying weather for ${[displayLocation.name, displayLocation.county, displayLocation.country].filter(Boolean).join(', ')}.`,
      });
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch weather data: ${errorMessage}`);
      clearWeatherData();
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
    clearWeatherData(); 
    setCityForDialog(city); 

    try {
      const geocodedResults = await geocodeCity(city);
      if (geocodedResults && geocodedResults.length > 1) {
        setLocationOptions(geocodedResults);
        setLoading(false);
        toast({
          title: "Multiple Locations Found",
          description: `Please select the correct "${city}" from the list.`,
        });
      } else if (geocodedResults && geocodedResults.length === 1) {
        const singleResult = geocodedResults[0];
        // Check if result is incomplete (missing state or country, if city is not well-known)
        // For very common cities like "London" without state/country, reverse geocode might fill it in,
        // but for less common ones, it's good to prompt.
        const isAmbiguous = (!singleResult.state || !singleResult.country) && 
                            !["london", "paris", "tokyo", "new york"].includes(singleResult.city.toLowerCase());

        if (isAmbiguous) {
          setCityToRefine(city);
          setFallbackLocationForRefine(singleResult);
          setRefineDialogOpen(true);
          setLoading(false); 
          toast({
            title: "Location May Be Ambiguous",
            description: `Please provide more details for "${city}" or use the current information.`,
          });
        } else {
          setLocationOptions(null);
          fetchWeatherData({ lat: singleResult.lat, lng: singleResult.lng }, singleResult.name, singleResult.state, singleResult.country);
        }
      } else {
        setError(`Could not find location data for "${city}".`);
        toast({
          variant: "destructive",
          title: "Location Not Found",
          description: `We could not find geocoding information for "${city}".`,
        });
        setLocationOptions(null);
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
      setLocationOptions(null);
      setLoading(false);
    }
  }, [fetchWeatherData, toast]);

  const handleLocationSelection = (selectedLocation: GeocodedLocation) => {
    setLocationOptions(null);
    setLoading(true); 
    clearWeatherData(); 
    fetchWeatherData({ lat: selectedLocation.lat, lng: selectedLocation.lng }, selectedLocation.name, selectedLocation.state, selectedLocation.country);
  };

  const handleRefineLocationSubmit = async (details: GeocodedLocationQuery) => {
    setRefineDialogOpen(false);
    setLoading(true);
    clearWeatherData();

    try {
      const refinedResults = await geocodeCity(details); // geocodeCity should handle casing
      if (refinedResults && refinedResults.length === 1) {
        const refinedLoc = refinedResults[0];
        toast({
          title: "Location Refined",
          description: `Found details for ${[refinedLoc.name, refinedLoc.state, refinedLoc.country].filter(Boolean).join(', ')}. Fetching weather...`,
        });
        fetchWeatherData({ lat: refinedLoc.lat, lng: refinedLoc.lng }, refinedLoc.name, refinedLoc.state, refinedLoc.country);
      } else if (refinedResults && refinedResults.length > 1) {
        setCityForDialog(details.city); // Use the original city name for the dialog title
        setLocationOptions(refinedResults);
        setLoading(false);
        toast({
          title: "Multiple Locations Found",
          description: `Even with details, multiple locations match. Please select one.`,
        });
      } else {
        // GeocodeCity with refined details didn't find a specific match.
        // Use the user's entered textual details (city, state, country) with the fallback coordinates.
        toast({
          variant: "default", // Changed from destructive as we are attempting to use user's text
          title: "Using Provided Details",
          description: `Could not find an exact database match for the refined location. Displaying weather using your provided names and original coordinates.`,
        });
        if (fallbackLocationForRefine) {
          // Pass user's entered details (details.city, details.state, details.country)
          // These will be cased by geocodeCity if it generates them, or taken as-is from MOCK_DATA
          fetchWeatherData(
            { lat: fallbackLocationForRefine.lat, lng: fallbackLocationForRefine.lng },
            details.city, 
            details.state,
            details.country
          );
        } else {
           // This situation is less likely if refine dialog is only triggered when there's a fallback.
           setError(`Could not find location data for "${details.city}" and no fallback coordinates available.`);
           setLoading(false);
        }
      }
    } catch (err) {
        console.error("Refined geocoding error:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Refined geocoding error: ${errorMessage}`);
        toast({
          variant: "destructive",
          title: "Refined Geocoding Error",
          description: errorMessage,
        });
         // If error, fall back to the original ambiguous location if possible
         if (fallbackLocationForRefine) {
          fetchWeatherData({ lat: fallbackLocationForRefine.lat, lng: fallbackLocationForRefine.lng }, fallbackLocationForRefine.name, fallbackLocationForRefine.state, fallbackLocationForRefine.country);
        } else {
           setLoading(false);
        }
    } finally {
        setCityToRefine(null);
        setFallbackLocationForRefine(null);
    }
  };

  const handleSkipRefinement = () => {
    setRefineDialogOpen(false);
    if (fallbackLocationForRefine) {
      setLoading(true);
      clearWeatherData();
      toast({
        title: "Using General Information",
        description: `Fetching weather for ${fallbackLocationForRefine.name}.`,
      });
      fetchWeatherData({ lat: fallbackLocationForRefine.lat, lng: fallbackLocationForRefine.lng }, fallbackLocationForRefine.name, fallbackLocationForRefine.state, fallbackLocationForRefine.country);
    }
    setCityToRefine(null);
    setFallbackLocationForRefine(null);
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
    clearWeatherData(); 
    setLocationOptions(null); 

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        fetchWeatherData(coords, "Current Location");
      },
      (err) => {
        setLoading(false);
        setError(`Geolocation error: ${err.message}.`);

        let toastTitle = "Geolocation Error";
        let toastDescription = `Could not get your location: ${err.message}`;

        if (err.code === 1) { // User denied permission
           toastTitle = "Location Access Denied";
           toastDescription = "You've denied permission to access your location. Please enter a city manually or enable location services.";
        }

        toast({
          variant: err.code === 1 ? "default" : "destructive",
          title: toastTitle,
          description: toastDescription,
        });

        // If geolocation fails and no location is active, load a default
        if (!activeDisplayLocation) { 
          toast({
             title: "Loading Default Location",
             description: "Displaying weather for London, GB.",
          });
          handleCitySubmit("London"); 
        }
      }
    );
  };

  const handleDayCardClick = useCallback((dayForecast: DailyForecast, dateClicked: Date) => {
    if (selectedDateForHourly && selectedDateForHourly.toDateString() === dateClicked.toDateString()) {
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
        const forecastDateStrInLocationTz = formatInTimeZone(hourly.dateTime, locationTimezone, "yyyy-MM-dd");
        const clickedDateStrInLocationTz = formatInTimeZone(dateClicked, locationTimezone, "yyyy-MM-dd");

        if (forecastDateStrInLocationTz !== clickedDateStrInLocationTz) {
          return false;
        }

        if (isTodayInLocationTimezone) {
          const forecastHourInLocationTz = parseInt(formatInTimeZone(hourly.dateTime, locationTimezone, "HH"), 10);
          return forecastHourInLocationTz >= currentHourInLocationTimezone + 1 ;
        }
        return true;
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
    handleGeolocate(); 
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

        {locationOptions && locationOptions.length > 0 && (
          <LocationSelectorDialog
            isOpen={true}
            locations={locationOptions}
            onSelect={handleLocationSelection}
            onClose={() => setLocationOptions(null)}
            cityName={cityForDialog}
          />
        )}
        
        {cityToRefine && (
           <RefineLocationDialog
            isOpen={refineDialogOpen}
            cityName={cityToRefine}
            onSubmit={handleRefineLocationSubmit}
            onSkip={handleSkipRefinement}
            onClose={() => {
              setRefineDialogOpen(false);
              setCityToRefine(null);
              setFallbackLocationForRefine(null);
            }}
          />
        )}


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
          Weather data is sample data for demonstration purposes.
        </p>
      </footer>
    </div>
  );
}

