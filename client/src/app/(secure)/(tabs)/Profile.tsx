import { useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useUser } from "../../../store/user.store.js";
import { useMyProfile, useMyPosts } from "../../../hooks/user/useProfileQuery.js";

import ProfileImageView from "../../../components/profile/ProfileImageView.jsx";
import ProfileActivityView from "../../../components/profile/ProfileActivityView.jsx";
import QuickButtons from "../../../components/profile/QuickButtons.jsx";
import PostsGrid from "../../../components/profile/PostGrid.jsx";

const Profile = () => {
    const updateStats = useUser(state => state.updateStats);
    const updateProfile = useUser(state => state.updateProfile);

    const profileQuery = useMyProfile();
    const postsQuery   = useMyPosts();

    const profile = profileQuery.data?.user;
    const posts   = postsQuery.data?.pages.flatMap(p => p.posts) ?? [];

    // Sync profile stats and details into Zustand so other screens have them
    useEffect(() => {
        if (profile) {
            updateStats({
                followersCount: profile.followersCount,
                followingCount: profile.followingCount,
                postsCount:     profile.postsCount
            });
            updateProfile({
                fullname: profile.fullname,
                username: profile.username,
                profileImage: profile.profileImage,
                backgroundImage: profile.backgroundImage
            });
        }
    }, [profile]);

    const handleRefresh = () => {
        profileQuery.refetch();
        postsQuery.refetch();
    };

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
            {/* Cover + Avatar */}
            <ProfileImageView />

            {/* Top gradient overlay */}
            <LinearGradient
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "25%"
                }}
                colors={["#05070ddd", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                pointerEvents="none"
            />

            {/* Stats row */}
            <ProfileActivityView
                postsCount={profile?.postsCount}
                followingCount={profile?.followingCount}
                followersCount={profile?.followersCount}
                onFollowingPress={() =>
                    router.push({
                        pathname: "/FollowList",
                        params: {
                            id: profile?._id,
                            initialTab: "following",
                            username: profile?.username
                        }
                    })
                }
                onFollowersPress={() =>
                    router.push({
                        pathname: "/FollowList",
                        params: {
                            id: profile?._id,
                            initialTab: "followers",
                            username: profile?.username
                        }
                    })
                }
            />

            {/* Edit + Create buttons */}
            <QuickButtons hasNoPosts={posts.length === 0} />

            {/* Divider */}
            <View
                style={{
                    marginHorizontal: 24,
                    marginTop: 20,
                    marginBottom: 14,
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.05)"
                }}
            />

            {/* Section header */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    marginBottom: 12
                }}
            >
                <Text
                    style={{
                        color: "rgba(196,196,224,0.5)",
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 1.5
                    }}
                >
                    POSTS
                </Text>
                <TouchableOpacity onPress={() => router.push("/CreatePost")}>
                    <Feather name="plus-circle" size={20} color="#6437ff" />
                </TouchableOpacity>
            </View>

            {/* Posts grid */}
            <PostsGrid postsQuery={postsQuery} />

            {/* Bottom padding */}
            <View style={{ height: 120 }} />
        </ScrollView>
    );
};

export default Profile;