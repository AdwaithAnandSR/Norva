import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Loader from "../common/Loader";

interface ChatInputBarProps {
    text: string;
    onChangeText: (val: string) => void;
    selectedImage: string | null;
    onClearImage: () => void;
    onPickImage: () => void;
    onSendMessage: () => void;
    uploadingImage: boolean;
    sendingSocketMsg: boolean;
    isPending: boolean;
}

const ChatInputBar = ({
    text,
    onChangeText,
    selectedImage,
    onClearImage,
    onPickImage,
    onSendMessage,
    uploadingImage,
    sendingSocketMsg,
    isPending
}: ChatInputBarProps) => {
    const isSending = uploadingImage || sendingSocketMsg || isPending;
    const canSend = (text.trim() || selectedImage) && !isSending;

    return (
        <View className="bg-primary border-t border-white/10">
            {/* Selected Image Attachment Preview */}
            {selectedImage && (
                <View className="px-4 py-2 flex-row items-center justify-between bg-card-selected border-b border-white/10">
                    <View className="flex-row items-center">
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                            contentFit="cover"
                        />
                        <Text className="text-text/80 text-sm ml-3 font-semibold">
                            Photo attached
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClearImage} className="p-2">
                        <Ionicons
                            name="close-circle"
                            size={22}
                            color="#ef4444"
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Input Row */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity
                    onPress={onPickImage}
                    className="p-2 bg-card-selected rounded-full mr-2 border border-white/10"
                >
                    <Feather name="image" size={20} color="#c4c4e0" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#7f7f9e"
                    value={text}
                    onChangeText={onChangeText}
                    multiline
                    className="flex-1 bg-card-selected text-text rounded-full px-4 py-2 text-base border border-btn/20 max-h-24"
                />

                <TouchableOpacity
                    onPress={onSendMessage}
                    disabled={!canSend}
                    className={`ml-2 p-3 rounded-full ${
                        canSend ? "bg-btn" : "bg-card-selected opacity-50"
                    }`}
                >
                    {isSending ? (
                        <Loader size="small" color="#ffffff" />
                    ) : (
                        <Ionicons name="send" size={18} color="#ffffff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatInputBar;
