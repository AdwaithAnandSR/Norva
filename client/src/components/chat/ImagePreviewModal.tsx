import React from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

interface ImagePreviewModalProps {
    previewImage: string | null;
    onClose: () => void;
}

const ImagePreviewModal = ({ previewImage, onClose }: ImagePreviewModalProps) => {
    return (
        <Modal
            visible={!!previewImage}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/95 items-center justify-center">
                <TouchableOpacity
                    onPress={onClose}
                    className="absolute top-12 right-6 z-10 p-2 bg-white/20 rounded-full"
                >
                    <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                {previewImage && (
                    <Image
                        source={{ uri: previewImage }}
                        style={{ width: "95%", height: "80%" }}
                        contentFit="contain"
                    />
                )}
            </View>
        </Modal>
    );
};

export default ImagePreviewModal;
