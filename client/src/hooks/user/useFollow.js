import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { followUser, unfollowUser } from "../../controllers/user/user.controller.js";
import { useFollowStore } from "../../store/follow.store.js";
import { useUser } from "../../store/user.store.js";

export const useFollow = (userId) => {
    // Select granular state slices to prevent unnecessary re-renders
    const isFollowing = useFollowStore((s) => s.states[userId] ?? false);
    const setFollowing = useFollowStore((s) => s.setFollowing);

    const incrementFollowing = useUser((s) => s.incrementFollowing);
    const decrementFollowing = useUser((s) => s.decrementFollowing);

    const mutation = useMutation({
        mutationFn: async (currentlyFollowing) => {
            return currentlyFollowing
                ? unfollowUser(userId)
                : followUser(userId);
        },

        onMutate: async (currentlyFollowing) => {
            // 1. Haptic feedback on tap
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // 2. Snapshot previous state for rollback
            const previousIsFollowing = currentlyFollowing;
            const nextIsFollowing = !currentlyFollowing;

            // 3. Apply optimistic UI state immediately
            setFollowing(userId, nextIsFollowing);
            if (nextIsFollowing) {
                incrementFollowing();
            } else {
                decrementFollowing();
            }

            // Pass snapshot context to onError
            return { previousIsFollowing };
        },

        onError: (err, currentlyFollowing, context) => {
            // Revert to the snapshot state if the API call fails
            if (!context) return;

            const { previousIsFollowing } = context;
            setFollowing(userId, previousIsFollowing);

            if (previousIsFollowing) {
                incrementFollowing();
            } else {
                decrementFollowing();
            }
        },

        onSuccess: (res) => {
            // Sync with backend source-of-truth if available
            if (res?.success && typeof res.isFollowing === "boolean") {
                setFollowing(userId, res.isFollowing);
            }
        },
    });

    const toggle = () => {
        // Prevent trigger while mutation is in-flight
        if (mutation.isPending) return;
        mutation.mutate(isFollowing);
    };

    return {
        isFollowing,
        isPending: mutation.isPending,
        toggle,
    };
};
