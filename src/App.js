import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Container,
  CssBaseline,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import MenuIcon from '@mui/icons-material/Menu';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import authService from "./services/authService";
import LogoutIcon from "@mui/icons-material/Logout";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    handleClose();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpen(false);
    handleCloseMenu();
  };

  const handleOpenDialog = () => {
    setOpen(true);
    handleCloseMenu();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        {user ? (
          <>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="h6" component="div">
                    <strong>
                      {user.username.charAt(0).toUpperCase() +
                        user.username.slice(1).toLowerCase()}
                    </strong>
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={user.email} />
            </ListItem>
            <ListItem>
              <ListItemText primary={user.roles} />
            </ListItem>
            <ListItem button onClick={handleOpenDialog}>
              <LogoutIcon />
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
        <ListItem>
          <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            color="secondary"
          />
        </ListItem>
      </List>
    </Box>
  );

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#007FFF",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#007FFF",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#fff",
            color: "#000",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            color: "#000",
          },
        },
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#007FFF",
      },
      secondary: {
        main: "#007FFF",
      },
      background: {
        default: "#121212",
        paper: "#121212",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#007FFF",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#121212",
            color: "#fff",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            color: "#fff",
          },
        },
      },
    },
  });

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="static"
            sx={{
              backgroundColor: theme.palette.background.default,
              boxShadow: 3,
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link
                  to="/"
                  style={{
                    margin: "0 10px",
                    color: darkMode ? "#fff" : "#000",
                    textDecoration: "none",
                  }}
                >
                  Multimedia Library
                </Link>
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center" }}>
                <Link
                  to="/"
                  style={{
                    margin: "0 10px",
                    color: darkMode ? "#fff" : "#000",
                    textDecoration: "none",
                  }}
                >
                  Home
                </Link>
                {user ? (
                  <>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        margin: "0 10px",
                        color: darkMode ? "#006cd6" : "#006cd6",
                        cursor: "pointer",
                      }}
                      onClick={handleClick}
                    >
                      <strong>
                        {user.username.charAt(0).toUpperCase() +
                          user.username.slice(1).toLowerCase()}
                      </strong>
                    </Typography>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem>{user.email}</MenuItem>
                      <MenuItem>{user.roles}</MenuItem>
                      <MenuItem onClick={handleOpenDialog}>
                        <LogoutIcon />
                        Logout
                      </MenuItem>
                    </Menu>
                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Are you sure you want to logout?"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          If you logout, you will need to login again to access
                          your account.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleClose}
                          variant="contained"
                          color="secondary"
                        >
                          No
                        </Button>
                        <Button
                          onClick={handleLogout}
                          variant="contained"
                          color="secondary"
                        >
                          Yes
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      style={{
                        margin: "0 10px",
                        color: darkMode ? "#fff" : "#000",
                        textDecoration: "none",
                      }}
                    >
                      Login
                    </Link>
                  </>
                )}
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  color="secondary"
                />
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {drawerList}
          </Drawer>
        </Box>
        <Container sx={{ mb: 4, mt: 4, textAlign: "center" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
          </Routes>
        </Container>
        <ToastContainer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
