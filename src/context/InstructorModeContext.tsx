import React, { createContext, useContext, useState } from 'react';
import {
  computeSha256,
  INSTRUCTOR_CREDENTIAL_HASH,
  INSTRUCTOR_AUTH_STORAGE_KEY,
  INSTRUCTOR_AUTH_TOKEN
} from '../utils/cryptoAuth';

export interface VerifyResult {
  success: boolean;
  error?: 'length' | 'invalid';
}

export interface InstructorModeContextType {
  isInstructorMode: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  verifyAndActivate: (password: string) => Promise<VerifyResult>;
  deactivateInstructorMode: () => void;
  toggleInstructorMode: () => void;
  setInstructorMode: (enabled: boolean) => void;
}

const InstructorModeContext = createContext<InstructorModeContextType>({
  isInstructorMode: false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  verifyAndActivate: async () => ({ success: false }),
  deactivateInstructorMode: () => {},
  toggleInstructorMode: () => {},
  setInstructorMode: () => {}
});

export const InstructorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInstructorMode, setIsInstructorModeState] = useState<boolean>(() => {
    try {
      const storedToken =
        localStorage.getItem(INSTRUCTOR_AUTH_STORAGE_KEY) ||
        sessionStorage.getItem(INSTRUCTOR_AUTH_STORAGE_KEY);
      // Valid only if stored cryptographic token matches the expected hash token
      return storedToken === INSTRUCTOR_AUTH_TOKEN;
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const verifyAndActivate = async (password: string): Promise<VerifyResult> => {
    if (password.length !== 8) {
      return { success: false, error: 'length' };
    }

    const hash = await computeSha256(password);
    if (hash === INSTRUCTOR_CREDENTIAL_HASH) {
      try {
        localStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);
        sessionStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);
        localStorage.setItem('visual_tda_instructor_mode', 'true');
      } catch {
        // Storage fallback
      }
      setIsInstructorModeState(true);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: 'invalid' };
  };

  const deactivateInstructorMode = () => {
    try {
      localStorage.removeItem(INSTRUCTOR_AUTH_STORAGE_KEY);
      sessionStorage.removeItem(INSTRUCTOR_AUTH_STORAGE_KEY);
      localStorage.setItem('visual_tda_instructor_mode', 'false');
    } catch {
      // Storage fallback
    }
    setIsInstructorModeState(false);
  };

  const toggleInstructorMode = () => {
    if (isInstructorMode) {
      deactivateInstructorMode();
    } else {
      openAuthModal();
    }
  };

  const setInstructorMode = (enabled: boolean) => {
    if (enabled) {
      try {
        localStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);
        localStorage.setItem('visual_tda_instructor_mode', 'true');
      } catch {
        // ignore
      }
      setIsInstructorModeState(true);
    } else {
      deactivateInstructorMode();
    }
  };

  return (
    <InstructorModeContext.Provider
      value={{
        isInstructorMode,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        verifyAndActivate,
        deactivateInstructorMode,
        toggleInstructorMode,
        setInstructorMode
      }}
    >
      {children}
    </InstructorModeContext.Provider>
  );
};

export const useInstructorMode = () => useContext(InstructorModeContext);
