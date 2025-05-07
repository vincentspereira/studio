import type { FC } from 'react';
import type { DailyForecast } from '@/services/weather';
import ForecastDayCard from './ForecastDayCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ForecastDisplayProps {
  forecasts: DailyForecast[];
}

const ForecastDisplay: FC<ForecastDisplayProps> = ({ forecasts }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">10-Day Forecast</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {forecasts.map((forecast, index) => (
            <div key={index} className="min-w-[150px] max-w-[180px] flex-shrink-0">
              <ForecastDayCard forecast={forecast} dayIndex={index} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ForecastDisplay;
