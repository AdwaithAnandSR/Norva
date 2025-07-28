import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
    id: "secureAppStorage",
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY
});

export const storeSession = ({ user, accessToken, refreshToken }) => {
    if (!user || !accessToken || !refreshToken) return alert("CRASH");
    storage.set("username", user.username);
    storage.set("userId", user._id);
    storage.set("role", user.role);
    storage.set("fullname", user?.fullname || user.username);
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
};
