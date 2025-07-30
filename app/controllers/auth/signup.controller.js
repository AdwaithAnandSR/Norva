import axios from "axios";
import storage from "react-native-mmkv";
import { Text } from "react-native";

import { storeSession } from "../../storage/storage.js";
import { useUserStore } from "@store/user.store.js";

const api = process.env.EXPO_PUBLIC_API;

const handleSignUp = async (data, page, setMessage) => {
    const setAllToStore = useUserStore.getState().setAll;
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

        const { username, fullname, role, _id: userId } = user;

        storeSession({
            refreshToken,
            accessToken,
            username,
            fullname,
            role,
            userId
        });
        
        setAllToStore({
            username,
            fullname,
            role,
            userId
        });
        if (res.data.success)
            return setMessage("Authentication Successfull 💫");
    } catch (error) {
        console.log(error.message);
        if (error?.response?.data)
            setMessage(error.response.data.message?.split("_")?.join(" "));
    }
};

export default handleSignUp;
