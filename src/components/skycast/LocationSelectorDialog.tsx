
"use client";

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GeocodedLocation } from '@/services/weather';

interface LocationSelectorDialogProps {
  isOpen: boolean;
  locations: GeocodedLocation[];
  onSelect: (location: GeocodedLocation) => void;
  onClose: () => void;
  cityName: string;
}

const LocationSelectorDialog: FC<LocationSelectorDialogProps> = ({
  isOpen,
  locations,
  onSelect,
  onClose,
  cityName,
}) => {
  // The Dialog's open state is controlled by the isOpen prop.
  // onOpenChange is used to trigger the onClose callback when the dialog requests to be closed.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Multiple locations found for "{cityName}"</DialogTitle>
          <DialogDescription>
            Please select the correct location from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {locations.map((location, index) => (
            <Button
              key={`${location.lat}-${location.lng}-${index}`} // More unique key
              variant="outline"
              className="justify-start text-left h-auto py-2 px-3 shadow-sm hover:bg-accent/50"
              onClick={() => onSelect(location)}
              aria-label={`Select ${location.name}, ${[location.state, location.country].filter(Boolean).join(', ')}`}
            >
              <div>
                <p className="font-semibold text-sm">{location.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[location.state, location.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelectorDialog;
