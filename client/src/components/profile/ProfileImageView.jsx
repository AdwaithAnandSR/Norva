import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image as RNImage
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { useUser } from "../../store/user.store";
import InitialsAvatar from "../search/InitialsAvatar.jsx";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const { width: vw } = Dimensions.get("window");

const IMAGE_SIZE = vw * 0.3;
const COVER_HEIGHT = vw * 0.65;

const DEFAULT_COVER = require("../../../assets/images/file_0000000046c07209a8ba2a5c37b608af.png");
const DEFAULT_AVATAR = require("../../../assets/images/IMG_20250716_130532.jpg");

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

    const coverSource = backgroundImage ? { uri: backgroundImage } : DEFAULT_COVER;

    const handleAvatarPress = () => {
        const avatarUri = profileImage || RNImage.resolveAssetSource(DEFAULT_AVATAR).uri;
        router.push({
            pathname: "/FullScreenImage",
            params: {
                postId: "profile",
                uri: avatarUri
            }
        });
    };

    const handleCoverPress = () => {
        const coverUri = backgroundImage || RNImage.resolveAssetSource(DEFAULT_COVER).uri;
        router.push({
            pathname: "/FullScreenImage",
            params: {
                postId: "profile_cover",
                uri: coverUri
            }
        });
    };

    return (
        <View>
            <TouchableOpacity activeOpacity={0.95} onPress={handleCoverPress}>
                <Image
                    source={coverSource}
                    style={{
                        width: "100%",
                        height: COVER_HEIGHT
                    }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                />
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
                            fullname={fullname || username}
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
