import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { followUser, unfollowUser } from "../../controllers/user/user.controller.js";
import { useFollowStore } from "../../store/follow.store.js";
import { useUser } from "../../store/user.store.js";

export const useFollow = userId => {
    const states = useFollowStore(s => s.states);
    const setFollowing = useFollowStore(s => s.setFollowing);
    const incrementFollowing = useUser(s => s.incrementFollowing);
    const decrementFollowing = useUser(s => s.decrementFollowing);

    const isFollowing = states[userId] ?? false;

    const pending = useFollowStore(s => s.pending);
    const setPending = useFollowStore(s => s.setPending);
    
    const isPending = pending[userId] ?? false;
    
    const mutation = useMutation({
        mutationFn: () => {
            if (isPending) return Promise.resolve(null);
            return isFollowing ? unfollowUser(userId) : followUser(userId);
        },
    
        onMutate: () => {
            setPending(userId, true);
            setFollowing(userId, !isFollowing);
            isFollowing ? decrementFollowing() : incrementFollowing();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
    
        onSuccess: res => {
            if (res?.success) setFollowing(userId, res.isFollowing);
            setPending(userId, false);
        },
    
        onError: () => {
            setFollowing(userId, isFollowing);
            isFollowing ? incrementFollowing() : decrementFollowing();
            setPending(userId, false);
        }
    });
    
    return {
        isFollowing,
        toggle: mutation.mutate,
        isPending
    };
};