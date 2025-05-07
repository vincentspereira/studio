import type { FC } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Sunrise } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
  size?: number;
}

const WeatherIcon: FC<WeatherIconProps> = ({ condition, className, size = 24 }) => {
  const lowerCaseCondition = condition.toLowerCase();

  if (lowerCaseCondition.includes('sunny') || lowerCaseCondition.includes('clear')) {
    return <Sun size={size} className={className} aria-label="Sunny" />;
  }
  if (lowerCaseCondition.includes('partly cloudy')) {
    return <CloudSun size={size} className={className} aria-label="Partly cloudy" />;
  }
  if (lowerCaseCondition.includes('cloudy') || lowerCaseCondition.includes('overcast')) {
    return <Cloud size={size} className={className} aria-label="Cloudy" />;
  }
  if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
    return <CloudRain size={size} className={className} aria-label="Rainy" />;
  }
  if (lowerCaseCondition.includes('snow')) {
    return <CloudSnow size={size} className={className} aria-label="Snowy" />;
  }
  if (lowerCaseCondition.includes('thunderstorm')) {
    return <CloudLightning size={size} className={className} aria-label="Thunderstorm" />;
  }
  if (lowerCaseCondition.includes('wind')) {
    return <Wind size={size} className={className} aria-label="Windy" />;
  }
  // Default icon
  return <Sunrise size={size} className={className} aria-label={condition || "Weather condition"} />;
};

export default WeatherIcon;
