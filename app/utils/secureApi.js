import axios from "axios";

import { storage , saveTokens, revokeSession} from "../storage/storage.js";
import { useUserStore } from "@store/user.store.js"

const API_URL = process.env.EXPO_PUBLIC_API;
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
    const savedAccessToken = storage.getString("accessToken");
    if (savedAccessToken) {
        config.headers.Authorization = `Bearer ${savedAccessToken}`;
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
                const savedRefreshToken = storage.getString("refreshToken");
                if (!savedRefreshToken)
                    throw new Error("No refresh token available");

                try {
                    const res = await axios.post(
                        `${API_URL}/auth/refreshTokens`,
                        {
                            refreshToken: savedRefreshToken
                        }
                    );

                    const { accessToken, refreshToken } = res.data;

                    saveTokens({ accessToken, refreshToken });

                    // Retry original request with new access token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (error) {
                    console.error(error);
                    
                    // logout
                    
                    useUserStore.getState().clearAll()
                    revokeSession()
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
