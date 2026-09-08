import { createContext, useContext, useState, type ReactNode } from 'react';

const DEFAULT_STATION = 'KC1GHSN557';

type StationContextType = {
  stationId: string;
  setStationId: (id: string) => void;
};

const StationContext = createContext<StationContextType | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const [stationId, setStationId] = useState(DEFAULT_STATION);
  return (
    <StationContext.Provider value={{ stationId, setStationId }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (!context) throw new Error('useStation must be used within a StationProvider');
  return context;
}