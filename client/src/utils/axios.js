import axios from "axios";

import { storage, storeSession, revokeSession } from "../storage/storage.js";

import { useUser } from "../store/user.store.js";

const API_URL = "http://192.0.0.2:3000";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = cb => {
    refreshSubscribers.push(cb);
};

const onRefreshed = token => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

api.interceptors.request.use(config => {
    const accessToken = storage.getString("accessToken");

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,

    async error => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // Wait if refresh already happening
        if (isRefreshing) {
            return new Promise(resolve => {
                subscribeTokenRefresh(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    resolve(api(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken = storage.getString("refreshToken");

            if (!refreshToken) {
                throw new Error("NO_REFRESH_TOKEN");
            }

            const response = await axios.post(`${API_URL}/auth/refreshTokens`, {
                refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } =
                response.data;

            storeSession({
                accessToken,
                refreshToken: newRefreshToken
            });

            onRefreshed(accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);

            revokeSession();
            useUser.getState().clearAll();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
