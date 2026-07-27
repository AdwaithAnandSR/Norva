import { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useUserProfile, useUserPosts } from "../../../../hooks/user/useProfileQuery.js";
import { useAccessConversation } from "../../../../hooks/chat/useChatQuery.js";
import { useUser } from "../../../../store/user.store.js";
import { useFollowStore } from "../../../../store/follow.store.js";

import ProfileImageView from "../../../../components/profile/ProfileImageView.jsx";
import ProfileActivityView from "../../../../components/profile/ProfileActivityView.jsx";
import PostsGrid from "../../../../components/profile/PostGrid.jsx";
import FollowButton from "../../../../components/feed/FollowButton.jsx";
import Loader from "../../../../components/common/Loader";

const UserProfile = () => {
    const { id } = useLocalSearchParams();
    const myId = useUser(s => s.userId);
    const setFollowing = useFollowStore(s => s.setFollowing);

    const profileQuery = useUserProfile(id);
    const postsQuery = useUserPosts(id);
    const accessConvMutation = useAccessConversation();

    const handleMessage = () => {
        if (!id) return;
        accessConvMutation.mutate(id, {
            onSuccess: (res) => {
                if (res?.success && res?.conversation?._id) {
                    router.push({
                        pathname: "/chats/[id]",
                        params: {
                            id: res.conversation._id,
                            user: JSON.stringify(profile)
                        }
                    });
                }
            }
        });
    };

    const profile = profileQuery.data?.user;
    const posts = postsQuery.data?.pages.flatMap(p => p.posts) ?? [];

    // Seed the shared follow-state store so FollowButton reflects the real
    // relationship on first render, rather than defaulting to "Follow".
    useEffect(() => {
        if (profile && typeof profile.isFollowing === "boolean") {
            setFollowing(profile._id, profile.isFollowing);
        }
    }, [profile?._id, profile?.isFollowing]);

    const handleRefresh = () => {
        profileQuery.refetch();
        postsQuery.refetch();
    };

    if (profileQuery.isLoading) {
        return (
            <View className="flex-1 bg-primary items-center justify-center">
                <Loader size="large" />
            </View>
        );
    }

    if (profileQuery.isError || !profile) {
        return (
            <View className="flex-1 bg-primary items-center justify-center px-10">
                <Text className="text-[40px] mb-3">⚠️</Text>
                <Text
                    className="text-text text-[18px] text-center mb-2"
                    style={{ fontFamily: "WinkyRoughExtraBold" }}
                >
                    Couldn't load this profile
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4"
                >
                    <Text
                        className="text-btn"
                        style={{ fontFamily: "SpaceMono", fontSize: 13 }}
                    >
                        Go back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-primary"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={profileQuery.isRefetching}
                    onRefresh={handleRefresh}
                    tintColor="#6437ff"
                />
            }
        >
            {/* Header Cover + Avatar */}
            <View className="relative">
                <ProfileImageView
                    profileImage={profile.profileImage}
                    backgroundImage={profile.backgroundImage}
                    fullname={profile.fullname || profile.username}
                    username={profile.username}
                />

                {/* Floating Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={10}
                    style={{ position: "absolute", top: 48, left: 16, zIndex: 30 }}
                    className="bg-black/50 p-2 rounded-full border border-white/20"
                >
                    <Feather name="arrow-left" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Follow & Message Buttons */}
            {profile._id !== myId && (
                <View className="flex-row items-center justify-center space-x-3 px-6 mt-4 mb-2">
                    <FollowButton userId={profile._id} />
                    <TouchableOpacity
                        onPress={handleMessage}
                        disabled={accessConvMutation.isPending}
                        className="bg-card-selected px-5 py-2.5 rounded-full border border-btn/30 flex-row items-center"
                    >
                        <Feather name="message-square" size={16} color="#6437ff" />
                        <Text
                            style={{ fontFamily: "SpaceMono" }}
                            className="text-text font-bold text-xs ml-2"
                        >
                            Message
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ProfileActivityView
                postsCount={profile.postsCount}
                followingCount={profile.followingCount}
                followersCount={profile.followersCount}
                onFollowingPress={() =>
                    router.push({
                        pathname: "/FollowList",
                        params: {
                            id: profile._id,
                            initialTab: "following",
                            username: profile.username
                        }
                    })
                }
                onFollowersPress={() =>
                    router.push({
                        pathname: "/FollowList",
                        params: {
                            id: profile._id,
                            initialTab: "followers",
                            username: profile.username
                        }
                    })
                }
            />

            {/* Section header */}
            <View
                className="flex-row items-center px-4"
                style={{ marginTop: 20, marginBottom: 12 }}
            >
                <Text
                    style={{
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 1.5
                    }}
                    className="text-text-secondary/50"
                >
                    POSTS
                </Text>
            </View>

            <PostsGrid postsQuery={postsQuery} />

            <View style={{ height: 120 }} />
        </ScrollView>
    );
};

export default UserProfile;
