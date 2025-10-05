import { Box, Typography } from "@mui/material";
import { APP_NAME } from "../../const";

const WelcomePage = () => {
  return (
    <Box>
      <Typography variant="h2" align="center" fontWeight={"bold"}>
        Welcome to {APP_NAME}
      </Typography>
    </Box>
  );
};

export default WelcomePage;
