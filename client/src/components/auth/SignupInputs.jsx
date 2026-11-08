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
import { EaseView } from "react-native-ease";

import handleAuth from "../../controllers/auth/auth.controller.js";
import {
    isValidUsername,
    isValidPassword
} from "../../utils/validateAuthData.js";
import { orangeGlow } from "../../constants/style.js";
import AnimatedPressable from "../common/AnimatedPressable.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const SignupInputs = () => {
    const fullnameRef = useRef();
    const passwordRef = useRef();

    const [formData, setFormData] = useState({
        username: "",
        fullname: "",
        password: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState({
        username: "",
        password: "",
        response: ""
    });

    const [isValid, setIsValid] = useState({
        username: false,
        password: false
    });

    return (
        <EaseView
            initialAnimate={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 200 }}
            useHardwareLayer={true}
            style={styles.inputCont}
        >
            <Text style={styles.infoText}>{message.username}</Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor:
                            formData.username.length === 0
                                ? "white"
                                : isValid.username
                                  ? "#53f87e"
                                  : "#fb3270"
                    }
                ]}
                placeholder={"username"}
                maxLength={25}
                returnKeyType="next"
                selectionColor="#242424da"
                cursorColor="#0ef695"
                underlineColorAndroid="transparent"
                value={formData.username}
                onChangeText={txt => {
                    setIsValid(prev => ({
                        ...prev,
                        username: isValidUsername(txt, setMessage)
                    }));
                    setFormData(prev => ({ ...prev, username: txt }));
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => fullnameRef?.current?.focus()}
            />

            <Text style={styles.infoText}></Text>
            <TextInput
                ref={fullnameRef}
                style={[
                    styles.input,
                    {
                        borderColor:
                            formData.fullname.length === 0
                                ? "white"
                                : formData.fullname.trim().length
                                  ? "#53f87e"
                                  : "#fb3270"
                    }
                ]}
                placeholder={"fullname"}
                returnKeyType="next"
                selectionColor="#242424da"
                cursorColor="#0ef695"
                underlineColorAndroid="transparent"
                value={formData.fullname}
                onChangeText={txt =>
                    setFormData(prev => ({ ...prev, fullname: txt }))
                }
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef?.current?.focus()}
            />

            <Text style={styles.infoText}>{message.password}</Text>
            <View>
                <TextInput
                    ref={passwordRef}
                    style={[
                        styles.input,
                        {
                            paddingRight: vw * 0.1,
                            borderColor:
                                formData.password.length === 0
                                    ? "white"
                                    : isValid.password
                                      ? "#53f87e"
                                      : "#fb3270"
                        }
                    ]}
                    placeholder={"password"}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    selectionColor="#242424da"
                    cursorColor="#0ef695"
                    underlineColorAndroid="transparent"
                    value={formData.password}
                    blurOnSubmit={false}
                    onChangeText={txt => {
                        setIsValid(prev => ({
                            ...prev,
                            password: isValidPassword(txt, setMessage)
                        }));
                        setFormData(prev => ({ ...prev, password: txt }));
                    }}
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

            <Text style={styles.resText}>{message.response}</Text>

            <AnimatedPressable
                onPress={() => {
                    if (
                        isValidPassword(formData.password, setMessage) &&
                        isValidUsername(formData.username, setMessage)
                    )
                        handleAuth(formData, "signup", setMessage);
                }}
                scaleTo={0.95}
                style={[styles.button, orangeGlow]}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
            </AnimatedPressable>
        </EaseView>
    );
};

const styles = StyleSheet.create({
    inputCont: {
        width: "100%",
        marginTop: vh * 0.05,
        gap: vh * 0.005
    },
    input: {
        width: "100%",
        borderRadius: 28,
        borderWidth: 1,
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
        alignItems: "center",
        marginTop: vh * 0.05
    },
    buttonText: {
        fontSize: vw * 0.07,
        fontFamily: "LuckiestGuyRegular",
        color: "white"
    },
    infoText: {
        color: "white",
        textAlign: "center",
        fontSize: 11
    },
    resText: {
        color: "white",
        textAlign: "center",
        fontSize: 16
    }
});

export default SignupInputs;
