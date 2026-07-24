import { View, Text } from "react-native";

const InitialsAvatar = ({ fullname, size = 44 }) => (
    <View
        className="items-center justify-center rounded-full bg-card-selected border border-btn/20"
        style={{ width: size, height: size, borderRadius: size / 2 }}
    >
        <Text
            className="text-btn"
            style={{ fontFamily: "WinkyRoughExtraBold", fontSize: size * 0.4 }}
        >
            {fullname?.[0]?.toUpperCase() ?? "?"}
        </Text>
    </View>
);

export default InitialsAvatar;
