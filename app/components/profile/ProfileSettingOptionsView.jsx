import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const { height: vh, width: vw } = Dimensions.get("window");

const ProfileSettingOptionsView = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>User Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trendBtn}>
                <FontAwesome6 name="arrow-trend-up" size={24} color="#0efd9a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>Account Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: vh * 0.085,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: vw * 0.03
    },
    btn: {
        paddingVertical: vh * 0.015,
        paddingHorizontal: vw * 0.04,
        borderRadius: 15,
        backgroundColor: "#0bb8e8",
        justifyContent: "center",
        alignItems: "center"
    },
    trendBtn: {
        width: vw * 0.13,
        height: vw * 0.13,
        borderRadius: vw * 0.5,
        // backgroundColor: "#14ff79",

        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    btnText: {
        color: "white",
        fontSize: vw * 0.045,
        fontFamily: "WinkyRoughExtraBold"
    }
});

export default ProfileSettingOptionsView;
