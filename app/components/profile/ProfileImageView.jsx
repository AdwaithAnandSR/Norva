import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { getUser } from "@storage/storage.js";

const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
const { username, fullname } = getUser();
const { height: vh, width: vw } = Dimensions.get("window");

console.log(getUser());

const ProfileImageView = () => {
    return (
        <View style={styles.profileImgContainer}>
            <Text
                style={styles.fullname}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {fullname}
            </Text>
            <Text
                style={styles.fullname2}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {fullname}
            </Text>
            <View style={styles.imgContainer}>
            <TouchableOpacity >
                <Image
                    source={require("@assets/images/IMG_20250716_130532.jpg")}
                    style={{ width: "100%", height: "100%" }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                />
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.editIcon}>
                <MaterialCommunityIcons
                    name="pencil-circle"
                    size={70}
                    color="#fcded0"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    profileImgContainer: {
        paddingVertical: vh * 0.015,
        justifyContent: "center",
        alignItems: "center"
    },
    fullname: {
        color: "white",
        fontSize: vw * 0.5,
        fontFamily: "WinkyRoughExtraBold",
        position: "absolute",
        bottom: "10%",
        width: "100%"
    },
    fullname2: {
        color: "white",
        fontSize: vw * 0.5,
        fontFamily: "WinkyRoughExtraBold",
        position: "absolute",
        zIndex: 2,
        bottom: "10%",
        width: "100%",
        opacity: 0.15
    },
    imgContainer: {
        width: vw * 0.55,
        height: vw * 0.55,
        borderRadius: vw * 0.5,
        overflow: "hidden",
        borderColor: "white"
    },
    editIcon: {
        position: "absolute",
        zIndex: 999,
        right: "25%",
        bottom: "2%"
    }
});

export default ProfileImageView;
