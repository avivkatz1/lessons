import axios from "axios";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://aqueous-eyrie-54478.herokuapp.com"
    : "http://localhost:5001";

const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { apiClient, baseUrl };
export default apiClient;
