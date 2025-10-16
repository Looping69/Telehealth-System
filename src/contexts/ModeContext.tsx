/**
 * Mode Context for switching between Mock Data and Live FHIR modes
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'mock' | 'fhir';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('mock');

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'mock' ? 'fhir' : 'mock');
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};