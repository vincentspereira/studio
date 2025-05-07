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
      <h2 className="text-2xl font-bold mb-4 text-center">10-Day Forecast</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {forecasts.map((forecast, index) => {
            // Calculate date for comparison - needed to determine if current card is selected
            const cardDate = new Date();
            cardDate.setDate(cardDate.getDate() + index);
            const isSelected = selectedDate?.toDateString() === cardDate.toDateString();

            return (
              <div key={index} className="min-w-[150px] max-w-[180px] flex-shrink-0">
                <ForecastDayCard 
                  forecast={forecast} 
                  dayIndex={index} 
                  onClick={onDayClick}
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