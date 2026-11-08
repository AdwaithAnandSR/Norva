import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
                <View className="px-4 pt-3 pb-1 flex-row items-center">
                    <View className="relative self-start">
                        {/* Thumbnail with purple accent ring & dark gradient */}
                        <View className="relative rounded-2xl overflow-hidden border-2 border-btn/60 shadow-lg bg-black/40">
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ width: 72, height: 72 }}
                                contentFit="cover"
                            />
                            <LinearGradient
                                colors={["transparent", "rgba(0,0,0,0.4)"]}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0
                                }}
                            />
                        </View>

                        {/* Floating Dark Close Pill Badge */}
                        <TouchableOpacity
                            onPress={onClearImage}
                            activeOpacity={0.8}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="absolute -top-2 -right-2 bg-neutral-900/90 rounded-full p-1 border border-white/20 shadow-md"
                        >
                            <Ionicons
                                name="close"
                                size={14}
                                color="#ffffff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Input Row */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity
                    onPress={onPickImage}
                    className="p-2.5 bg-card-selected rounded-full mr-2 border border-white/10"
                >
                    <Feather name="image" size={20} color="#a78bfa" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#7f7f9e"
                    value={text}
                    onChangeText={onChangeText}
                    multiline
                    className="flex-1 bg-card-selected text-text rounded-2xl px-4 py-2.5 text-base border border-btn/20 max-h-24"
                />

                <TouchableOpacity
                    onPress={onSendMessage}
                    disabled={!canSend}
                    className={`ml-2 p-3 rounded-full shadow-md ${
                        canSend ? "bg-btn" : "bg-card-selected opacity-40"
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
