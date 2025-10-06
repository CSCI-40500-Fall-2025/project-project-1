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

interface RegisterPaneProps {
  onSwitchToLogin: () => void;
}

const RegisterPane = ({ onSwitchToLogin }: RegisterPaneProps) => {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    React.useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    console.log("Registering with:", { username, email, password });
    try {
      createUser(email, username, password);
      console.log("User registered:", res);
      alert("Registration successful! Please log in.");
    } catch (err: any) {
      console.log("Registration failed:", err);
      alert(`Registration failed. ${err.error}`);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;

    //check if username is taken -- to be implemented
    //check if email is taken -- to be implemented
    if (!username) {
      setUsernameError(true);
      setUsernameErrorMessage("Username is required.");
      isValid = false;
    }
    else if (username.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage("Username must be at least 3 characters long.");
      isValid = false;
    }

    if (!email) {
      setEmailError(true);
      setEmailErrorMessage("Email is required.");
      isValid = false;
    }
    else if (!/\S+@\S+\.\S+/.test(email)) {
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

    if (confirmPassword !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage("");
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
            error={usernameError}
            helperText={usernameErrorMessage}
            label="Username"
            type="text"
            placeholder="username"
            variant="outlined"
            fullWidth
            required
            autoFocus
            color={usernameError ? "error" : "primary"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
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
        <FormControl>
          <TextField
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
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
