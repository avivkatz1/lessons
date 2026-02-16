import { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeContext } from 'styled-components';
import { toggleTheme as toggleThemeAction } from '../store/themeSlice';

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return {
    theme,
    isDark: mode === 'dark',
    mode,
    toggleTheme,
  };
};
