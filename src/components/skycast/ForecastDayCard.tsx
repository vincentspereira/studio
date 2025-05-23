
import type { FC } from 'react';
import type { DailyForecast } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherIcon from './WeatherIcon';
import { format } from 'date-fns';
import { Droplets, Sunrise, Sunset } from 'lucide-react';

interface ForecastDayCardProps {
  forecast: DailyForecast;
  dayIndex: number; // Used for "Today", "Tomorrow" logic primarily
  onClick: (forecast: DailyForecast) => void; // Date is part of forecast or handled by parent
  isSelected: boolean;
}

const ForecastDayCard: FC<ForecastDayCardProps> = ({ forecast, dayIndex, onClick, isSelected }) => {
  const date = forecast.date; // Use the date from the forecast object
  
  let dayName: string;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    dayName = 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    dayName = 'Tomorrow';
  } else {
    dayName = format(date, 'EEE');
  }
  
  const fullDate = format(date, 'MMM d');

  return (
    <Card 
      className={`flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer ${isSelected ? 'ring-2 ring-primary shadow-xl scale-105' : 'hover:scale-105'}`}
      onClick={() => onClick(forecast)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(forecast)}}
      aria-pressed={isSelected}
      aria-label={`View hourly forecast for ${dayName}, ${fullDate}`}
    >
      <CardHeader className="pb-2 pt-4 w-full">
        <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
        <p className="text-xs text-muted-foreground">{fullDate}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between flex-grow p-4 pt-0 w-full">
        <WeatherIcon condition={forecast.conditions} size={40} className="my-2 text-primary" />
        <div className="my-1">
          <p className="text-xl font-bold">
            {Math.round(forecast.highTemperatureCelsius)}°
            <span className="text-sm font-normal text-muted-foreground">HI</span>
          </p>
          <p className="text-xl font-bold text-muted-foreground"> 
            {Math.round(forecast.lowTemperatureCelsius)}°
            <span className="text-sm font-normal">LO</span>
          </p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Droplets size={14} className="mr-1 text-primary" />
          <span>{forecast.precipitationProbability}%</span>
        </div>
        <p className="text-sm text-card-foreground/80 mt-1 capitalize truncate w-full px-1">{forecast.conditions}</p>
        
        <div className="text-xs text-muted-foreground mt-2 space-y-0.5 w-full">
          <div className="flex items-center justify-center">
            <Sunrise size={14} className="mr-1 text-amber-500" />
            <span>{forecast.sunrise}</span>
          </div>
          <div className="flex items-center justify-center">
            <Sunset size={14} className="mr-1 text-orange-600" />
            <span>{forecast.sunset}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastDayCard;
