import React from "react";
import {
  Card,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  FormControl,
} from "@mui/material";
import { APP_NAME } from "../../const";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/userServices";

interface LoginPaneProps {
  onSwitchToRegister: () => void;
}
const LoginPane = ({ onSwitchToRegister }: LoginPaneProps) => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    console.log("Logging in with:", { email, password });
    try {
      const res = await loginUser(email, password);
      navigate("/home");
      console.log("User logged in:", res);
      alert("Login successful!");
    } catch (err: any) {
      alert(`Login failed. ${err.error}`);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <Card
      sx={{
        minWidth: 350,
        padding: 4,
        boxShadow: 3,
        borderRadius: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center">
        {APP_NAME}
      </Typography>

      <Box
        component="form"
        onSubmit={handleLogin}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        <FormControl>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? "error" : "primary"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            label="Password"
            type="password"
            variant="outlined"
            placeholder="••••••"
            fullWidth
            required
            value={password}
            color={passwordError ? "error" : "primary"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Link component="button" type="button" variant="body2" underline="hover">
            Forgot password?
          </Link>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2">{"Don't have an account?"}</Typography>
            <Link
              component="button"
              variant="body2"
              underline="hover"
              type="button"
              onClick={onSwitchToRegister}
            >
              Sign up
            </Link>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default LoginPane;
