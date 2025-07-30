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

import handleAuth from "@controllers/auth/signup.controller.js";
import { isValidUsername, isValidPassword } from "@utils/validateUsername.js";

const { height: vh, width: vw } = Dimensions.get("window");

const InputContainers = ({ page }) => {
    const fullnameRef = useRef(),
        passwordRef = useRef();

    const [formData, setFormData] = useState({
        username: "",
        fullname: "",
        password: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState({
        username: "",
        password: ""
    });
    const [isValid, setIsValid] = useState({
        username: false,
        password: false
    });

    return (
        <View style={styles.inputCont}>
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
                    if(page === "signup")
                    setIsValid(prev => ({
                        ...prev,
                        username: isValidUsername(txt, setMessage)
                    }));
                    setFormData(prev => ({
                        ...prev,
                        username: txt
                    }));
                }}
                onSubmitEditing={() => {
                    if (page === "signup" && fullnameRef?.current)
                        fullnameRef.current.focus();
                    else passwordRef.current.focus();
                }}
            />

            {page === "signup" && (
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
                    onSubmitEditing={() => {
                        if (passwordRef?.current) passwordRef.current.focus();
                    }}
                />
            )}
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
                    autoCapitalize={"none"}
                    returnKeyType="done"
                    selectionColor="#242424da"
                    cursorColor="#0ef695"
                    underlineColorAndroid="transparent"
                    value={formData.password}
                    onChangeText={txt => {
                        if(page === "signup")
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
                    {showPass ? (
                        <MaterialCommunityIcons
                            name="eye-outline"
                            size={22}
                            color="white"
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="eye-off-outline"
                            size={22}
                            color="white"
                        />
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={async () => {
                    if (
                        isValidPassword(formData.password) &&
                        isValidUsername(formData.username)
                    )
                        handleAuth(formData, page, setMessage);
                }}
                style={[
                    styles.button,
                    {
                        backgroundColor:
                            page === "signin" ? "#01d177" : "#f20686"
                    }
                ]}
            >
                <Text style={styles.buttonText}>
                    {page === "signin" ? "Sign In" : "Sign Up"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputCont: {
        width: "100%",
        marginTop: vh * 0.05,
        gap: vh * 0.0085
    },
    input: {
        width: "100%",
        // height: vh * 0.075,
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
        transform: [{ translateY: "-50%" }]
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
        fontSize: 12
        // backgroundColor: "green"
    }
});

export default InputContainers;
