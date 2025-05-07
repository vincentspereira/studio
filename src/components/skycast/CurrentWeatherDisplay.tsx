
"use client";
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { CurrentWeather } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      try {
        const timeString = new Date().toLocaleTimeString('en-US', {
          timeZone: location.timezone,
          hour: '2-digit',
          minute: '2-digit',
        });
        setCurrentTime(timeString);
      } catch (error) {
        console.warn(`Invalid timezone: ${location.timezone}. Defaulting to local time.`);
        // Fallback to user's local time if timezone is invalid
         const timeString = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setCurrentTime(timeString);
      }
    };

    updateClock(); // Initial call
    const intervalId = setInterval(updateClock, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [location.timezone]);

  const locationFullName = [location.name, location.county, location.country].filter(Boolean).join(', ');

  return (
    <Card className="mb-8 shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold">
          {locationFullName}
        </CardTitle>
        <div className="flex items-center justify-center space-x-2 text-lg text-muted-foreground">
           {currentTime && <Clock size={18} className="text-primary" />}
           <span>{currentTime || 'Loading time...'}</span>
           <span>&bull;</span>
           <span>{weather.conditions}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-2 p-6">
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
