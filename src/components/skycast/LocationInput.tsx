"use client";

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed } from 'lucide-react';

interface LocationInputProps {
  onCitySubmit: (city: string) => void;
  onGeolocate: () => void;
  loading: boolean;
}

const LocationInput: FC<LocationInputProps> = ({ onCitySubmit, onGeolocate, loading }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onCitySubmit(city.trim());
    }
  };

  return (
    <div className="mb-8 p-6 bg-card/50 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g., London, New York)"
            className="pl-10 text-base"
            disabled={loading}
            aria-label="City Name"
          />
        </div>
        <Button type="submit" disabled={loading || !city.trim()} className="w-full sm:w-auto">
          {loading ? 'Loading...' : 'Get Weather'}
        </Button>
      </form>
      <Button variant="outline" onClick={onGeolocate} disabled={loading} className="w-full flex items-center justify-center gap-2">
        <LocateFixed size={18} /> Use My Current Location
      </Button>
    </div>
  );
};

export default LocationInput;
