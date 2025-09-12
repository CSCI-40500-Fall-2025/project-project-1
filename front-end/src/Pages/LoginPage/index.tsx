import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import RegisterPane from "./RegisterPane";
import LoginPane from "./LoginPane";
import { createUser } from "../../services/userServices";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerAccount, setRegisterAccount] = useState(false);
  const [username, setUsername] = useState(""); //used for registering

  useEffect(() => {
    console.log(email, password);
  }, [email, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });

    // TODO: Implement login logic
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering with:", { username, email, password });  
    createUser(email, username, password)
      .then((res:any) => {
        console.log("User registered:", res);
        alert("Registration successful! Please log in.");
        setRegisterAccount(false); // Switch to login pane after successful registration
      })
      .catch((err:any) => {
        console.log("Registration failed:", err);
        alert(`Registration failed. ${err.error}`);
      });

  };

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
        {registerAccount ? (
          <RegisterPane
            email={email}
            setEmail={setEmail}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handleRegister}
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
        )}
      </Box>
  );
};

export default LoginPage;
