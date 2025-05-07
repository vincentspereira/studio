
"use client";

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeocodedLocationQuery } from '@/services/weather';

interface RefineLocationDialogProps {
  isOpen: boolean;
  cityName: string;
  onSubmit: (details: GeocodedLocationQuery) => void;
  onSkip: () => void;
  onClose: () => void;
}

const RefineLocationDialog: FC<RefineLocationDialogProps> = ({
  isOpen,
  cityName,
  onSubmit,
  onSkip,
  onClose,
}) => {
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ city: cityName, state: state.trim() || undefined, country: country.trim() || undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refine Location for "{cityName}"</DialogTitle>
          <DialogDescription>
            The location "{cityName}" might be ambiguous or missing some details. 
            Please provide the state/county and country if known, or skip to use the general information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city-name-refine" className="text-right col-span-1">
              City
            </Label>
            <Input
              id="city-name-refine"
              value={cityName}
              disabled
              className="col-span-3 bg-muted/50"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state-refine" className="text-right col-span-1">
              State/County
            </Label>
            <Input
              id="state-refine"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., California, Ontario (Optional)"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country-refine" className="text-right col-span-1">
              Country
            </Label>
            <Input
              id="country-refine"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., US, Canada (Optional)"
              className="col-span-3"
            />
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip & Use General
            </Button>
            <Button type="submit">Submit & Refine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefineLocationDialog;
