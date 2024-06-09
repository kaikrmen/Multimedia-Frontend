import axiosInstance from "./apiService";

const getCategory = (id) => {
  try {
    return axiosInstance.get(`/categories/${id}`);
  } catch (error) {
    return error.response;
  }
};

const createCategory = async (data) => {
  try {
    const response = await axiosInstance.post("/categories", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const updateCategory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const deleteCategory = (id) => {
  try {
    const response = axiosInstance.delete(`/categories/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};

const categoryService = {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
