'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { DEFAULT_UNIT, UNITS_LC_KEY } from '../constants';
import { Unit } from '../types';

type UnitContextValue = {
  currentUnit: Unit;
  setUnit: (unit: Unit) => void;
};

const UnitContext = createContext<UnitContextValue | undefined>(undefined);

export function UnitProvider({ children }: PropsWithChildren) {
  const [currentUnit, setCurrentUnit] = useState<Unit>(DEFAULT_UNIT);

  function setUnit(unit: Unit) {
    localStorage.setItem(UNITS_LC_KEY, unit);
    setCurrentUnit(unit);
  }

  useEffect(() => {
    const storedUnit = localStorage.getItem(UNITS_LC_KEY);

    if (storedUnit === 'metric' || storedUnit === 'imperial') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUnit(storedUnit);
    }
  }, []);

  return (
    <UnitContext.Provider value={{ currentUnit, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);

  if (!context) {
    throw new Error('useUnit must be within a UnitProvider');
  }

  return context;
}
