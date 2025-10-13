import { Box, Typography, Divider, IconButton } from "@mui/material";
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
          flexDirection: "column",
        }}
      >
        <Typography>Follow {APP_NAME}</Typography>
        <Box
          sx={{
            textIndent: "1.5em;",
          }}
        >
          <IconButton
            href="https://linkedin.com"
            sx={{
              marginRight: "10px",
            }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            href="https://facebook.com"
            sx={{
              marginRight: "10px",
            }}
          >
            <Facebook />
          </IconButton>
          <IconButton
            href="https://linkedin.com"
            sx={{
              marginRight: "10px",
            }}
          >
            <LinkedIn />
          </IconButton>

          <IconButton
            href="https://linkedin.com"
            sx={{
              marginRight: "10px",
            }}
          >
            <Twitter />
          </IconButton>
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
