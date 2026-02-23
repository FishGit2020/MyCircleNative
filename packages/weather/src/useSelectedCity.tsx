import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface City {
  name: string;
  lat: number;
  lon: number;
}

interface SelectedCityContextValue {
  city: City;
  setCity: (city: City) => void;
}

const DEFAULT_CITY: City = {
  name: 'New York',
  lat: 40.7128,
  lon: -74.006,
};

const SelectedCityContext = createContext<SelectedCityContextValue | null>(null);

interface SelectedCityProviderProps {
  children: React.ReactNode;
  initialCity?: City;
}

export function SelectedCityProvider({ children, initialCity }: SelectedCityProviderProps) {
  const [city, setCityState] = useState<City>(initialCity ?? DEFAULT_CITY);

  const setCity = useCallback((newCity: City) => {
    setCityState(newCity);
  }, []);

  const value = useMemo(() => ({ city, setCity }), [city, setCity]);

  return (
    <SelectedCityContext.Provider value={value}>
      {children}
    </SelectedCityContext.Provider>
  );
}

export function useSelectedCity(): SelectedCityContextValue {
  const context = useContext(SelectedCityContext);
  if (!context) {
    // Fallback: return default city when used outside provider
    return {
      city: DEFAULT_CITY,
      setCity: () => {},
    };
  }
  return context;
}
