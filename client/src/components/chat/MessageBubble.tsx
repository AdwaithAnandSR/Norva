import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { EaseView } from "react-native-ease";

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
            <EaseView
                initialAnimate={{ opacity: 0, translateY: 10, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: "spring", damping: 24, stiffness: 240 }}
                useHardwareLayer={true}
                style={[
                    styles.easeView,
                    isMe ? styles.selfEnd : styles.selfStart
                ]}
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

                    {/* Dark Vignette Overlay */}
                    <LinearGradient
                        colors={["rgba(0,0,0,0.25)", "transparent", "rgba(0,0,0,0.55)"]}
                        locations={[0, 0.4, 1]}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />

                    <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center space-x-1">
                        <Text className="text-white/90 text-[10px] mr-1">
                            {formatTime(item.createdAt)}
                        </Text>
                        {isMe && getStatusIcon()}
                    </View>
                </TouchableOpacity>
            </EaseView>
        );
    }

    // Text Only Messages
    if (!item.image) {
        return (
            <EaseView
                initialAnimate={{ opacity: 0, translateY: 10, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: "spring", damping: 24, stiffness: 240 }}
                useHardwareLayer={true}
                style={[
                    styles.easeView,
                    isMe ? styles.selfEnd : styles.selfStart
                ]}
            >
                <View
                    className={`px-4 py-2.5 rounded-2xl ${
                        isMe
                            ? "bg-btn rounded-tr-xs"
                            : "bg-card-selected rounded-tl-xs border border-white/10"
                    }`}
                >
                    <Text className="text-white text-base leading-5 font-normal">
                        {item.text}
                    </Text>
                    <View className="flex-row items-center justify-end mt-1 self-end space-x-1">
                        <Text className="text-white/60 text-[10px] mr-1">
                            {formatTime(item.createdAt)}
                        </Text>
                        {isMe && getStatusIcon()}
                    </View>
                </View>
            </EaseView>
        );
    }

    // Image + Text Messages
    return (
        <EaseView
            initialAnimate={{ opacity: 0, translateY: 10, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            useHardwareLayer={true}
            style={[
                styles.easeView,
                isMe ? styles.selfEnd : styles.selfStart
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPreviewImage(item.image)}
                className={`w-[240px] rounded-2xl overflow-hidden shadow-md relative ${
                    isMe ? "rounded-tr-xs" : "rounded-tl-xs border border-white/10"
                }`}
            >
                {/* Full Background Image */}
                <Image
                    source={{ uri: item.image }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%"
                    }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                />

                {/* Subtle Top Gradient */}
                <LinearGradient
                    colors={["rgba(0,0,0,0.25)", "transparent"]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 50
                    }}
                />

                {/* Top Image Preview Area */}
                <View style={{ height: 130 }} />

                {/* Text & Metadata Container with Compact 70% Dark Background Transparency */}
                <View className="px-3 pt-1.5 pb-1 bg-black/70 rounded-t-md">
                    <Text className="text-white text-base leading-5 font-normal shadow-sm">
                        {item.text}
                    </Text>

                    <View className="flex-row items-center justify-end mt-0.5 self-end space-x-1">
                        <Text className="text-white/80 text-[10px] mr-1">
                            {formatTime(item.createdAt)}
                        </Text>
                        {isMe && getStatusIcon()}
                    </View>
                </View>
            </TouchableOpacity>
        </EaseView>
    );
};

const styles = StyleSheet.create({
    easeView: {
        marginVertical: 4,
        maxWidth: "80%"
    },
    selfEnd: {
        alignSelf: "flex-end",
        alignItems: "flex-end"
    },
    selfStart: {
        alignSelf: "flex-start",
        alignItems: "flex-start"
    }
});

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
