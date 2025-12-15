// import React from "react";
import Navbar from "../components/Navbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Box } from "@mui/material";
import { GradientBackground } from "../baseTheme";
import WelcomePage from "./WelcomePage";

const Layout = () => {
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  const useGradientBackground =
    location.pathname === "/" || location.pathname === "/login"; // or "/welcome"
  const isRootPath = location.pathname === "/";
  const loggedIn = user !== null;
  let content;

  // Wait for auth to load before making redirect decisions
  if (loading) {
    // Show nothing or a loading indicator while checking auth
    return null;
  }

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
        sx={{
          display: "flex",
          height: "100vh",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Navbar loggedIn={loggedIn} logOut={logout} />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            paddingTop: "64px", // Account for fixed AppBar
            overflow: "hidden",
            minHeight: 0, // Allow flex children to shrink
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: 2,
            }}
          >
            {content}
          </Box>
        </Box>
      </Box>
    </GradientBackground>
  );
};

export default Layout;
