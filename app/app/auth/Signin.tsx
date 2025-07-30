import React from "react";
import {
    StyleSheet,
    Text,
    ScrollView,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    View
} from "react-native";
import { router } from "expo-router";

import SigninInputs from "@components/auth/SigninInputs.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const Signin = () => {
    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.headerText}>Sign In</Text>

                <SigninInputs />

                <View style={styles.textCont}>
                    <Text style={styles.text}>Don't have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push("auth/Signup")}
                    >
                        <Text
                            style={{
                                color: "#e6d6e1",
                                fontWeight: 900,
                                fontSize: vw * 0.04
                            }}
                        >
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: vw * 0.035,
        backgroundColor: "black"
    },
    headerText: {
        color: "white",
        fontFamily: "GloriaRegular",
        fontSize: vw * 0.2,
        marginTop: vh * 0.157
    },
    text: {
        color: "white",
        textAlign: "center",
        fontSize: vw * 0.04,
        fontWeight: 500,
        marginTop: vh * 0.03
    },
    textCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: vh * 0.03,
        paddingBottom: vh * 0.1
    },
    text: {
        color: "white",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        fontSize: vw * 0.04,
        fontWeight: 500
    }
});

export default Signin;
