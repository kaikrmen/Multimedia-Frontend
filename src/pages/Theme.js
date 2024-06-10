import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Modal,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { Edit, Delete, Visibility, Add, Close, SentimentDissatisfied } from "@mui/icons-material";
import themeService from "../services/themeService";
import authService from "../services/authService";
import notifyService from "../services/notifyService";
import allowsService from "../services/allowAllService";

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [filteredThemes, setFilteredThemes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchThemes();
    fetchUserRoles();
  }, []);

  const fetchThemes = async () => {
    const response = await allowsService.getThemes();
    const sortedThemes = response.data.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    setThemes(sortedThemes);
    setFilteredThemes(sortedThemes);
  };

  const fetchUserRoles = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.roles) {
      setRoles(currentUser.roles);
    }
  };

  const hasRole = (role) => roles.includes(role);

  const handleOpenModal = (type, theme = null) => {
    setModalType(type);
    setSelectedTheme(theme);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTheme(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSaveTheme = async (event) => {
    event.preventDefault();
    const data = {
      name: event.target.name.value,
      permissions: {
        images: event.target.allowsImages.checked,
        videos: event.target.allowsVideos.checked,
        texts: event.target.allowsTexts.checked,
      },
    };

    if (!data.name) {
      return notifyService.showNotification("Missing fields", "error");
    }

    if (
      data.permissions.images === false &&
      data.permissions.videos === false &&
      data.permissions.texts === false
    ) {
      return notifyService.showNotification(
        "You have to select at least one",
        "error"
      );
    }

    try {
      if (modalType === "add") {
        const response = await themeService.createTheme(data);
        if (response.status === 200) {
          fetchThemes();
          handleCloseModal();
          return notifyService.showNotification(
            "Theme created successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(response.data.message, "error");
        }
      } else if (modalType === "edit") {
        const response = await themeService.updateTheme(
          selectedTheme._id,
          data
        );
        if (response.status === 200) {
          fetchThemes();
          handleCloseModal();
          return notifyService.showNotification(
            "Theme updated successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(response.data.message, "error");
        }
      }
    } catch (error) {
      return notifyService.showNotification("Failed to save theme", "error");
    }
  };

  const handleDeleteTheme = async (id) => {
    try {
      const response = await themeService.deleteTheme(id);
      if (response.status === 200) {
        fetchThemes();
        handleCloseModal();
        return notifyService.showNotification(
          "Deleted theme successfully",
          "success"
        );
      } else {
        return notifyService.showNotification(response.data.message, "error");
      }
    } catch (error) {
      return notifyService.showNotification(
        "Category found in content, you can not delete it",
        "error"
      );
    }
  };

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    const lowercasedValue = value.toLowerCase();
    const filteredData = themes.filter((theme) =>
      theme.name.toLowerCase().includes(lowercasedValue)
    );
    setFilteredThemes(filteredData);
  };

  return (
    <Container sx={{ mt: 4 }} style={{ minHeight: "100vh", height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Theme Management
      </Typography>
      <Autocomplete
        options={themes.map((theme) => theme.name)}
        value={searchQuery}
        onInputChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Themes"
            variant="outlined"
            fullWidth
            margin="normal"
          />
        )}
      />
      {hasRole("admin") || hasRole("creator") ? (
        <Button
          style={{ display: "flex" }}
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal("add")}
          startIcon={<Add />}
        >
          Add Theme
        </Button>
      ) : null}
      {filteredThemes.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={5}
        >
          <SentimentDissatisfied fontSize="large" color="disabled" />
          <Typography variant="h6" color="textSecondary" mt={2}>
            No data available
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Allows Images</TableCell>
                  <TableCell>Allows Videos</TableCell>
                  <TableCell>Allows Texts</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredThemes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((theme) => (
                    <TableRow key={theme._id}>
                      <TableCell>{theme.name}</TableCell>
                      <TableCell>
                        <Checkbox disabled checked={theme.permissions.images} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled checked={theme.permissions.videos} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled checked={theme.permissions.texts} />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenModal("view", theme)}>
                          <Visibility />
                        </IconButton>
                        {(hasRole("admin") || hasRole("creator")) && (
                          <>
                            <IconButton
                              onClick={() => handleOpenModal("edit", theme)}
                            >
                              <Edit />
                            </IconButton>
                          </>
                        )}
                        {hasRole("admin") && (
                          <IconButton
                            onClick={() => handleOpenModal("delete", theme)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 50, 100]}
            component="div"
            count={filteredThemes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ ...modalStyle }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {modalType === "view"
                ? "Theme Details"
                : modalType === "add"
                ? "Add Theme"
                : modalType === "edit"
                ? "Edit Theme"
                : "Delete Theme"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
          {modalType === "view" && selectedTheme && (
            <>
              <Typography>Name: {selectedTheme.name}</Typography>
              <Typography>
                Allows Images: {selectedTheme.permissions.images ? "Yes" : "No"}
              </Typography>
              <Typography>
                Allows Videos: {selectedTheme.permissions.videos ? "Yes" : "No"}
              </Typography>
              <Typography>
                Allows Texts: {selectedTheme.permissions.texts ? "Yes" : "No"}
              </Typography>
            </>
          )}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSaveTheme}>
              <TextField
                name="name"
                label="Name"
                defaultValue={selectedTheme ? selectedTheme.name : ""}
                fullWidth
                margin="normal"
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="allowsImages"
                    defaultChecked={
                      selectedTheme ? selectedTheme.permissions.images : false
                    }
                  />
                }
                label="Allows Images"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="allowsVideos"
                    defaultChecked={
                      selectedTheme ? selectedTheme.permissions.videos : false
                    }
                  />
                }
                label="Allows Videos"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="allowsTexts"
                    defaultChecked={
                      selectedTheme ? selectedTheme.permissions.texts : false
                    }
                  />
                }
                label="Allows Texts"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Save
              </Button>
            </form>
          )}
          {modalType === "delete" && selectedTheme && (
            <>
              <Typography>
                Are you sure you want to delete the theme "{selectedTheme.name}
                "?
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteTheme(selectedTheme._id)}
                sx={{ mt: 2 }}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseModal}
                sx={{ mt: 2, ml: 2 }}
              >
                No
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default Themes;
