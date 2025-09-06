import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

interface LoginPaneProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
}
const LoginPane = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  onSwitchToRegister,
}: LoginPaneProps) => {
  return (
    <Card sx={{ minWidth: 350, padding: 3, boxShadow: 3, borderRadius: 5 }}>
      <CardContent>
        <Typography
          variant="h4"
          component="div"
          gutterBottom
          textAlign="center"
        >
          BingBong
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
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
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Link href="#" variant="body2" underline="hover">
              Forgot password?
            </Link>
            <Link
              component="button"
              variant="body2"
              underline="hover"
              onClick={onSwitchToRegister}
            >
              Create an account
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginPane;
