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

import SignupInputs from "../../components/auth/SignupInputs.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const Signup = () => {
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
                <Text style={styles.headerText} className="text-text-secondary">
                    Sign Up
                </Text>
                <SignupInputs />
                <View className="flex-row justify-center items-center gap-1 mt-3">
                    <Text className="text-text/80 font-semibold text-lg">
                        Already have an account?
                    </Text>
                    <Text
                        onPress={() => router.back()}
                        className="text-text font-bold text-lg"
                    >
                        Sign In
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: vw * 0.035
    },
    headerText: {
        fontFamily: "GloriaRegular",
        fontSize: vw * 0.2,
        marginTop: vh * 0.1
    }
});

export default Signup;
