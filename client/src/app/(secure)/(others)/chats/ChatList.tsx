import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    RefreshControl
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useConversations } from "../../../../hooks/chat/useChatQuery.js";
import { useUser } from "../../../../store/user.store.js";
import { useChatStore, Conversation } from "../../../../store/chat.store";
import InitialsAvatar from "../../../../components/search/InitialsAvatar.jsx";
import Loader from "../../../../components/common/Loader";

const EMPTY_CONVERSATIONS: Conversation[] = [];
const keyExtractor = (item: Conversation) => item._id;

const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const ChatItem = ({ item, myId }: { item: any; myId: string }) => {
    const otherUser = item.participants?.find(
        (p: any) => (p._id || p) !== myId
    );
    const lastMsg = item.lastMessage;
    const unreadCount = item.unreadCountForMe || 0;
    const displayTime = lastMsg?.createdAt || item.updatedAt;

    return (
        <TouchableOpacity
            onPress={() =>
                router.push({
                    pathname: "/chats/[id]",
                    params: {
                        id: item._id,
                        user: JSON.stringify(otherUser)
                    }
                })
            }
            activeOpacity={0.7}
            className="flex-row items-center justify-between py-3 border-b border-white/5"
        >
            <View className="flex-row items-center flex-1 mr-3">
                <InitialsAvatar
                    fullname={
                        otherUser?.fullname ||
                        otherUser?.username ||
                        "User"
                    }
                    profileImage={otherUser?.profileImage}
                    size={52}
                />
                <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between">
                        <Text
                            style={{
                                fontFamily: "WinkyRoughExtraBold"
                            }}
                            className="text-text text-base flex-1"
                            numberOfLines={1}
                        >
                            {otherUser?.fullname ||
                                otherUser?.username ||
                                "User"}
                        </Text>
                        <Text className="text-text/50 text-xs ml-2">
                            {formatTimestamp(displayTime)}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                        <Text
                            className={`text-sm flex-1 mr-2 ${
                                unreadCount > 0
                                    ? "text-text font-bold"
                                    : "text-text/60 font-normal"
                            }`}
                            numberOfLines={1}
                        >
                            {lastMsg?.image && !lastMsg?.text
                                ? "📷 Photo"
                                : lastMsg?.text || "Started a chat"}
                        </Text>

                        {unreadCount > 0 && (
                            <View className="bg-btn px-2 py-0.5 rounded-full items-center justify-center">
                                <Text className="text-white text-xs font-bold">
                                    {unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ChatList = () => {
    const myId = useUser((s) => s.userId);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualRefreshing, setManualRefreshing] = useState(false);

    // Fetch conversations from HTTP API via React Query
    const { data, isLoading, refetch } = useConversations();

    // UI renders conversations directly from Zustand store with stable fallback
    const conversations = useChatStore((s) => s.conversations || EMPTY_CONVERSATIONS);
    const setConversations = useChatStore((s) => s.setConversations);

    // Sync React Query fetched conversations into Zustand store
    useEffect(() => {
        if (data?.conversations) {
            setConversations(data.conversations);
        }
    }, [data?.conversations, setConversations]);

    const handleManualRefresh = async () => {
        setManualRefreshing(true);
        const result = await refetch();
        if (result.data?.conversations) {
            setConversations(result.data.conversations);
        }
        setManualRefreshing(false);
    };

    // Refetch conversations when screen gains focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Filter conversations by search term
    const filteredConversations = conversations.filter((conv: any) => {
        if (!searchQuery.trim()) return true;
        const otherUser = conv.participants?.find((p: any) => (p._id || p) !== myId);
        const name = (otherUser?.fullname || "").toLowerCase();
        const username = (otherUser?.username || "").toLowerCase();
        const query = searchQuery.toLowerCase().trim();
        return name.includes(query) || username.includes(query);
    });

    return (
        <View className="flex-1 bg-primary px-4 pt-12">
            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-1"
                >
                    <Feather name="arrow-left" size={24} color="#c4c4e0" />
                </TouchableOpacity>

                <Text
                    style={{ fontFamily: "WinkyRoughExtraBold" }}
                    className="text-text text-2xl"
                >
                    Messages
                </Text>

                <TouchableOpacity
                    onPress={() => router.push("/chats/NewChat")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-2 bg-card-selected rounded-full border border-btn/20"
                >
                    <Feather name="edit" size={20} color="#6437ff" />
                </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-card-selected rounded-full px-4 py-2 mb-4 border border-btn/20">
                <Ionicons name="search" size={20} color="#7f7f9e" />
                <TextInput
                    placeholder="Search messages..."
                    placeholderTextColor="#7f7f9e"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 text-text ml-2 text-base font-semibold"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color="#7f7f9e"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Conversation List */}
            {isLoading && conversations.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Loader size="large" color="#6437ff" />
                </View>
            ) : filteredConversations.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons
                        name="chatbubbles-outline"
                        size={56}
                        color="#7f7f9e"
                    />
                    <Text
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        className="text-text text-xl mt-4 text-center"
                    >
                        {searchQuery
                            ? "No conversations found"
                            : "No messages yet"}
                    </Text>
                    <Text className="text-text/60 text-sm text-center mt-2 mb-6">
                        {searchQuery
                            ? "Try searching for a different name or username"
                            : "Connect with people and start chatting now!"}
                    </Text>

                    {!searchQuery && (
                        <TouchableOpacity
                            onPress={() => router.push("/chats/NewChat")}
                            className="bg-btn px-6 py-3 rounded-full flex-row items-center"
                        >
                            <Feather
                                name="plus"
                                size={18}
                                color="#ffffff"
                                className="mr-2"
                            />
                            <Text
                                style={{ fontFamily: "WinkyRoughExtraBold" }}
                                className="text-white text-base ml-2"
                            >
                                Start a Conversation
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlashList
                    data={filteredConversations}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={manualRefreshing}
                            onRefresh={handleManualRefresh}
                            tintColor="#6437ff"
                        />
                    }
                    renderItem={({ item }) => (
                        <ChatItem item={item} myId={myId} />
                    )}
                />
            )}
        </View>
    );
};

export default ChatList;
