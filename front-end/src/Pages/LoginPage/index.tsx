import { useState } from "react";
import Box from "@mui/material/Box";
import RegisterPane from "./RegisterPane";
import LoginPane from "./LoginPane";

const LoginPage = () => {
  const [registerAccount, setRegisterAccount] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: 'column',
        transform: 'translateY(30%)',
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
        boxShadow: "none",
        maxHeight: '100vh'
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
