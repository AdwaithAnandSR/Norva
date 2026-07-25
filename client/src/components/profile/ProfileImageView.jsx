import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useUser } from "../../store/user.store";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const { width: vw, height: vh } = Dimensions.get("window");

const IMAGE_SIZE = vw * 0.3;
const COVER_HEIGHT = vw * 0.65;

const ProfileImageView = () => {
    const fullname = useUser(state => state.fullname);
    const username = useUser(state => state.username);

    return (
        <View>
            <Image
                source={require("../../../assets/images/file_0000000046c07209a8ba2a5c37b608af.png")}
                style={{
                    width: "100%",
                    height: COVER_HEIGHT
                }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
            />

            <View className="-mt-8 rounded-t-2xl bg-primary pl-5 ">
                <TouchableOpacity
                    style={{
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                        borderRadius: IMAGE_SIZE / 2,
                        overflow: "hidden"
                    }}
                    onPress={() =>
                        router.push({
                            pathname: "/FullScreenImage",
                            params: {
                                postId: "profile",
                                uri: "../../../assets/images/IMG_20250716_130532.jpg"
                            }
                        })
                    }
                    className="-mt-20 border-5 border-border"
                >
                    <Image
                        source={require("../../../assets/images/IMG_20250716_130532.jpg")}
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                        transition={1000}
                    />
                </TouchableOpacity>

                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.nameText}
                    className="text-text-secondary text-3xl"
                >
                    {fullname}
                </Text>
                <Text className="text-text/60 font-semibold text-lg">
                    @{username}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    nameText: {
        fontFamily: "WinkyRoughExtraBold"
    }
});

export default ProfileImageView;
