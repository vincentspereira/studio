import type { FC } from 'react';
import type { CurrentWeather } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import WeatherIcon from './WeatherIcon';
import { Droplets, Wind as WindIcon, Umbrella } from 'lucide-react';

interface CurrentWeatherDisplayProps {
  weather: CurrentWeather;
  cityName?: string;
}

const CurrentWeatherDisplay: FC<CurrentWeatherDisplayProps> = ({ weather, cityName }) => {
  return (
    <Card className="mb-8 shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold">
          {cityName || 'Current Location'}
        </CardTitle>
        <CardDescription className="text-lg">{weather.conditions}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <WeatherIcon condition={weather.conditions} size={80} className="text-primary drop-shadow-lg" />
          <p className="text-7xl font-extrabold">{Math.round(weather.temperatureFarenheit)}°F</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md text-center">
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
            <p className="font-semibold">{weather.precipitation}"</p>
            <p className="text-xs text-muted-foreground">Precipitation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherDisplay;
