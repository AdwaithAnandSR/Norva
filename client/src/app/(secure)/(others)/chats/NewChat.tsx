import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useChatContacts, useAccessConversation } from "../../../../hooks/chat/useChatQuery.js";
import {useDebouncedValue} from "../../../../hooks/useDebouncedValue.js";
import InitialsAvatar from "../../../../components/search/InitialsAvatar.jsx";

const NewChat = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const { data, isLoading } = useChatContacts(debouncedSearch);
    const accessConvMutation = useAccessConversation();

    const users = data?.users || [];

    const handleSelectUser = (targetUser: any) => {
        accessConvMutation.mutate(targetUser._id, {
            onSuccess: (res) => {
                if (res?.success && res?.conversation?._id) {
                    router.replace({
                        pathname: "/chats/[id]" as any,
                        params: {
                            id: res.conversation._id,
                            user: JSON.stringify(targetUser)
                        }
                    });
                }
            }
        });
    };

    return (
        <View className="flex-1 bg-primary px-4 pt-12">
            {/* Header */}
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
                    className="text-text text-xl"
                >
                    New Chat
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-card-selected rounded-full px-4 py-2 mb-4 border border-btn/20">
                <Ionicons name="search" size={20} color="#7f7f9e" className="mr-2" />
                <TextInput
                    placeholder="Search people..."
                    placeholderTextColor="#7f7f9e"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 text-text ml-2 text-base font-semibold"
                    autoFocus
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={18} color="#7f7f9e" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            {isLoading || accessConvMutation.isPending ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6437ff" />
                </View>
            ) : users.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="people-outline" size={48} color="#7f7f9e" />
                    <Text
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        className="text-text-secondary text-lg mt-3 text-center"
                    >
                        No users found
                    </Text>
                    <Text className="text-text/60 text-sm text-center mt-1">
                        Try searching by username or full name
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSelectUser(item)}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between py-3 border-b border-white/5"
                        >
                            <View className="flex-row items-center flex-1 mr-3">
                                <InitialsAvatar
                                    fullname={item.fullname || item.username}
                                    profileImage={item.profileImage}
                                    size={48}
                                />
                                <View className="ml-3 flex-1">
                                    <Text
                                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                                        className="text-text text-base"
                                        numberOfLines={1}
                                    >
                                        {item.fullname || item.username}
                                    </Text>
                                    <Text className="text-text/60 text-sm" numberOfLines={1}>
                                        @{item.username}
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-btn px-4 py-2 rounded-full">
                                <Text
                                    style={{ fontFamily: "SpaceMono" }}
                                    className="text-white text-xs font-bold"
                                >
                                    Chat
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default NewChat;
