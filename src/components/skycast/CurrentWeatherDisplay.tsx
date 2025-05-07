"use client";
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { CurrentWeather } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherIcon from './WeatherIcon';
import { Droplets, Wind as WindIcon, Umbrella, Clock } from 'lucide-react';

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
      // Update searched location's time
      try {
        const searchedTime = new Date().toLocaleTimeString('en-US', {
          timeZone: location.timezone,
          hour: '2-digit',
          minute: '2-digit',
        });
        setSearchedLocationTime(searchedTime);
      } catch (error) {
        console.warn(`Invalid timezone for searched location: ${location.timezone}. Defaulting to user's local time for searched location display.`);
        const fallbackTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setSearchedLocationTime(fallbackTime);
      }

      // Update London time
      try {
        const londonTimeString = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
        });
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
    <Card className="mb-8 shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold">
          {locationFullName}
        </CardTitle>
        <div className="text-md text-muted-foreground mt-1 space-y-0.5">
          <div className="flex items-center justify-center space-x-1">
            <Clock size={16} className="text-primary/80" />
            <span>London Time: {londonTime || 'Loading...'}</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Clock size={16} className="text-primary" />
            <span>{location.name} Time: {searchedLocationTime || 'Loading...'}</span>
            <span className="mx-1">&bull;</span>
            <span>{weather.conditions}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-2 p-6 pt-2">
        <div className="flex items-center space-x-4">
          <WeatherIcon condition={weather.conditions} size={80} className="text-primary drop-shadow-lg" />
          <div>
            <p className="text-7xl font-extrabold">{Math.round(weather.temperatureCelsius)}°C</p>
            <p className="text-lg text-muted-foreground text-right -mt-1">
              Feels like {Math.round(weather.feelsLikeCelsius)}°C
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md text-center pt-4">
          <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
            <Droplets size={24} className="text-primary mb-1" />
            <p className="font-semibold">{weather.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
            <WindIcon size={24} className="text-primary mb-1" />
            <p className="font-semibold">{weather.windSpeed} mph</p>
            <p className="text-xs text-muted-foreground">Wind</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
            <Umbrella size={24} className="text-primary mb-1" />
            <p className="font-semibold">{weather.precipitationProbability}%</p>
            <p className="text-xs text-muted-foreground">Precip. Chance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherDisplay;
