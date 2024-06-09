import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  styled,
} from "@mui/material";
import authService from "../services/authService";
import notifyService from "../services/notifyService";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

const useStyles = styled((theme) => ({
  select: {
    "& .MuiSelect-outlined.Mui-focused": {
      borderColor: theme.palette.secondary.main,
    },
  },
  textField: {
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
  },
}));

const Register = ({ setUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const classes = useStyles(theme);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.role
      ) {
        return notifyService.showNotification("Missing fields", "error");
      }

      const data = await authService.register(
        formData.username,
        formData.email.toLowerCase(),
        formData.password,
        [formData.role]
      );

      if (data.data.token) {
        notifyService.showNotification("Registration successful", "success");
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
      notifyService.showNotification("Registration failed", "error");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={formData.username}
          onChange={handleChange}
          className={classes.textField}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          className={classes.textField}
        />
        <TextField
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
          className={classes.textField}
        />
        <FormControl fullWidth margin="normal" className={clsx(classes.select)}>
          <InputLabel id="role-label">Register as</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="reader">Reader</MenuItem>
            <MenuItem value="creator">Creator</MenuItem>
          </Select>
        </FormControl>
        <p>
          Already have an account? <a href="/login">Sign in here!</a>
        </p>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          style={{ margin: theme.spacing(3, 0, 2) }}
        >
          Register
        </Button>
      </form>
    </Container>
  );
};

export default Register;
