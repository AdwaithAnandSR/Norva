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

import SignupInputs from "@components/auth/SignupInputs.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const Signup = () => {
    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.headerText}>Sign Up</Text>
                <SignupInputs />
                <View style={styles.textCont}>
                    <Text style={styles.text}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text
                            style={{
                                color: "#e6d6e1",
                                fontWeight: 900,
                                fontSize: vw * 0.04
                            }}
                        >
                            Sign In
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
        padding: vw * 0.035,
        backgroundColor: "black"
    },
    headerText: {
        color: "white",
        fontFamily: "GloriaRegular",
        fontSize: vw * 0.2,
        marginTop: vh * 0.1
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

export default Signup;
