import { createTheme } from '@mui/material/styles';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h7: true;
    p: true;
  }
}

export const muiColorTheme = createTheme({
  typography: {
    fontFamily: 'Manrope, sans-serif',
  },
  palette: {
    primary: {
      main: '#101010',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});
