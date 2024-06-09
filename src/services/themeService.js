import axiosInstance from "./apiService";

const getTheme = (id) => {
  try {
    return axiosInstance.get(`/themes/${id}`);
  } catch (error) {
    return error.response;
  }
};

const createTheme = async (data) => {
  try {
    const response = await axiosInstance.post("/themes", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const updateTheme = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/themes/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const deleteTheme = (id) => {
  try {
    const response = axiosInstance.delete(`/themes/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};

const themeService = {
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
};

export default themeService;
