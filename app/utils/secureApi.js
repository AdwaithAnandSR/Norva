import axios from "axios";
import { storage , saveTokens} from "../storage/storage.js";

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

        console.log(error.response.status);

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("fetching saved token ...");
                const savedRefreshToken = storage.getString("refreshToken");
                if (!savedRefreshToken)
                    throw new Error("No refresh token available");

                try {
                    console.log("fetching new token ...");
                    const res = await axios.post(
                        `${API_URL}/auth/refreshTokens`,
                        {
                            refreshToken: savedRefreshToken
                        }
                    );

                    console.log("response: .", res.data);
                    const { accessToken, refreshToken } = res.data;
                    console.log(
                        "setting new tokens: ",
                        accessToken,
                        "\n",
                        refreshToken
                    );
                    saveTokens({ accessToken, refreshToken });

                    // Retry original request with new access token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    console.log("new request ", originalRequest);
                    return api(originalRequest);
                } catch (error) {
                    console.error(error);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
