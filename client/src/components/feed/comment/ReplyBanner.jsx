import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const ReplyBanner = ({ replyingTo, onCancel }) => {
    if (!replyingTo) return null;

    return (
        <View className="flex-row items-center justify-between mx-4 mb-2 px-3 py-2 rounded-xl bg-zinc-900">
            <Text className="text-zinc-300 text-xs">
                Replying to @{replyingTo.userId?.username}
            </Text>

            <TouchableOpacity onPress={onCancel}>
                <Feather name="x" size={16} color="#aaa" />
            </TouchableOpacity>
        </View>
    );
};

export default ReplyBanner;
