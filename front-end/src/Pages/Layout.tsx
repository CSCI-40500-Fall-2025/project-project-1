// import React from "react";
import Navbar from "../components/Navbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Box } from "@mui/material";
import { GradientBackground } from "../baseTheme";
import WelcomePage from "./WelcomePage";

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const useGradientBackground =
    location.pathname === "/" || location.pathname === "/login"; // or "/welcome"
  const isRootPath = location.pathname === "/";
  const loggedIn = user !== null;
  let content;

  if (isRootPath) {
    content = user ? <Navigate to="/home" replace /> : <WelcomePage />;
  } else {
    // All other routes
    content = <Outlet />;
  }

  if (loggedIn && useGradientBackground) {
    return <Navigate to="/home" replace />;
  }
  return (
    <GradientBackground active={useGradientBackground}>
      <Box
        sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
      >
        <Navbar loggedIn={loggedIn} logOut={logout} />
        <Box
          component="main"
          sx={{
            padding: 9,
          }}
        >
          {content}
        </Box>
      </Box>
    </GradientBackground>
  );
};

export default Layout;
