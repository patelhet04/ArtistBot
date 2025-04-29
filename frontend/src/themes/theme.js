import { createTheme } from "@mui/material/styles";

// Define color palette
const PRIMARY = {
  main: "#1976d2",
  light: "#42a5f5",
  dark: "#1565c0",
  contrastText: "#fff",
};

const SECONDARY = {
  main: "#9c27b0",
  light: "#ba68c8",
  dark: "#7b1fa2",
  contrastText: "#fff",
};

const SUCCESS = {
  main: "#2e7d32",
};

const WARNING = {
  main: "#ed6c02",
};

const ERROR = {
  main: "#d32f2f",
};

const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
};

// Create theme
const theme = createTheme({
  palette: {
    primary: PRIMARY,
    secondary: SECONDARY,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    grey: GREY,
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
    action: {
      active: GREY[600],
      hover: "rgba(67, 97, 238, 0.08)",
      selected: "rgba(67, 97, 238, 0.16)",
      disabled: GREY[500],
      disabledBackground: GREY[200],
      focus: "rgba(67, 97, 238, 0.24)",
    },
    divider: GREY[300],
    info: {
      main: "#0288d1",
    },
  },
  typography: {
    fontFamily: [
      "Poppins",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 600,
      fontSize: "0.875rem",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 3px 8px rgba(0, 0, 0, 0.08)",
    "0px 4px 12px rgba(0, 0, 0, 0.1)",
    "0px 6px 16px rgba(0, 0, 0, 0.12)",
    "0px 8px 24px rgba(0, 0, 0, 0.14)",
    "0px 12px 32px rgba(0, 0, 0, 0.16)",
    "0px 16px 40px rgba(0, 0, 0, 0.18)",
    "0px 20px 48px rgba(0, 0, 0, 0.2)",
    "0px 24px 56px rgba(0, 0, 0, 0.22)",
    "0px 28px 64px rgba(0, 0, 0, 0.24)",
    "0px 32px 72px rgba(0, 0, 0, 0.26)",
    ...Array(12).fill("none"),
  ],
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.23)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0, 0, 0, 0.87)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.1)",
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
        },
      },
    },
  },
});

export default theme;
