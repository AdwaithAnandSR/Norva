import axios from "axios";
// import { getAccessToken, getRefreshToken, saveTokens } from "./authUtils";

const API_URL = process.env.EXPO_PUBLIC_API;
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use( config => {
    let token = ""
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = ""
                if (!refreshToken)
                    throw new Error("No refresh token available");

                const res = await axios.post(`${API_URL}/refresh`, {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = res.data;
                // await saveTokens(accessToken, newRefreshToken);

                // Retry original request with new access token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
