import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
};

interface MessageBubbleProps {
    item: any;
    myId: string;
    recipientId?: string;
    onPreviewImage: (url: string) => void;
    onRetryMessage?: (item: any) => void;
}

const MessageBubble = ({
    item,
    myId,
    recipientId,
    onPreviewImage,
    onRetryMessage
}: MessageBubbleProps) => {
    const senderId =
        typeof item.sender === "string" ? item.sender : item.sender?._id;
    const isMe = senderId === myId;

    const checkUserInArray = (arr: any[] | undefined, targetId?: string) => {
        if (!arr || arr.length === 0) return false;
        if (targetId) {
            return arr.some(
                (id: any) => (typeof id === "string" ? id : id?._id) === targetId
            );
        }
        return arr.some(
            (id: any) => (typeof id === "string" ? id : id?._id) !== myId
        );
    };

    const isSending = item.isTemp || item.status === "sending";
    const isFailed = item.status === "failed";
    const isRead = checkUserInArray(item.isReadBy, recipientId);
    const isDelivered = checkUserInArray(item.isDeliveredTo, recipientId);

    const getStatusIcon = () => {
        if (isSending) {
            return <MaterialIcons name="access-time" size={14} color="#a78bfa" />;
        }
        if (isFailed) {
            return (
                <TouchableOpacity
                    onPress={() => onRetryMessage?.(item)}
                    className="flex-row items-center space-x-1"
                >
                    <MaterialIcons name="error-outline" size={14} color="#ef4444" />
                    <Text className="text-red-400 text-[10px] ml-0.5">Tap to retry</Text>
                </TouchableOpacity>
            );
        }
        if (isRead) {
            return <MaterialIcons name="done-all" size={14} color="#34d399" />;
        }
        if (isDelivered) {
            return <MaterialIcons name="done-all" size={14} color="#a78bfa" />;
        }
        return <MaterialIcons name="done" size={14} color="#a78bfa" />;
    };

    const isImageOnly = Boolean(item.image && !item.text);

    if (isImageOnly) {
        return (
            <View
                className={`my-1 max-w-[80%] ${
                    isMe ? "self-end items-end" : "self-start items-start"
                }`}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onPreviewImage(item.image)}
                    className={`relative overflow-hidden rounded-2xl ${
                        isMe ? "rounded-tr-xs" : "rounded-tl-xs"
                    }`}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            width: 230,
                            height: 180
                        }}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                    />

                    <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full flex-row items-center space-x-1">
                        <Text className="text-white/90 text-[10px] mr-1">
                            {formatTime(item.createdAt)}
                        </Text>
                        {isMe && getStatusIcon()}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View
            className={`my-1 max-w-[80%] ${
                isMe ? "self-end items-end" : "self-start items-start"
            }`}
        >
            <View
                className={`px-4 py-3 rounded-2xl ${
                    isMe
                        ? "bg-btn rounded-tr-xs"
                        : "bg-card-selected rounded-tl-xs border border-white/10"
                }`}
            >
                {item.image ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onPreviewImage(item.image)}
                        className="mb-2 rounded-xl overflow-hidden"
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: 220,
                                height: 180
                            }}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                        />
                    </TouchableOpacity>
                ) : null}

                {item.text ? (
                    <Text className="text-white text-base leading-5 font-normal">
                        {item.text}
                    </Text>
                ) : null}

                <View className="flex-row items-center justify-end mt-1 self-end space-x-1">
                    <Text className="text-white/60 text-[10px] mr-1">
                        {formatTime(item.createdAt)}
                    </Text>
                    {isMe && getStatusIcon()}
                </View>
            </View>
        </View>
    );
};

export default React.memo(MessageBubble, (prevProps, nextProps) => {
    return (
        prevProps.item._id === nextProps.item._id &&
        prevProps.item.tempId === nextProps.item.tempId &&
        prevProps.item.status === nextProps.item.status &&
        prevProps.item.text === nextProps.item.text &&
        prevProps.item.image === nextProps.item.image &&
        (prevProps.item.isDeliveredTo?.length || 0) === (nextProps.item.isDeliveredTo?.length || 0) &&
        (prevProps.item.isReadBy?.length || 0) === (nextProps.item.isReadBy?.length || 0) &&
        prevProps.myId === nextProps.myId &&
        prevProps.recipientId === nextProps.recipientId
    );
});
