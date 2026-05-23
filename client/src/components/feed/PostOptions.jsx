import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

const PostOptions = ({ visible, isOwner, onEdit, onDelete, onClose }) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
                onPress={onClose}
            >
                <View className="absolute bottom-0 left-0 right-0 bg-primary/85 rounded-t-2xl pb-5 pt-3 ">
                    {isOwner && (
                        <>
                            <TouchableOpacity
                                onPress={onEdit}
                                className="flex-row items-center gap-5 py-4 px-5"
                            >
                                <Feather
                                    name="edit-2"
                                    size={18}
                                    color="#c4c4e0"
                                />
                                <Text className="text-text/70 font-bold text-xl">
                                    Edit post
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onDelete}
                                className="flex-row items-center gap-5 py-4 px-5"
                            >
                                <Feather
                                    name="trash-2"
                                    size={18}
                                    color="#f43f5e"
                                />
                                <Text className="text-text/70 font-bold text-xl">
                                    Delete post
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-row items-center gap-5 py-3 mt-2 px-5"
                    >
                        <Feather name="x" size={18} color="#666" />
                        <Text className="text-text/50 font-bold text-xl">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

export default PostOptions;
