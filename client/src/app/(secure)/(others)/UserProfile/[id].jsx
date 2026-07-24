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

import {
    useUserProfile,
    useUserPosts
} from "../../../../hooks/user/useProfileQuery.js";
import { useUser } from "../../../../store/user.store.js";
import { useFollowStore } from "../../../../store/follow.store.js";

import InitialsAvatar from "../../../../components/search/InitialsAvatar.jsx";
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
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-4"
                style={{ marginTop: 56, marginBottom: 20 }}
            >
                <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                    <Feather name="arrow-left" size={22} color="#c4c4e0" />
                </TouchableOpacity>
                <Text
                    numberOfLines={1}
                    className="text-text"
                    style={{ fontFamily: "WinkyRoughExtraBold", fontSize: 16 }}
                >
                    @{profile.username}
                </Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Identity */}
            <View className="items-center px-6" style={{ marginBottom: 20 }}>
                <InitialsAvatar
                    fullname={profile.fullname || profile.username}
                    size={84}
                />
                <Text
                    numberOfLines={1}
                    className="text-text-secondary mt-3"
                    style={{ fontFamily: "WinkyRoughExtraBold", fontSize: 22 }}
                >
                    {profile.fullname || profile.username}
                </Text>
                <Text className="text-text/60 font-semibold text-base">
                    @{profile.username}
                </Text>

                {profile._id !== myId && (
                    <View style={{ marginTop: 14 }}>
                        <FollowButton userId={profile._id} />
                    </View>
                )}
            </View>

            <ProfileActivityView
                postsCount={profile.postsCount}
                followingCount={profile.followingCount}
                followersCount={profile.followersCount}
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
