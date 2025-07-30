import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
    id: "secureAppStorage",
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY
});

export const storeSession = ({ username,
            fullname,
            role,
            userId, accessToken, refreshToken }) => {
    if (!user || !accessToken || !refreshToken) return alert("CRASH");
    storage.set("username", username);
    storage.set("userId", userId);
    storage.set("role", role);
    storage.set("fullname", fullname || username);
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
};

export const saveTokens = ({ accessToken, refreshToken })=>{
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
}

export const getUser = ()=>{
    const username = storage.getString("username")
    const fullname = storage.getString("fullname")
    const userId = storage.getString("userId")
    const role = storage.getString("role")
    return { userId, username, role, fullname }
}