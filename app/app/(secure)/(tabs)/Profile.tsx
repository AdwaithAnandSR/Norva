import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity
} from "react-native";

import { getUser } from "@storage/storage.js";
import ProfileImageView from "@components/profile/ProfileImageView.jsx";
import ProfileActivityView from "@components/profile/ProfileActivityView.jsx";
import ProfileHeighlightsView from "@components/profile/ProfileHeighlightsView.jsx";
import ProfileSettingOptionsView from "@components/profile/ProfileSettingOptionsView.jsx";

const { username } = getUser();
const { height: vh, width: vw } = Dimensions.get("window");

const Profile = () => {
    return (
        <ScrollView
            overScrollMode={"always"}
            bounces={true}
            style={styles.container}
        >
            <View style={styles.navbar}></View>
            <Text style={styles.username}>{username}</Text>
            <ProfileImageView />
            <ProfileActivityView />
            <ProfileHeighlightsView />
            <ProfileSettingOptionsView />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
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
