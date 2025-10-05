import React, { useState } from "react";
import Box from "@mui/material/Box";
import RegisterPane from "./RegisterPane";
import LoginPane from "./LoginPane";

const LoginPage = () => {
  const [registerAccount, setRegisterAccount] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 64px)",
        background: "transparent",
        boxShadow: "none",
      }}
    >
      {registerAccount ? (
        <RegisterPane onSwitchToLogin={() => setRegisterAccount(false)} />
      ) : (
        <LoginPane onSwitchToRegister={() => setRegisterAccount(true)} />
      )}
    </Box>
  );
};

export default LoginPage;
