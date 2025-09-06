import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";
import RegisterPane from "./RegisterPane";
import LoginPane from "./LoginPane";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerAccount, setRegisterAccount] = useState(false);
  const loggedIn = false; // Placeholder for actual auth state
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    console.log(email, password);
  }, [email, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // TODO: Implement login logic
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar loggedIn={loggedIn} setLoggingIn={() => setLoggingIn(!loggingIn)} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 64px)",
            padding: 2,
          }}
      >
         {loggingIn ? (
          registerAccount ? (
            <RegisterPane
              email={email}
              setEmail={setEmail}
              onSwitchToLogin={() => setRegisterAccount(false)}
            />
          ) : (
            <LoginPane
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleLogin}
              onSwitchToRegister={() => setRegisterAccount(true)}
            />
          )
        ) : (
          <div>BING BONG</div>
        )}
         </Box>
    </Box>
  );
};

export default LoginPage;
