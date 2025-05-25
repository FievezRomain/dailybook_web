import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ce9871',
    },
    secondary: {
        main: '#F4EDEB',
    },
    text: {
        primary: '#1E1E1E',
    },
    background: {
      default: '#ffffff',
      paper: '#f4f4f4',
    },
    success: {
        main: '#ce9871',
    },
    info: {
        main: '#baa89b',
    },
    warning: {
        main: '#f6e6ce',
    },
    error: {
        main: '#b07165',
    },
    customGraph: {
      fill: '#DDEEFF',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ce9871',
    },
    secondary: {
        main: '#F4EDEB',
    },
    text: {
        primary: '#ffffff',
    },
    background: {
      default: '#1E1E1E',
      paper: '#333333',
    },
    success: {
        main: '#ce9871',
    },
    error: {
        main: '#b07165',
    },
    info: {
        main: '#baa89b',
    },
    warning: {
        main: '#f6e6ce',
    },
    customGraph: {
      fill: '#223344',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});
