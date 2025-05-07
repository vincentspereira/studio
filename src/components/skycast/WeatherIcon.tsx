import type { FC } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Sunrise, CloudIcon } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
  size?: number;
  noDefaultLabel?: boolean; // Added prop
}

const WeatherIcon: FC<WeatherIconProps> = ({ condition, className, size = 24, noDefaultLabel = false }) => {
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
  // Use a generic CloudIcon as a fallback instead of Sunrise if a more specific icon isn't found.
  // This makes more sense for general weather conditions.
  const defaultAriaLabel = noDefaultLabel ? undefined : (condition || "Weather condition");
  return <CloudIcon size={size} className={className} aria-label={defaultAriaLabel} />;
};

export default WeatherIcon;
