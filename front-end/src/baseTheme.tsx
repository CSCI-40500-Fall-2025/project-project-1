import { Box } from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";

const baseTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#342f92ff",
      paper: "#11063271",
    },
    text: {
      primary: "rgba(255, 255, 255, 0.87)",
    },
    primary: { main: "#80a6c9ff" },
    secondary: { main: "#b990c0ff" },
  },
  typography: {
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});

export const GradientBackground = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active", // filter out `active`
})<{ active: boolean }>(({ active }) => ({
  ...(active && {
    "&::before": {
      content: '""',
      display: "block",
      position: "absolute",
      zIndex: -1,
      inset: 0,
      background:
        "linear-gradient(45deg, #241C9C, #884bc6ff, #c08040ff, #40bac0ff)",
      backgroundSize: "600% 600%",
      animation: "GradientBackground 10s ease infinite",
    },
  }),
  "@keyframes GradientBackground": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
}));

export default baseTheme;
