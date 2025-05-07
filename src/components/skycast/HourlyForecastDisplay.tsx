import type { FC } from 'react';
import type { HourlyForecast, DailyForecast } from '@/services/weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import WeatherIcon from './WeatherIcon';
import { Button } from '@/components/ui/button';
import { X, Thermometer, Droplets } from 'lucide-react';
import { format } from 'date-fns';

interface HourlyForecastDisplayProps {
  hourlyForecasts: HourlyForecast[];
  selectedDay: DailyForecast;
  selectedDate: Date;
  onClose: () => void;
}

const HourlyForecastDisplay: FC<HourlyForecastDisplayProps> = ({ hourlyForecasts, selectedDay, selectedDate, onClose }) => {
  return (
    <Card className="shadow-xl relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">
            Hourly Forecast - {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
          <CardDescription>
            Conditions: {selectedDay.conditions}, High: {Math.round(selectedDay.highTemperatureCelsius)}°C, Low: {Math.round(selectedDay.lowTemperatureCelsius)}°C
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close hourly forecast">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {hourlyForecasts.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 p-2">
              {hourlyForecasts.map((hour, index) => (
                <div key={index} className="flex-shrink-0 w-32 p-3 bg-background/50 rounded-lg text-center border">
                  <p className="font-semibold text-sm">{hour.time}</p>
                  <div className="my-2 flex justify-center">
                    <WeatherIcon condition={hour.conditions} size={32} className="text-primary" />
                  </div>
                  <div className="flex items-center justify-center text-lg font-bold">
                    <Thermometer size={16} className="mr-1 text-muted-foreground" />
                    {Math.round(hour.temperatureCelsius)}°C
                  </div>
                  <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
                    <Droplets size={12} className="mr-1" />
                    {hour.precipitationProbability}%
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-4">No hourly data available for this day.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HourlyForecastDisplay;