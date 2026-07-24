import axios from "../../utils/axios";
import storage from "react-native-mmkv";
import { Text } from "react-native";

import { storeSession } from "../../storage/storage.js";
import { useUser } from "../../store/user.store.js";
import { useApp } from "../../store/app.store.js";

const setToast = useApp.getState().setToast;

const handleSignUp = async (data, page, setMessage) => {
    const handleMessage = msg => {
        if (page === "signup") {
            setMessage(prev => ({ ...prev, response: msg }));
        } else setMessage(msg);
    };

    const updateUser = useUser.getState().updateUser;
    try {
        handleMessage("please wait...");

        const res = await axios.post(`/auth/${page}`, data);

        const { user, refreshToken, accessToken } = res.data;

        storeSession({
            refreshToken,
            accessToken
        });

        const { username, fullname, role, _id: userId } = user;

        updateUser({
            username,
            fullname,
            role,
            userId
        });

        if (res.data.success) {
            setToast("green=>Logged&In");
            return handleMessage("Authentication Successfull 💫");
        }
    } catch (error) {
        setToast("red=>Authentication Failed");
        console.log("Error while authentication: ", error.message);
        if (error?.response?.data)
            handleMessage(error.response.data.message?.split("_")?.join(" "));
        else handleMessage(error.message);
    }
};

export default handleSignUp;
