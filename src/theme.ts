import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      100: "#f7fafc",
      // Add your color scheme here
    }
  },
  styles: {
    global: {
      body: {
        bg: '#0f0a19',
        color: 'white',
      },
    },
  },
});

export default theme;