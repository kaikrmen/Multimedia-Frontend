import axiosInstance from "./apiService";
import { jwtDecode } from "jwt-decode";

const register = async (username, email, password, roles) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      username,
      email,
      password,
      roles,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response;
  } catch (error) {
    return error.response;
  }
};

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  } catch (error) {
    return error.response;
  }
};

const logout = () => {
  localStorage.removeItem('token');
};

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  return token ? jwtDecode(token) : null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
