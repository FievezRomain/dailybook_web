import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customGraph: {
      fill: string;
    };
  }
  interface PaletteOptions {
    customGraph?: {
      fill: string;
    };
  }
}
