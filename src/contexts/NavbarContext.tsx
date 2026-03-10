import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  hideNavbar: boolean;
  setHideNavbar: (hide: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [hideCount, setHideCount] = useState(0);

  const setHideNavbar = (hide: boolean) => {
    setHideCount(prev => hide ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <NavbarContext.Provider value={{ hideNavbar: hideCount > 0, setHideNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

