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
    const [message, setMessage] = useState(<Text></Text>);

    function validateUsername() {
        const normalized = formData.username.normalize("NFKC"); // Normalize to standard form
        const validCharRegex = /[\p{L}._-]/u;
        const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

        let username = [...normalized]
            .filter(char => validCharRegex.test(char) && !emojiRegex.test(char))
            .join("");

        setFormData(prev => ({ ...prev, username }));
    }

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
                onChangeText={txt =>
                    setFormData(prev => ({
                        ...prev,
                        username: txt
                    }))
                }
                onSubmitEditing={() => {
                    validateUsername();
                    if (page === "signup" && fullnameRef?.current)
                        fullnameRef.current.focus();
                    else passwordRef.current.focus();
                }}
            />

            {page === "signup" && (
                <TextInput
                    ref={fullnameRef}
                    style={styles.input}
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
            <View>
                <TextInput
                    ref={passwordRef}
                    style={[styles.input, { paddingRight: vw * 0.1 }]}
                    placeholder={"password"}
                    secureTextEntry={!showPass}
                    autoCapitalize={"none"}
                    returnKeyType="done"
                    selectionColor="#242424da"
                    cursorColor="#0ef695"
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
                    if(page === "signup" ){
                    setMessage(
                        <Text style={{ color: "#46f489", textAlign: "center" }}>
                            Formatting username...
                        </Text>
                    );
                    await new Promise(resolve =>
                        setTimeout(() => resolve(), 500)
                    );

                    validateUsername();
                    }
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
            {message}
        </View>
    );
};

const styles = StyleSheet.create({
    inputCont: {
        width: "100%",
        marginTop: vh * 0.05,
        gap: vh * 0.02
    },
    input: {
        width: "100%",
        height: vh * 0.075,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "white",
        padding: vw * 0.04,
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
        marginTop: vh * 0.03
    },
    buttonText: {
        fontSize: vw * 0.07,
        fontFamily: "LuckiestGuyRegular",
        color: "white"
    }
});

export default InputContainers;
