import React from "react";
import { Box, Container, Typography, Link, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="body1">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </Typography>
        <IconButton
          component={Link}
          href="https://github.com/kaikrmen"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          aria-label="GitHub"
          sx={{ mt: 1 }}
        >
          <GitHubIcon />
        </IconButton>
      </Container>
    </Box>
  );
};

export default Footer;
