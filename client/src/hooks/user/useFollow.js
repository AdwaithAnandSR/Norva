import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import {
    followUser,
    unfollowUser
} from "../../controllers/user/user.controller.js";
import { useFollowStore } from "../../store/follow.store.js";

export const useFollow = userId => {
    const states = useFollowStore(s => s.states);
    const setFollowing = useFollowStore(s => s.setFollowing);

    const isFollowing = states[userId] ?? false;

    const mutation = useMutation({
        mutationFn: () =>
            isFollowing ? unfollowUser(userId) : followUser(userId),

        onMutate: () => {
            setFollowing(userId, !isFollowing);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },

        onSuccess: res => {
            if (res.success) setFollowing(userId, res.isFollowing);
        },

        onError: () => {
            setFollowing(userId, isFollowing);
        }
    });

    return {
        isFollowing,
        toggle: mutation.mutate,
        isPending: mutation.isPending
    };
};
