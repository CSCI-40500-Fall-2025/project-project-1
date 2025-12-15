import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "../const";

interface NavbarProps {
  loggedIn: boolean;
  logOut: () => void;
}

const navItems = ["Friends", "Events", "Groups", "Schedule"];

const Navbar = ({ loggedIn, logOut }: NavbarProps) => {
  const navigate = useNavigate();
  const handleNavItemClick = (item: string) => {
    navigate("/" + item.toLowerCase());
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => handleNavItemClick("home")}
        >
          {APP_NAME}
        </Typography>
        {loggedIn ? (
          <>
            {navItems.map((item) => (
              <Button
                key={item}
                color="inherit"
                onClick={() => handleNavItemClick(item)}
                sx={{
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {item}
              </Button>
            ))}
            <Button
              color="inherit"
              onClick={async () => {
                await logOut();
                navigate("/login");
              }}
              sx={{
                textTransform: "none",
                marginLeft: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Log Out
            </Button>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={() => handleNavItemClick("login")}
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
