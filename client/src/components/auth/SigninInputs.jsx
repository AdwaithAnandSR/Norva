import { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Dimensions,
    TouchableOpacity
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import handleAuth from "../../controllers/auth/auth.controller.js";
import {
    isValidUsername,
    isValidPassword
} from "../../utils/validateAuthData.js";
import { greenGlow } from "../../constants/style.js";

const { height: vh, width: vw } = Dimensions.get("window");

const SigninInputs = () => {
    const passwordRef = useRef();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState("");

    return (
        <View style={styles.inputCont}>
            <TextInput
                style={styles.input}
                placeholder={"username"}
                maxLength={25}
                returnKeyType="next"
                selectionColor="#242424da"
                cursorColor="#0ef695"
                underlineColorAndroid="transparent"
                value={formData.username}
                blurOnSubmit={false}
                onChangeText={txt =>
                    setFormData(prev => ({ ...prev, username: txt }))
                }
                onSubmitEditing={() => passwordRef?.current?.focus()}
            />

            <View>
                <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder={"password"}
                    secureTextEntry={!showPass}
                    autoCapitalize={"none"}
                    returnKeyType="done"
                    selectionColor="#242424da"
                    cursorColor="#0ef695"
                    blurOnSubmit={false}
                    underlineColorAndroid="transparent"
                    value={formData.password}
                    onChangeText={txt =>
                        setFormData(prev => ({ ...prev, password: txt }))
                    }
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPass(prev => !prev)}
                >
                    <MaterialCommunityIcons
                        name={showPass ? "eye-outline" : "eye-off-outline"}
                        size={22}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.resText}>{message}</Text>

            <TouchableOpacity
                onPress={() => handleAuth(formData, "signin", setMessage)}
                style={[styles.button, greenGlow]}
            >
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputCont: {
        width: "100%",
        marginTop: vh * 0.05,
        gap: vh * 0.03
    },
    input: {
        width: "100%",
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "white",
        padding: vw * 0.04,
        paddingVertical: vh * 0.025,
        color: "white",
        fontSize: vw * 0.045,
        fontFamily: "SpaceMono"
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: "50%",
        transform: [{ translateY: -11 }]
    },
    button: {
        width: "100%",
        height: vh * 0.07,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: vw * 0.07,
        fontFamily: "LuckiestGuyRegular",
        color: "white"
    },
    infoText: {
        color: "white",
        textAlign: "center",
        fontSize: 12
    },
    resText: {
        color: "white",
        textAlign: "center",
        fontSize: 16
    }
});

export default SigninInputs;
