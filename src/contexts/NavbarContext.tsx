import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  hideNavbar: boolean;
  setHideNavbar: (hide: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <NavbarContext.Provider value={{ hideNavbar, setHideNavbar }}>
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

