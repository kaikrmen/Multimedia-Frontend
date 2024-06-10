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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

import { Edit, Delete, Visibility, Add, Close, SentimentDissatisfied } from "@mui/icons-material";
import contentService from "../services/contentService";
import themeService from "../services/themeService";
import categoryService from "../services/categoryService";
import authService from "../services/authService";
import notifyService from "../services/notifyService";
import { API_URL } from "../services/apiService";
import allowsService from "../services/allowAllService";

const Contents = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [themes, setThemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeOptions, setTypeOptions] = useState(["image", "video", "text"]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchContents();
    fetchThemes();
    fetchCategories();
    fetchUserRoles();
  }, []);

  const fetchContents = async () => {
    const response = await allowsService.getContents();
    const sortedContents = response.data.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    setContents(sortedContents);
    setFilteredContents(sortedContents);
  };

  const fetchThemes = async () => {
    const response = await allowsService.getThemes();
    setThemes(response.data);
  };

  const fetchCategories = async () => {
    const response = await allowsService.getCategories();
    setCategories(response.data);
  };

  const fetchUserRoles = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.roles) {
      setRoles(currentUser.roles);
    }
  };

  const hasRole = (role) => roles.includes(role);

  const handleOpenModal = (type, content = null) => {
    setModalType(type);
    setSelectedContent(content);
    setSelectedType(content ? content.type : "");
    setOpenModal(true);
    if (content && content.theme) {
      setSelectedTheme(content.theme);
    }
    if (content && content.type === "image" && content.image) {
      setImagePreview(`${API_URL}${content.image}`);
    } else {
      setImagePreview("");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedContent(null);
    setSelectedType("");
    setImagePreview("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    const lowercasedValue = value.toLowerCase();
    const filteredData = contents.filter((content) =>
      content.title.toLowerCase().includes(lowercasedValue)
    );
    setFilteredContents(filteredData);
  };

  const handleSaveContent = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", event.target.title.value);
    formData.append("type", event.target.type.value);
    formData.append("theme", event.target.theme.value);
    formData.append("category", event.target.category.value);

    const type = event.target.type.value;
    if (type === "text") {
      formData.append("text", event.target.text.value);
    } else if (type === "video") {
      formData.append("url", event.target.url.value);
    } else if (type === "image" && event.target.file.files.length > 0) {
      formData.append("file", event.target.file.files[0]);
    } else if (type === "image") {
      formData.append("image", selectedContent.image);
    }

    if (
      !formData.get("title") ||
      !formData.get("type") ||
      !formData.get("theme") ||
      !formData.get("category") ||
      (type === "text" && !formData.get("text")) ||
      (type === "video" && !formData.get("url"))
    ) {
      return notifyService.showNotification("Missing fields", "error");
    }

    try {
      const themeId = formData.get("theme");
      const categoryId = formData.get("category");

      const themeResponse = await themeService.getTheme(themeId);
      if (themeResponse.status !== 200) {
        return notifyService.showNotification("Theme not found", "error");
      }

      const categoryResponse = await categoryService.getCategory(categoryId);
      if (categoryResponse.status !== 200) {
        return notifyService.showNotification("Category not found", "error");
      }

      const themeData = themeResponse.data;

      if (
        (type === "image" && !themeData.permissions.images) ||
        (type === "video" && !themeData.permissions.videos) ||
        (type === "text" && !themeData.permissions.texts)
      ) {
        return notifyService.showNotification(
          `Theme does not allow ${type} content`,
          "error"
        );
      }

      if (type === "image" && !formData.get("file") && !formData.get("image")) {
        return notifyService.showNotification(
          "File is required for image content",
          "error"
        );
      }

      if (modalType === "add") {
        const response = await contentService.createContent(formData);
        if (response.status === 200) {
          fetchContents();
          handleCloseModal();
          return notifyService.showNotification(
            "Content created successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(response.data.message, "error");
        }
      } else if (modalType === "edit") {
        const response = await contentService.updateContent(
          selectedContent._id,
          formData
        );
        if (response.status === 200) {
          fetchContents();
          handleCloseModal();
          return notifyService.showNotification(
            "Content updated successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(response.data.message, "error");
        }
      }
    } catch (error) {
      return notifyService.showNotification("Failed to save content", "error");
    }
  };

  const handleDeleteContent = async (id) => {
    try {
      const response = await contentService.deleteContent(id);
      if (response.status === 200) {
        fetchContents();
        handleCloseModal();
        return notifyService.showNotification(
          "Deleted content successfully",
          "success"
        );
      } else {
        return notifyService.showNotification(response.data.message, "error");
      }
    } catch (error) {
      return notifyService.showNotification(
        "Failed to delete content",
        "error"
      );
    }
  };

  const handleThemeChange = (event) => {
    const selectedTheme = themes.find(
      (theme) => theme._id === event.target.value
    );
    if (selectedTheme) {
      const permissions = selectedTheme.permissions;
      const options = [];
      if (permissions.images) options.push("image");
      if (permissions.videos) options.push("video");
      if (permissions.texts) options.push("text");
      setTypeOptions(options);
      setSelectedType(""); // Reset type when theme changes
    }
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <Container sx={{ mt: 4 }} style={{ minHeight: "100vh", height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Content Management
      </Typography>
      <Autocomplete
        options={contents.map((content) => content.title)}
        value={searchQuery}
        onInputChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Contents"
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
          Add Content
        </Button>
      ) : null}
      {filteredContents.length === 0 ? (
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
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Theme</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((content) => (
                    <TableRow key={content._id}>
                      <TableCell>{content.title}</TableCell>
                      <TableCell>{content.type}</TableCell>
                      <TableCell>{content.theme.name}</TableCell>
                      <TableCell>{content.category.name}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleOpenModal("view", content)}
                        >
                          <Visibility />
                        </IconButton>
                        {(hasRole("admin") || hasRole("creator")) && (
                          <>
                            <IconButton
                              onClick={() => handleOpenModal("edit", content)}
                            >
                              <Edit />
                            </IconButton>
                          </>
                        )}
                        {hasRole("admin") && (
                          <IconButton
                            onClick={() => handleOpenModal("delete", content)}
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
            count={filteredContents.length}
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
                ? "Content Details"
                : modalType === "add"
                ? "Add Content"
                : modalType === "edit"
                ? "Edit Content"
                : "Delete Content"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
          {modalType === "view" && selectedContent && (
            <>
              <Typography>Title: {selectedContent.title}</Typography>
              <Typography>Type: {selectedContent.type}</Typography>
              <Typography>Theme: {selectedContent.theme.name}</Typography>
              <Typography>Category: {selectedContent.category.name}</Typography>
              {selectedContent.type === "text" && (
                <Typography>Text: {selectedContent.text}</Typography>
              )}
              {selectedContent.type === "image" && selectedContent.image && (
                <img
                  src={`${API_URL}${selectedContent.image}`}
                  alt={selectedContent.title}
                  style={{ width: "100%", height: "auto", padding: "1rem" }}
                />
              )}
              {selectedContent.type === "video" && selectedContent.url && (
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${new URL(
                    selectedContent.url
                  ).searchParams.get("v")}`}
                  title={selectedContent.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ padding: "1rem" }}
                ></iframe>
              )}
            </>
          )}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSaveContent}>
              <TextField
                name="title"
                label="Title"
                defaultValue={selectedContent ? selectedContent.title : ""}
                fullWidth
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={selectedType}
                  onChange={handleTypeChange}
                  required
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  name="theme"
                  defaultValue={
                    selectedContent ? selectedContent.theme._id : ""
                  }
                  onChange={handleThemeChange}
                  required
                >
                  {themes.map((theme) => (
                    <MenuItem key={theme._id} value={theme._id}>
                      {theme.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  defaultValue={
                    selectedContent ? selectedContent.category._id : ""
                  }
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedType === "text" && (
                <TextField
                  name="text"
                  label="Text"
                  defaultValue={selectedContent ? selectedContent.text : ""}
                  fullWidth
                  margin="normal"
                  required={selectedType === "text"}
                />
              )}
              {selectedType === "video" && (
                <TextField
                  name="url"
                  label="Video URL"
                  defaultValue={selectedContent ? selectedContent.url : ""}
                  fullWidth
                  margin="normal"
                  required={selectedType === "video"}
                />
              )}
              {selectedType === "image" && (
                <>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Current content"
                      style={{ width: "100%", height: "auto", padding: "1rem" }}
                    />
                  )}
                  <input
                    type="file"
                    name="file"
                    accept="image/*"
                    style={{ marginTop: "16px" }}
                  />
                </>
              )}
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
          {modalType === "delete" && selectedContent && (
            <>
              <Typography>
                Are you sure you want to delete the content "
                {selectedContent.title}"?
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteContent(selectedContent._id)}
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

export default Contents;
