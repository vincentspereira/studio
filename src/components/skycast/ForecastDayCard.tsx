import type { FC } from 'react';
import type { DailyForecast } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherIcon from './WeatherIcon';
import { format, addDays } from 'date-fns';

interface ForecastDayCardProps {
  forecast: DailyForecast;
  dayIndex: number; // 0 for today, 1 for tomorrow, etc.
}

const ForecastDayCard: FC<ForecastDayCardProps> = ({ forecast, dayIndex }) => {
  const date = addDays(new Date(), dayIndex);
  const dayName = dayIndex === 0 ? 'Today' : dayIndex === 1 ? 'Tomorrow' : format(date, 'EEE');
  const fullDate = format(date, 'MMM d');

  return (
    <Card className="flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
        <p className="text-xs text-muted-foreground">{fullDate}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between flex-grow p-4">
        <WeatherIcon condition={forecast.conditions} size={40} className="my-2 text-primary" />
        <div className="my-1">
          <p className="text-xl font-bold">
            {Math.round(forecast.highTemperatureFarenheit)}°
            <span className="text-sm font-normal text-muted-foreground">HI</span>
          </p>
          <p className="text-md text-muted-foreground">
            {Math.round(forecast.lowTemperatureFarenheit)}°
            <span className="text-xs font-normal">LO</span>
          </p>
        </div>
        <p className="text-sm text-card-foreground/80 mt-1 capitalize">{forecast.conditions}</p>
      </CardContent>
    </Card>
  );
};

export default ForecastDayCard;
