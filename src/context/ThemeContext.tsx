'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme/theme';
import { montserrat } from '@/theme/fonts';

const ColorModeContext = createContext({
  mode: 'light' as 'light' | 'dark',
  toggleMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeContextProvider = ({
  children,
  forceSystem = true,
}: {
  children: React.ReactNode;
  forceSystem?: boolean;
}) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');

  useEffect(() => {
    if (forceSystem) {
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, [prefersDark, forceSystem]);

  const theme = useMemo(() => createTheme(mode === 'dark' ? darkTheme : lightTheme), [mode]);

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <html lang="fr" className={montserrat.className} data-theme={mode}>
        <body>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ColorModeContext.Provider>
  );
};
