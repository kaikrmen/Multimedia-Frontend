import axios from "axios";
import { API_URL } from "./apiService";

const getCategories = () => {
  try {
    return axios.get(`${API_URL}/categories`);
  } catch (error) {
    return error.response;
  }
};

const getThemes = () => {
    try {
        return axios.get(`${API_URL}/themes`);
    } catch (error) {
        return error.response;
    }
};

const getContents = () => {
  try {
    return axios.get(`${API_URL}/contents`);
  } catch (error) { 
    return error.response;
  }
};

const contentService = {
  getCategories,
  getThemes,
  getContents,
};

export default contentService;
