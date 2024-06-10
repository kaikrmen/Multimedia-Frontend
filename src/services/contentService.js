import axiosInstance from "./apiService";

const getContent = async (id) => {
  try {
    const response = await axiosInstance.get(`/contents/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};

const createContent = async (data) => {
  try {
    const response = await axiosInstance.post("/contents", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const updateContent = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/contents/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

const deleteContent = async (id) => {
  try {
    const response = await axiosInstance.delete(`/contents/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};

const contentService = {
  getContent,
  createContent,
  updateContent,
  deleteContent,
};

export default contentService;
