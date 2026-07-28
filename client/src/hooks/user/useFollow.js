import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import {
    followUser,
    unfollowUser
} from "../../controllers/user/user.controller.js";
import { useFollowStore } from "../../store/follow.store.js";
import { useUser } from "../../store/user.store.js";
import { useApp } from "../../store/app.store.js";

const setToast = useApp.getState().setToast;

export const useFollow = userId => {
    const qc = useQueryClient();

    // Select granular state slices to prevent unnecessary re-renders
    const isFollowing = useFollowStore(s => s.states[userId] ?? false);
    const setFollowing = useFollowStore(s => s.setFollowing);

    const incrementFollowing = useUser(s => s.incrementFollowing);
    const decrementFollowing = useUser(s => s.decrementFollowing);

    const mutation = useMutation({
        mutationFn: async currentlyFollowing => {
            console.log(`[useFollow] Triggering ${currentlyFollowing ? "unfollow" : "follow"} API call for target userId: ${userId}`);
            return currentlyFollowing
                ? unfollowUser(userId)
                : followUser(userId);
        },

        onMutate: async currentlyFollowing => {
            console.log(`[useFollow] onMutate: currentlyFollowing=${currentlyFollowing}, toggling to ${!currentlyFollowing} for target userId: ${userId}`);
            // 1. Haptic feedback on tap
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // 2. Snapshot previous state for rollback
            const previousIsFollowing = currentlyFollowing;
            const nextIsFollowing = !currentlyFollowing;

            // 3. Apply optimistic UI state immediately
            setFollowing(userId, nextIsFollowing);
            if (nextIsFollowing) {
                setToast("green=>Followed");
                incrementFollowing();
            } else {
                setToast("green=>Unfollowed");
                decrementFollowing();
            }

            // Optimistically update target user profile cache
            qc.setQueryData(["profile", userId], old => {
                if (!old?.user) return old;
                const cur = old.user.followersCount ?? 0;
                return {
                    ...old,
                    user: {
                        ...old.user,
                        followersCount: nextIsFollowing ? cur + 1 : Math.max(0, cur - 1),
                        isFollowing: nextIsFollowing
                    }
                };
            });

            // Optimistically update "me" profile cache
            qc.setQueryData(["profile", "me"], old => {
                if (!old?.user) return old;
                const cur = old.user.followingCount ?? 0;
                return {
                    ...old,
                    user: {
                        ...old.user,
                        followingCount: nextIsFollowing ? cur + 1 : Math.max(0, cur - 1)
                    }
                };
            });

            // Pass snapshot context to onError
            return { previousIsFollowing };
        },

        onError: (err, currentlyFollowing, context) => {
            console.error(`[useFollow] Follow mutation failed for target userId: ${userId}:`, err);
            // Revert to the snapshot state if the API call fails
            if (!context) return;
            setToast("red=>Failed");

            const { previousIsFollowing } = context;
            setFollowing(userId, previousIsFollowing);

            if (previousIsFollowing) {
                incrementFollowing();
            } else {
                decrementFollowing();
            }

            qc.invalidateQueries({ queryKey: ["profile"] });
        },

        onSuccess: res => {
            console.log(`[useFollow] Follow mutation succeeded for target userId: ${userId}. Response:`, JSON.stringify(res, null, 2));
            // Sync with backend source-of-truth if available
            if (res?.success && typeof res.isFollowing === "boolean") {
                setFollowing(userId, res.isFollowing);
            }
            qc.invalidateQueries({ queryKey: ["profile"] });
            qc.invalidateQueries({ queryKey: ["followers"] });
            qc.invalidateQueries({ queryKey: ["following"] });
        }
    });

    const toggle = () => {
        // Prevent trigger while mutation is in-flight
        if (mutation.isPending) return;
        mutation.mutate(isFollowing);
    };

    return {
        isFollowing,
        isPending: mutation.isPending,
        toggle
    };
};
