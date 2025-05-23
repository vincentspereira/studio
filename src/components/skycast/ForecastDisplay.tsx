import type { FC } from 'react';
import type { DailyForecast } from '@/services/weather';
import ForecastDayCard from './ForecastDayCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ForecastDisplayProps {
  forecasts: DailyForecast[];
  onDayClick: (forecast: DailyForecast, date: Date) => void;
  selectedDate: Date | null;
}

const ForecastDisplay: FC<ForecastDisplayProps> = ({ forecasts, onDayClick, selectedDate }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Daily Forecast</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {forecasts.map((forecast, index) => {
            // The `forecast.date` object itself should be used for comparison and passing
            const cardDate = forecast.date; 
            const isSelected = selectedDate?.toDateString() === cardDate.toDateString();

            return (
              <div key={index} className="min-w-[150px] max-w-[180px] flex-shrink-0">
                <ForecastDayCard 
                  forecast={forecast} 
                  dayIndex={index} // dayIndex is still useful for "Today", "Tomorrow" labels
                  onClick={(fc) => onDayClick(fc, cardDate)} // Pass the actual date object
                  isSelected={isSelected}
                />
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ForecastDisplay;
