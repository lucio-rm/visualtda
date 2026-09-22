import React, { createContext, useContext, useState, useEffect } from 'react';

interface InstructorModeContextType {
  isInstructorMode: boolean;
  toggleInstructorMode: () => void;
  setInstructorMode: (enabled: boolean) => void;
}

const InstructorModeContext = createContext<InstructorModeContextType>({
  isInstructorMode: false,
  toggleInstructorMode: () => {},
  setInstructorMode: () => {}
});

export const InstructorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInstructorMode, setIsInstructorModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('visual_tda_instructor_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('visual_tda_instructor_mode', isInstructorMode ? 'true' : 'false');
    } catch {
      // Ignore local storage errors
    }
  }, [isInstructorMode]);

  const toggleInstructorMode = () => setIsInstructorModeState((prev) => !prev);
  const setInstructorMode = (enabled: boolean) => setIsInstructorModeState(enabled);

  return (
    <InstructorModeContext.Provider
      value={{
        isInstructorMode,
        toggleInstructorMode,
        setInstructorMode
      }}
    >
      {children}
    </InstructorModeContext.Provider>
  );
};

export const useInstructorMode = () => useContext(InstructorModeContext);
