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
import { useAuth } from "../../AuthContext";

interface LoginPaneProps {
  onSwitchToRegister: () => void;
}
const LoginPane = ({ onSwitchToRegister }: LoginPaneProps) => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    console.log("Logging in with:", { email, password });
    try {
      const res = await loginUser(email, password);
      if (refreshUser) await refreshUser();
      navigate("/home");
      console.log("User logged in:", res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginError(err?.message);
      } else {
        setLoginError("Unknown login error");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailErrorMessage("");
    }

    if (!password) {
      setPasswordErrorMessage("Password is required.");
      isValid = false;
    } else {
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
            error={!!emailErrorMessage}
            helperText={emailErrorMessage}
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailErrorMessage ? "error" : "primary"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <TextField
            error={!!passwordErrorMessage}
            helperText={passwordErrorMessage }
            label="Password"
            type="password"
            variant="outlined"
            placeholder="••••••"
            fullWidth
            required
            value={password}
            color={passwordErrorMessage ? "error" : "primary"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {loginError && (
          <Typography color="error" variant="body2" textAlign="center">
            {loginError}
          </Typography>
        )}
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
          <Link
            component="button"
            type="button"
            variant="body2"
            underline="hover"
          >
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
