import React, { useEffect, useState } from "react";
import {
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
  Card,
  CardMedia,
  Autocomplete,
} from "@mui/material";
import { Edit, Delete, Visibility, Add, Close } from "@mui/icons-material";
import categoryService from "../services/categoryService";
import allowsService from "../services/allowAllService";
import notifyService from "../services/notifyService";
import authService from "../services/authService";
import { API_URL } from "../services/apiService";

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchUserRoles();
  }, []);

  const fetchCategories = async () => {
    allowsService.getCategories().then((response) => {
      const sortedCategories = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setCategories(sortedCategories);
      setFilteredCategories(sortedCategories);
    });
  };

  const fetchUserRoles = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.roles) {
      setRoles(currentUser.roles);
    }
  };

  const hasRole = (role) => roles.includes(role);

  const handleOpenModal = (type, category = null) => {
    setModalType(type);
    setSelectedCategory(category);
    setOpenModal(true);
    setSelectedImage(null);
    setCurrentImage(category ? category.coverImageUrl : null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
    setSelectedImage(null);
    setCurrentImage(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file ? URL.createObjectURL(file) : null);
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", event.target.name.value);
    formData.append("allowsImages", event.target.allowsImages.checked);
    formData.append("allowsVideos", event.target.allowsVideos.checked);
    formData.append("allowsTexts", event.target.allowsTexts.checked);

    if (selectedImage) {
      formData.append("file", event.target.file.files[0]);
    } else if (currentImage) {
      formData.append("existingImageUrl", currentImage);
    }

    if (
      !formData.get("name") ||
      !formData.get("allowsImages") ||
      !formData.get("allowsVideos") ||
      !formData.get("allowsTexts")
    ) {
      return notifyService.showNotification("Missing fields", "error");
    }

    try {
      if (modalType === "add") {
        const data = await categoryService.createCategory(formData);
        if (data.status === 200) {
          fetchCategories();
          handleCloseModal();
          return notifyService.showNotification(
            "Category created successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(data.data.message, "error");
        }
      } else if (modalType === "edit") {
        const data = await categoryService.updateCategory(
          selectedCategory._id,
          formData
        );
        if (data.status === 200) {
          fetchCategories();
          handleCloseModal();
          return notifyService.showNotification(
            "Category updated successfully",
            "success"
          );
        } else {
          return notifyService.showNotification(data.data.message, "error");
        }
      }
    } catch (error) {
      return notifyService.showNotification("Failed to save category", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const data = await categoryService.deleteCategory(id);

      if (data.status === 200) {
        fetchCategories();
        handleCloseModal();
        return notifyService.showNotification(
          "Deleted category successfully",
          "success"
        );
      } else {
        return notifyService.showNotification(data.data.message, "error");
      }
    } catch (error) {
      return notifyService.showNotification(
        "Failed to delete category",
        "error"
      );
    }
  };

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    const lowercasedValue = value.toLowerCase();
    const filteredData = categories.filter((category) =>
      category.name.toLowerCase().includes(lowercasedValue)
    );
    setFilteredCategories(filteredData);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>
      <Autocomplete
        options={categories.map((category) => category.name)}
        value={searchQuery}
        onInputChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Categories"
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
        >
          <Add /> Add Category
        </Button>
      ) : null}
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
            {filteredCategories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Checkbox disabled checked={category.allowsImages} />
                  </TableCell>
                  <TableCell>
                    <Checkbox disabled checked={category.allowsVideos} />
                  </TableCell>
                  <TableCell>
                    <Checkbox disabled checked={category.allowsTexts} />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal("view", category)}
                    >
                      <Visibility />
                    </IconButton>
                    {(hasRole("admin") || hasRole("creator")) && (
                      <>
                        <IconButton
                          onClick={() => handleOpenModal("edit", category)}
                        >
                          <Edit />
                        </IconButton>
                      </>
                    )}
                    {hasRole("admin") && (
                      <IconButton
                        onClick={() => handleOpenModal("delete", category)}
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
        count={filteredCategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ ...modalStyle }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {modalType === "view"
                ? "Category Details"
                : modalType === "add"
                ? "Add Category"
                : modalType === "edit"
                ? "Edit Category"
                : "Delete Category"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
          {modalType === "view" && selectedCategory && (
            <>
              <Typography>Name: {selectedCategory.name}</Typography>
              <Typography>
                Allows Images: {selectedCategory.allowsImages ? "Yes" : "No"}
              </Typography>
              <Typography>
                Allows Videos: {selectedCategory.allowsVideos ? "Yes" : "No"}
              </Typography>
              <Typography>
                Allows Texts: {selectedCategory.allowsTexts ? "Yes" : "No"}
              </Typography>
              {selectedCategory.coverImageUrl && (
                <Card sx={{ mt: 2 }}>
                  <CardMedia
                    component="img"
                    style={{ width: "100%", height: "100%", padding: "1rem" }}
                    image={`${API_URL}${selectedCategory.coverImageUrl}`}
                    alt={selectedCategory.name}
                  />
                </Card>
              )}
            </>
          )}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSaveCategory}>
              <TextField
                name="name"
                label="Name"
                defaultValue={selectedCategory ? selectedCategory.name : ""}
                fullWidth
                margin="normal"
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="allowsImages"
                    defaultChecked={
                      selectedCategory ? selectedCategory.allowsImages : false
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
                      selectedCategory ? selectedCategory.allowsVideos : false
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
                      selectedCategory ? selectedCategory.allowsTexts : false
                    }
                  />
                }
                label="Allows Texts"
              />
              <input
                type="file"
                name="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {selectedImage && (
                <Card sx={{ mt: 2 }}>
                  <CardMedia
                    component="img"
                    style={{ width: "100%", height: "100%", padding: "1rem" }}
                    image={selectedImage}
                    alt="Selected Image"
                  />
                </Card>
              )}
              {modalType === "edit" &&
                selectedCategory &&
                currentImage &&
                !selectedImage && (
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      style={{ width: "100%", height: "100%", padding: "1rem" }}
                      image={`${API_URL}${currentImage}`}
                      alt={selectedCategory.name}
                    />
                  </Card>
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
          {modalType === "delete" && selectedCategory && (
            <>
              <Typography>
                Are you sure you want to delete the category "
                {selectedCategory.name}"?
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteCategory(selectedCategory._id)}
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

export default CategoryTable;
