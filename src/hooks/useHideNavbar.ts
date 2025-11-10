import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNavbar } from '../contexts/NavbarContext';

/**
 * Hook para ocultar/mostrar el navbar desde cualquier pantalla
 * @param hide - Si es true, oculta el navbar cuando la pantalla está enfocada
 */
export const useHideNavbar = (hide: boolean = true) => {
  const { setHideNavbar } = useNavbar();

  useFocusEffect(
    useCallback(() => {
      if (hide) {
        setHideNavbar(true);
      }
      return () => {
        setHideNavbar(false);
      };
    }, [hide, setHideNavbar])
  );
};

