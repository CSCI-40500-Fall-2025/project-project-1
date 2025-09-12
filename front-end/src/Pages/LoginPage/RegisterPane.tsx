// import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Button,
  Link,
} from "@mui/material";

interface RegisterPaneProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

const RegisterPane = ({
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  onSwitchToLogin,
}: RegisterPaneProps) => (
  <Card sx={{ minWidth: 350, padding: 2, boxShadow: 3, borderRadius: 5 }}>
    <CardContent>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Create Account
      </Typography>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Username"
          type="text"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button variant="contained" color="primary" type="submit">
          Register
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
            variant="body2"
            underline="hover"
            onClick={onSwitchToLogin}
          >
            Login here
          </Link>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default RegisterPane;
