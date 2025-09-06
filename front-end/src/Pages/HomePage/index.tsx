import Box from "@mui/material/Box";
import React from "react";
import { useState, useEffect } from "react";
import { createTestUser } from "../../services/userServices";

const FirstPage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    createTestUser()
      .then((res) => setMessage(res.message))
      .catch((err) => setMessage(err.message));
  }, []); // runs once on mount
  return (
    <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
          padding: 2,
        }}
      >
          <div>BING BONG {message}</div>
      </Box>

  );
};

export default FirstPage;
