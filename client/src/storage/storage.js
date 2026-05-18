import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
    id: "norva",
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY
});

export const storeSession = ({ accessToken, refreshToken }) => {
    storage.set("refreshToken", refreshToken);
    storage.set("accessToken", accessToken);
};

export const revokeSession = () => {
    storage.delete("user");
    storage.delete("refreshToken");
    storage.delete("accessToken");
};

export const zustandStorage = {
    getItem: name => {
        const value = storage.getString(name);
        return value ? JSON.parse(value) : null;
    },
    setItem: (name, value) => {
        storage.set(name, JSON.stringify(value));
    },
    removeItem: name => {
        storage.delete(name);
    }
};
