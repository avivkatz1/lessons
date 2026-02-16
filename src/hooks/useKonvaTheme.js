import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

export const useKonvaTheme = () => {
  const theme = useContext(ThemeContext);

  // Return flattened Konva colors for easy access in components
  return theme.colors.konva;
};
