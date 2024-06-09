import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notifyService = (() => {
  const showNotification = (message, type) => {
    toast(message, { type });
  };

  return {
    showNotification,
  };
})();

export default notifyService;
