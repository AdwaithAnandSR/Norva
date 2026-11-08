import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Stat = ({ value, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ alignItems: "center" }}>
        <Text style={[styles.text, { color: "#fff", fontSize: 20, fontWeight: "bold" }]}>
            {value ?? 0}
        </Text>
        <Text style={[styles.text, { color: "rgba(255,255,255,0.5)", fontSize: 13 }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const ProfileActivityView = ({
    postsCount,
    followingCount,
    followersCount,
    onFollowingPress,
    onFollowersPress
}) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderColor: "rgba(255,255,255,0.06)"
            }}
        >
            <Stat value={postsCount} label="Posts" />
            <View style={{ width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <Stat value={followingCount} label="Following" onPress={onFollowingPress} />
            <View style={{ width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <Stat value={followersCount} label="Followers" onPress={onFollowersPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    text: { fontFamily: "SpaceMono" }
});

export default ProfileActivityView;