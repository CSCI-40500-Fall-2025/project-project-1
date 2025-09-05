import { createTheme } from "@mui/material/styles";

const baseTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#242424",
      paper: "#333333",
    },
    text: {
      primary: "rgba(255, 255, 255, 0.87)",
    },
    primary: { main: "#6e8ba7ff" },
    secondary: { main: "#9c27b0" },
  },
  typography: {
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});

export default baseTheme;
