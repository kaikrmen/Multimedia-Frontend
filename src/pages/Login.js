import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  useTheme,
  styled,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import notifyService from "../services/notifyService";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: theme.palette.secondary.main,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.secondary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.secondary.main,
    },
  },
}));

const Login = ({ setUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.email || !formData.password)
        return notifyService.showNotification("Missing fields", "error");
      const data = await authService.login(
        formData.email.toLowerCase(),
        formData.password
      );
      if (data.data.token) {
        notifyService.showNotification("Login successful", "success");
        setUser(authService.getCurrentUser());
        navigate("/");
      } else {
        notifyService.showNotification(
          data.data.message.charAt(0).toUpperCase() +
            data.data.message.slice(1).toLowerCase(),
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      notifyService.showNotification("Login failed", "error");
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        height: "100%",
      }}
    >
      <Typography component="h1" variant="h5">
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <StyledTextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
        />
        <StyledTextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />
        <p>
          You still not register? Register <a href="/register">here!</a>
        </p>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          style={{ margin: theme.spacing(3, 0, 2) }}
        >
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
