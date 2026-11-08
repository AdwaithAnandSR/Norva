import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { useUser } from "../../store/user.store";
import InitialsAvatar from "../search/InitialsAvatar.jsx";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const { width: vw } = Dimensions.get("window");

const IMAGE_SIZE = vw * 0.3;
const COVER_HEIGHT = vw * 0.65;

const ProfileImageView = ({
    profileImage: propProfileImage,
    backgroundImage: propBackgroundImage,
    fullname: propFullname,
    username: propUsername
}) => {
    const storeFullname = useUser(state => state.fullname);
    const storeUsername = useUser(state => state.username);
    const storeProfileImage = useUser(state => state.profileImage);
    const storeBackgroundImage = useUser(state => state.backgroundImage);

    const fullname = propFullname !== undefined ? propFullname : storeFullname;
    const username = propUsername !== undefined ? propUsername : storeUsername;
    const profileImage = propProfileImage !== undefined ? propProfileImage : storeProfileImage;
    const backgroundImage = propBackgroundImage !== undefined ? propBackgroundImage : storeBackgroundImage;

    const handleAvatarPress = () => {
        if (!profileImage) return;
        router.push({
            pathname: "/FullScreenImage",
            params: {
                postId: "profile",
                uri: profileImage
            }
        });
    };

    const handleCoverPress = () => {
        if (!backgroundImage) return;
        router.push({
            pathname: "/FullScreenImage",
            params: {
                postId: "profile_cover",
                uri: backgroundImage
            }
        });
    };

    return (
        <View>
            <TouchableOpacity
                activeOpacity={backgroundImage ? 0.95 : 1}
                onPress={handleCoverPress}
            >
                {backgroundImage ? (
                    <Image
                        source={{ uri: backgroundImage }}
                        style={{
                            width: "100%",
                            height: COVER_HEIGHT
                        }}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                        transition={1000}
                    />
                ) : (
                    <View
                        style={{
                            width: "100%",
                            height: COVER_HEIGHT,
                            backgroundColor: "#1a1a2e"
                        }}
                    />
                )}
            </TouchableOpacity>

            <View className="-mt-8 rounded-t-2xl bg-primary pl-5 ">
                <TouchableOpacity
                    style={{
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                        borderRadius: IMAGE_SIZE / 2,
                        overflow: "hidden"
                    }}
                    onPress={handleAvatarPress}
                    className="-mt-20 border-5 border-border"
                    activeOpacity={profileImage ? 0.85 : 1}
                >
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={{
                                width: "100%",
                                height: "100%"
                            }}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={1000}
                        />
                    ) : (
                        <InitialsAvatar
                            fullname={username}
                            size={IMAGE_SIZE}
                        />
                    )}
                </TouchableOpacity>

                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.nameText}
                    className="text-text-secondary text-3xl mt-2"
                >
                    {fullname || username}
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
