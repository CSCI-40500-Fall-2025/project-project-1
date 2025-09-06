import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import baseTheme from "./baseTheme";
import CssBaseline from "@mui/material/CssBaseline";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
