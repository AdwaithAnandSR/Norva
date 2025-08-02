import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { getUser } from "@storage/storage.js";
import ProfileImageView from "@components/profile/ProfileImageView.jsx";
import ProfileActivityView from "@components/profile/ProfileActivityView.jsx";
import ProfileHighlightsView from "@components/profile/ProfileHighlightsView.jsx";
import ProfileSettingOptionsView from "@components/profile/ProfileSettingOptionsView.jsx";

const { username } = getUser();
const { height: vh, width: vw } = Dimensions.get("window");

const Profile = () => {
    return (
        <View overScrollMode={"always"} bounces={true} style={styles.container}>
            <LinearGradient
                style={styles.linearBg}
                colors={["rgba(107,86,79, 0.4)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.2 }}
            >
                <View style={styles.navbar}></View>
                <Text style={styles.username}>{username}</Text>
                <ProfileImageView />
                <ProfileActivityView />
                <ProfileHighlightsView />
                <ProfileSettingOptionsView />
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    },
    linearBg: {
        flex: 1,
        paddingHorizontal: vw * 0.035
    },
    navbar: { height: vh * 0.05 },
    username: {
        color: "white",
        fontSize: vw * 0.08,
        fontFamily: "WinkyRoughExtraBold",
        paddingTop: vh * 0.01
    }
});

export default Profile;
