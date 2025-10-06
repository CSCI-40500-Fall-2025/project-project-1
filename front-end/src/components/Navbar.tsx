// import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";

interface NavbarProps {
  loggedIn: boolean;
  logOut: () => void;
}

const navItems = [ "Friends", "Events", "Groups", "Schedule"];

const Navbar = ({ loggedIn, logOut }: NavbarProps) => {
  const navigate = useNavigate();
  const handleNavItemClick = (item: string) => {
    navigate("/" + item.toLowerCase());
  };

  return (
    <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ textDecoration: "none", color: "inherit" }}
            onClick={() => handleNavItemClick("")}
            flexGrow={1}
          >
            Bing Bong
          </Typography>
          {loggedIn ? (
            <>
              {navItems.map((item) => (
                <Button
                  key={item}
                  onClick={() => handleNavItemClick(item)}
                  sx={{ textDecoration: "none", color: "inherit" }}
                >
                  {item}
                </Button>
              ))}
              <Button color="inherit" onClick={() => logOut()}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Divider />
              <Button color="inherit" onClick={() => handleNavItemClick("login")}>
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default Navbar;
