import { Box, Typography, Divider } from "@mui/material";
import {
  Instagram,
  Facebook,
  LinkedIn,
  Twitter,
  Copyright,
} from "@mui/icons-material";

import { APP_NAME } from "../const";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        height: "20vh",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Typography>Follow {APP_NAME}</Typography>
        <Box
          sx={{
            textIndent: "1.5em;",
          }}
        >
          <Instagram
            sx={{
              marginRight: "10px",
            }}
          />
          <Facebook
            sx={{
              marginRight: "10px",
            }}
          />
          <LinkedIn
            sx={{
              marginRight: "10px",
            }}
          />
          <Twitter
            sx={{
              marginRight: "10px",
            }}
          />
        </Box>
      </Box>
      <Divider orientation="horizontal" variant="middle" flexItem />
      <Box
        sx={{
          display: "flex",
          position: "relative",
          bottom: -20,
        }}
      >
        <Copyright />
        <Typography>
          {currentYear} {APP_NAME} All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
