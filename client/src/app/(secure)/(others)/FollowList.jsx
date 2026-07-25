import { useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import {
    getFollowers,
    getFollowing
} from "../../../controllers/user/user.controller.js";
import UserSearchRow from "../../../components/search/UserSearchRow.jsx";
import { useUser } from "../../../store/user.store.js";

const FollowList = () => {
    const { id, initialTab = "followers", username = "" } = useLocalSearchParams();
    const myId = useUser(s => s.userId);

    const [activeTab, setActiveTab] = useState(
        initialTab === "following" ? "following" : "followers"
    );
    const [searchQuery, setSearchQuery] = useState("");

    const followersQuery = useQuery({
        queryKey: ["followers", id],
        queryFn: () => getFollowers(id),
        enabled: !!id
    });

    const followingQuery = useQuery({
        queryKey: ["following", id],
        queryFn: () => getFollowing(id),
        enabled: !!id
    });

    const activeQuery = activeTab === "followers" ? followersQuery : followingQuery;
    const rawUsers = activeQuery.data?.users ?? [];

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return rawUsers;
        const q = searchQuery.toLowerCase().trim();
        return rawUsers.filter(
            u =>
                u.username?.toLowerCase().includes(q) ||
                u.fullname?.toLowerCase().includes(q)
        );
    }, [rawUsers, searchQuery]);

    const followersCount = followersQuery.data?.users?.length ?? 0;
    const followingCount = followingQuery.data?.users?.length ?? 0;

    const handleUserPress = user => {
        if (user._id === myId) {
            router.push("/Profile");
        } else {
            router.push(`/(UserProfile)/${user._id}`);
        }
    };

    return (
        <View className="flex-1 bg-primary">
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-4"
                style={{ marginTop: 54, marginBottom: 12 }}
            >
                <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                    <Feather name="arrow-left" size={22} color="#c4c4e0" />
                </TouchableOpacity>
                <Text
                    numberOfLines={1}
                    className="text-text"
                    style={{ fontFamily: "WinkyRoughExtraBold", fontSize: 18 }}
                >
                    {username ? `@${username}` : "User Connections"}
                </Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Instagram-style Tabs Header */}
            <View className="flex-row border-b border-border/30">
                <TouchableOpacity
                    flex={1}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab("followers")}
                    className="flex-1 py-3 items-center"
                    style={{
                        borderBottomWidth: activeTab === "followers" ? 2 : 0,
                        borderColor: "#6437ff"
                    }}
                >
                    <Text
                        className={
                            activeTab === "followers"
                                ? "text-text font-bold"
                                : "text-text-secondary/60 font-semibold"
                        }
                        style={{ fontFamily: "SpaceMono", fontSize: 13 }}
                    >
                        {followersCount > 0 ? `${followersCount} ` : ""}Followers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    flex={1}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab("following")}
                    className="flex-1 py-3 items-center"
                    style={{
                        borderBottomWidth: activeTab === "following" ? 2 : 0,
                        borderColor: "#6437ff"
                    }}
                >
                    <Text
                        className={
                            activeTab === "following"
                                ? "text-text font-bold"
                                : "text-text-secondary/60 font-semibold"
                        }
                        style={{ fontFamily: "SpaceMono", fontSize: 13 }}
                    >
                        {followingCount > 0 ? `${followingCount} ` : ""}Following
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Input Bar */}
            <View className="px-4 py-3">
                <View className="flex-row items-center bg-[#1a1a2e] border border-border/30 rounded-xl px-3 py-2">
                    <Feather name="search" size={16} color="rgba(196,196,224,0.4)" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search users..."
                        placeholderTextColor="#555"
                        autoCapitalize="none"
                        style={{
                            flex: 1,
                            color: "#fff",
                            fontFamily: "SpaceMono",
                            fontSize: 13,
                            marginLeft: 8,
                            padding: 0
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={10}>
                            <Feather name="x" size={16} color="rgba(196,196,224,0.5)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* User List */}
            {activeQuery.isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6437ff" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={activeQuery.isRefetching}
                            onRefresh={() => activeQuery.refetch()}
                            tintColor="#6437ff"
                        />
                    }
                    renderItem={({ item }) => (
                        <UserSearchRow user={item} onPress={handleUserPress} />
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16 px-6">
                            <Ionicons
                                name="people-outline"
                                size={48}
                                color="rgba(196,196,224,0.3)"
                            />
                            <Text
                                className="text-text-secondary/70 text-center mt-3"
                                style={{ fontFamily: "WinkyRoughExtraBold", fontSize: 16 }}
                            >
                                {searchQuery
                                    ? "No users found matching query"
                                    : activeTab === "followers"
                                      ? "No followers yet"
                                      : "Not following anyone yet"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default FollowList;
