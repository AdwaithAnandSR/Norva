import axios from "axios";
import storage from "react-native-mmkv";
import { Text } from "react-native";

import { storeSession } from "../../storage/storage.js";
import { useUserStore } from "@store/user.store.js";

const api = process.env.EXPO_PUBLIC_API;

const handleSignUp = async (data, page, setMessage) => {
    const handleMessage = msg => {
        if (page === "signup") {
            setMessage(prev => ({ ...prev, response: msg }));
        } else setMessage(msg);
    };

    const setAllToStore = useUserStore.getState().setAll;
    try {
        handleMessage("please wait...");

        if (data.username.trim().length < 8)
            return handleMessage("username must contain atleast 8 characters!");
        else if (data.password.trim().length < 8)
            return handleMessage("password must contain atleast 8 characters!");
        else if (page === "signup" && data.fullname.trim().length === 0)
            return handleMessage("enter fullname!");

        const res = await axios.post(`${api}/auth/${page}`, data);

        const { user, refreshToken, accessToken } = res.data;

        storeSession({
            refreshToken,
            accessToken,
            user
        });

        const { username, fullname, role, _id: userId } = user;
        
        setAllToStore({
            username,
            fullname,
            role,
            userId
        });
        if (res.data.success)
            return handleMessage("Authentication Successfull 💫");
    } catch (error) {
        console.log("Error while authentication: ", error.message);
        if (error?.response?.data)
            handleMessage(error.response.data.message?.split("_")?.join(" "));
        else handleMessage(error.message);
    }
};

export default handleSignUp;
