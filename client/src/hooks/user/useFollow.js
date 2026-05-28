import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import {
    followUser,
    unfollowUser
} from "../../controllers/user/user.controller.js";

import { useFollowStore } from "../../store/follow.store.js";
import { useUser } from "../../store/user.store.js";

export const useFollow = userId => {
    const states = useFollowStore(s => s.states);
    const pending = useFollowStore(s => s.pending);

    const setFollowing = useFollowStore(s => s.setFollowing);
    const setPending = useFollowStore(s => s.setPending);

    const incrementFollowing = useUser(s => s.incrementFollowing);
    const decrementFollowing = useUser(s => s.decrementFollowing);

    const isFollowing = states[userId] ?? false;
    const isPending = pending[userId] ?? false;

    const mutation = useMutation({
        mutationFn: async () => {
            return isFollowing
                ? unfollowUser(userId)
                : followUser(userId);
        },

        onMutate: async () => {
            setPending(userId, true);

            setFollowing(userId, !isFollowing);

            isFollowing
                ? decrementFollowing()
                : incrementFollowing();

            Haptics.impactAsync(
                Haptics.ImpactFeedbackStyle.Light
            );
        },

        onSuccess: res => {
            if (res?.success) {
                setFollowing(userId, res.isFollowing);
            }
        },

        onError: () => {
            setFollowing(userId, isFollowing);

            isFollowing
                ? incrementFollowing()
                : decrementFollowing();
        },

        onSettled: () => {
            setPending(userId, false);
        }
    });

    const toggle = () => {
        if (isPending) return;

        mutation.mutate();
    };

    return {
        isFollowing,
        isPending,
        toggle
    };
};