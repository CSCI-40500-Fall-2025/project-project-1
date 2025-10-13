import { Box, Typography} from "@mui/material";
import { APP_NAME } from "../../const";
import Footer from "../../components/Footer";
import Typewriter from "typewriter-effect";
import Gallery from "./gallery";

const WelcomePage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h2" fontWeight={"bold"}>
          Welcome to {APP_NAME}
        </Typography>
        <Typography variant="h5">
          <Typewriter
            options={{
              strings: [
                "Simple event scheduling w/ besties~",
                "Never miss out on hangouts.",
                "Touch grass, collaboratively.",
                "Bing Bong!...",
              ],
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 50,
            }}
          />
        </Typography>
      </Box>

      <Box
        sx={{
          height: "auto",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "none",
          alignItems: "center",
        }}
      >
       <Gallery/>
      </Box>
      <Footer />
    </Box>
  );
};

export default WelcomePage;
