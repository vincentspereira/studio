"use client";
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { CurrentWeather } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherIcon from './WeatherIcon';
import { Droplets, Wind as WindIcon, Umbrella, Clock, CloudIcon } from 'lucide-react'; // Added CloudIcon for fallback
import { formatInTimeZone } from 'date-fns-tz';


interface DisplayLocationData {
  name: string; // City name or "Current Location"
  county?: string;
  country?: string;
  timezone: string; 
  lat: number;
  lng: number;
}

interface CurrentWeatherDisplayProps {
  weather: CurrentWeather;
  location: DisplayLocationData;
}

const CurrentWeatherDisplay: FC<CurrentWeatherDisplayProps> = ({ weather, location }) => {
  const [searchedLocationTime, setSearchedLocationTime] = useState<string | null>(null);
  const [londonTime, setLondonTime] = useState<string | null>(null);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // Update searched location's time
      try {
        // Use formatInTimeZone for consistency and robustness
        const searchedTime = formatInTimeZone(now, location.timezone, 'HH:mm');
        setSearchedLocationTime(searchedTime);
      } catch (error) {
        console.warn(`Invalid timezone for searched location: ${location.timezone}. Defaulting to user's local time for searched location display.`);
        // Fallback using local time formatting if timezone is problematic
        const fallbackTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Use 24-hour format for consistency
        });
        setSearchedLocationTime(fallbackTime);
      }

      // Update London time
      try {
        const londonTimeString = formatInTimeZone(now, 'Europe/London', 'HH:mm');
        setLondonTime(londonTimeString);
      } catch (error) {
        console.error(`Error setting London time: ${error}. This should not happen with a valid hardcoded timezone.`);
        setLondonTime('N/A'); // Fallback for London time
      }
    };

    updateClocks(); // Initial call
    const intervalId = setInterval(updateClocks, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [location.timezone]); // Re-run if the location's timezone changes

  const locationFullName = [location.name, location.county, location.country].filter(Boolean).join(', ');

  return (
    <Card className="mb-8 shadow-xl transform hover:scale-[1.01] transition-transform duration-300 overflow-hidden">
      <CardHeader className="text-center pb-3 pt-5 bg-gradient-to-br from-card/80 to-card/60">
        <CardTitle className="text-3xl font-bold text-primary-foreground drop-shadow-sm">
          {locationFullName}
        </CardTitle>
        <div className="text-sm text-primary-foreground/90 mt-2 space-y-1">
          <div className="flex items-center justify-center space-x-1.5">
            <Clock size={15} className="opacity-90" />
            <span>{location.name} Time: {searchedLocationTime || 'Loading...'}</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <Clock size={15} className="opacity-70" />
            <span>London Time: {londonTime || 'Loading...'}</span>
          </div>
           <div className="flex items-center justify-center space-x-1.5 pt-1">
            <WeatherIcon condition={weather.conditions} size={16} className="opacity-90" noDefaultLabel />
            <span className="capitalize">{weather.conditions}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <div className="flex items-center space-x-6">
          <WeatherIcon condition={weather.conditions} size={80} className="text-primary drop-shadow-lg" />
          <div>
            <p className="text-7xl font-extrabold tracking-tight">{Math.round(weather.temperatureCelsius)}°C</p>
            <p className="text-lg text-muted-foreground text-right -mt-1">
              Feels like {Math.round(weather.feelsLikeCelsius)}°C
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md text-center pt-3">
          <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg shadow">
            <Droplets size={22} className="text-primary mb-1.5" />
            <p className="font-semibold text-md">{weather.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg shadow">
            <WindIcon size={22} className="text-primary mb-1.5" />
            <p className="font-semibold text-md">{weather.windSpeed} mph</p>
            <p className="text-xs text-muted-foreground">Wind</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg shadow">
            <Umbrella size={22} className="text-primary mb-1.5" />
            <p className="font-semibold text-md">{weather.precipitationProbability}%</p>
            <p className="text-xs text-muted-foreground">Precip. Chance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherDisplay;
