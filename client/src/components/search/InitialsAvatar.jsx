import { View, Text } from "react-native";
import { Image } from "expo-image";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const InitialsAvatar = ({ fullname, username, profileImage, size = 44 }) => {
    if (profileImage) {
        return (
            <Image
                source={{ uri: profileImage }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={300}
            />
        );
    }

    const initial = (username || fullname)?.[0]?.toUpperCase() ?? "?";

    return (
        <View
            className="items-center justify-center rounded-full bg-card-selected border border-btn/20"
            style={{ width: size, height: size, borderRadius: size / 2 }}
        >
            <Text
                className="text-btn"
                style={{ fontFamily: "WinkyRoughExtraBold", fontSize: size * 0.4 }}
            >
                {initial}
            </Text>
        </View>
    );
};

export default InitialsAvatar;
