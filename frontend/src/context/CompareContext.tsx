import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { VehicleGroup } from '@/utils/parseVehicles';
import { toast } from 'sonner';

interface CompareContextType {
  compareList: VehicleGroup[];
  addToCompare: (vehicle: VehicleGroup) => void;
  removeFromCompare: (vehicleId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<VehicleGroup[]>([]);

  const addToCompare = (vehicle: VehicleGroup) => {
    if (compareList.find((v) => v.id === vehicle.id)) {
      toast.error('Vehicle already added to compare');
      return;
    }
    if (compareList.length >= 4) {
      toast.error('You can only compare up to 4 vehicles at a time');
      return;
    }
    setCompareList([...compareList, vehicle]);
    toast.success(`${vehicle.brand} ${vehicle.model} added to compare`);
  };

  const removeFromCompare = (vehicleId: string) => {
    setCompareList(compareList.filter((v) => v.id !== vehicleId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
