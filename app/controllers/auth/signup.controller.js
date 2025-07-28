import axios from "axios";
import storage from "react-native-mmkv";
import { Text } from "react-native";

import { storeSession } from "../../storage/storage.js";

const api = process.env.EXPO_PUBLIC_API;

const handleSignUp = async (data, page, setMessage) => {
    try {
        setMessage(
            <Text style={{ color: "#46f489", textAlign: "center" }}>
                please wait...
            </Text>
        );
        if (data.username.trim().length < 5)
            return setMessage(
                <Text style={{ color: "#fa1939", textAlign: "center" }}>
                    username must contain atleast 5 characters!
                </Text>
            );
        else if (data.password.trim().length < 5)
            return setMessage(
                <Text style={{ color: "#fa1939", textAlign: "center" }}>
                    password must contain atleast 5 characters!
                </Text>
            );
        else if (page === "signup" && data.fullname.trim().length === 0)
            return setMessage(
                <Text style={{ color: "#fa1939", textAlign: "center" }}>
                    enter your full name!
                </Text>
            );

        const res = await axios.post(`${api}/auth/${page}`, data);
        const { user, refreshToken, accessToken } = res.data;
        
        storeSession({ user, refreshToken, accessToken });
        if(res.data.success)
        return setMessage(
            <Text style={{ color: "#f853cb", textAlign: "center" }}>
                Authentication Successfull 💫
            </Text>
        );
    } catch (error) {
        console.error(error);
    }
};

export default handleSignUp;
