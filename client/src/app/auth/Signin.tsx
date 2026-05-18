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

import SigninInputs from "../../components/auth/SigninInputs.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const Signin = () => {
    return (
        <KeyboardAvoidingView
            behavior="padding"
            style={styles.container}
            className="bg-primary"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text
                    style={styles.headerText}
                    className="text-text-secondary mt-8"
                >
                    Sign In
                </Text>

                <SigninInputs />

                <View className="mt-3 flex-row justify-center items-center gap-1">
                    <Text className="text-text/80 font-semibold text-lg">
                        Don't have an account?
                    </Text>

                    <Text
                        onPress={() => router.push("auth/Signup")}
                        className="text-text font-bold text-center text-lg"
                    >
                        Sign Up
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: vw * 0.035
    },
    headerText: {
        fontFamily: "GloriaRegular",
        fontSize: vw * 0.2,
        marginTop: vh * 0.2
    },
    text: {
        color: "white",
        textAlign: "center",
        fontSize: vw * 0.04,
        fontWeight: 500,
        marginTop: vh * 0.03
    }
});

export default Signin;
