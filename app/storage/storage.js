import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
    id: "secureAppStorage",
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY
});

export const storeSession = ({ user, accessToken, refreshToken }) => {
    storage.set("user", JSON.stringify(user));
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
};

export const revokeSession = () => {
    storage.delete("user");
    storage.delete("refreshToken");
    storage.delete("accessToken");
};

export const saveTokens = ({ accessToken, refreshToken }) => {
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
};

export const getUser = () => {
    const data = storage.getString("user");
    if (!data) {
        return {
            username: "",
            userId: "",
            fullname: "",
            createdAt: "",
            role: ""
        };
    }

    try {
        const user = JSON.parse(data);
        const { username, _id: userId, fullname, createdAt, role } = user;
        return { username, userId, fullname, createdAt, role };
    } catch (err) {
        console.error("Failed to parse user data:", err);
        return null;
    }
};