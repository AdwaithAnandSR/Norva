import {
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";

import { Feather } from "@expo/vector-icons";

const CommentInput = ({ text, setText, replyingTo, submitMutation }) => {
    const { mutate, isPending } = submitMutation;

    return (
        <View className="flex-row items-center gap-2 p-4 border-t border-zinc-800">
            <TextInput
                value={text}
                onChangeText={setText}
                placeholder={
                    replyingTo
                        ? `Reply to @${replyingTo.userId?.username}`
                        : "Add a comment..."
                }
                placeholderTextColor="#777"
                multiline
                className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-2xl"
            />

            <TouchableOpacity
                disabled={!text.trim() || isPending}
                onPress={() => mutate()}
                className="w-10 h-10 rounded-full bg-violet-500 items-center justify-center"
            >
                {isPending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Feather name="send" size={16} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
};

export default CommentInput;
