import React from "react";
import {
  Card,
  Typography,
  TextField,
  Box,
  Button,
  Link,
  FormControl,
} from "@mui/material";
import { createUser } from "../../services/userServices";
import { logAction } from "../../logger";

interface RegisterPaneProps {
  onSwitchToLogin: () => void;
}

const RegisterPane = ({ onSwitchToLogin }: RegisterPaneProps) => {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [registrationError, setRegistrationError] = React.useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    console.log("Registering with:", { username, email, password });
    logAction('trace', 'registering user');
    try {
      const newUser = await createUser(email, username, password);
      console.log("User registered:", newUser);
      alert("Registration successful! Please log in.");
      setRegistrationError("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRegistrationError(err?.message);
      } else {
        setRegistrationError("Unknown registration error");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;

    if (!username) {
      setUsernameError("Username is required.");
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long.");
      isValid = false;
    }

    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  return (
    <Card
      sx={{ minWidth: 350, padding: 4, boxShadow: 3, borderRadius: 5, gap: 2 }}
    >
      <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
        Create a new account
      </Typography>
      <Box
        component="form"
        onSubmit={handleRegister}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <FormControl>
          <TextField
            error={!!usernameError}
            helperText={usernameError}
            label="Username"
            type="text"
            placeholder="username"
            variant="outlined"
            fullWidth
            required
            autoFocus
            color={usernameError ? "error" : "primary"}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setRegistrationError("");
            }}
          />
        </FormControl>
        <FormControl>
          <TextField
            error={!!emailError}
            helperText={emailError}
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            fullWidth
            variant="outlined"
            color={emailError ? "error" : "primary"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setRegistrationError("");
            }}
          />
        </FormControl>
        <FormControl>
          <TextField
            error={!!passwordError}
            helperText={passwordError}
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
        <FormControl>
          <TextField
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            label="Confirm Password"
            type="password"
            variant="outlined"
            placeholder="••••••"
            fullWidth
            required
            value={confirmPassword}
            color={confirmPasswordError ? "error" : "primary"}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>

        {registrationError && (
          <Typography color="error" variant="body2" textAlign="center">
            {registrationError}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>

        <Box
          sx={{
            textAlign: "center",
            mt: 1,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Typography variant="body2">Already have an account ? </Typography>
          <Link
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={onSwitchToLogin}
          >
            Login here
          </Link>
        </Box>
      </Box>
    </Card>
  );
};

export default RegisterPane;
