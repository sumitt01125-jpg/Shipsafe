import { apiRequest } from "../lib/api.js";

export const registerUser = async (userData) => {
return apiRequest("/auth/register", {
method: "POST",
body: JSON.stringify(userData),
});
};

export const loginUser = async (credentials) => {
return apiRequest("/auth/login", {
method: "POST",
body: JSON.stringify(credentials),
});
};

export const logoutUser = async () => {
return apiRequest("/auth/logout", {
method: "POST",
});
};

export const getCurrentUser = async () => {
return apiRequest("/auth/me", {
method: "GET",
});
};