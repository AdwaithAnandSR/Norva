import axios from "axios";
import storage from "react-native-mmkv";
import { Text } from "react-native";

import { storeSession } from "../../storage/storage.js";

const api = process.env.EXPO_PUBLIC_API;

const handleSignUp = async (data, page, setMessage) => {
    try {
        setMessage("please wait...");
        if (data.username.trim().length < 8)
            return setMessage("username must contain atleast 8 characters!");
        else if (data.password.trim().length < 8)
            return setMessage("password must contain atleast 8 characters!");
        else if (page === "signup" && data.fullname.trim().length === 0)
            return setMessage("enter your full name!");

        const res = await axios.post(`${api}/auth/${page}`, data);
        const { user, refreshToken, accessToken } = res.data;

        storeSession({ user, refreshToken, accessToken });
        if (res.data.success)
            return setMessage("Authentication Successfull 💫");
    } catch (error) {
        console.error(error.message);
        if (error?.response?.data)
            setMessage(error.response.data.message?.split("_")?.join(" "));
    }
};

export default handleSignUp;
