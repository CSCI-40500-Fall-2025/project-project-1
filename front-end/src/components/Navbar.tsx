import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

interface NavbarProps {
  loggedIn: boolean;
  setLoggingIn: () => void;
}

const Navbar = ({loggedIn, setLoggingIn}: NavbarProps) =>{
  return (
    <Box sx={{ flexGrow: 1, borderRadius: 1, overflow: "hidden" }}>
      <AppBar position="static">
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bing Bong
          </Typography>
          {!loggedIn && <Button color="inherit" onClick={setLoggingIn}>Login</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Navbar;
