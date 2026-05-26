import { View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { buttonGlow } from "@constants/style.js";

const QuickButtons = ({ hasNoPosts }) => {
    const handleEdit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/EditProfile");
    };

    const handleCreate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/CreatePost");
    };

    return (
        <View style={{ gap: 10, marginTop: 12, paddingHorizontal: 24 }}>
            <TouchableOpacity
                style={[buttonGlow, {
                    borderRadius: 24,
                    paddingVertical: 12,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderColor: "rgba(100,55,255,0.3)"
                }]}
                onPress={handleEdit}
            >
                <Feather name="edit-2" size={15} color="#a78bfa" />
                <Text style={{ color: "#a78bfa", fontFamily: "SpaceMono", fontSize: 13 }}>
                    Edit Profile
                </Text>
            </TouchableOpacity>

            {hasNoPosts && (
                <TouchableOpacity
                    style={[buttonGlow, {
                        borderRadius: 24,
                        paddingVertical: 12,
                        alignItems: "center",
                        backgroundColor: "rgba(100,55,255,0.15)",
                        borderWidth: 1,
                        borderColor: "#6437ff"
                    }]}
                    onPress={handleCreate}
                >
                    <Text style={{ color: "#fff", fontFamily: "SpaceMono", fontSize: 13 }}>
                        Create My First Post
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default QuickButtons;