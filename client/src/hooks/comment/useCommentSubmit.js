import { Keyboard } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { createComment } from "../../controllers/post/comment.controller.js";
import { optimisticCommentUpdate } from "../../utils/feed/optimisticCommentUpdate.js";
import { useApp } from "../../store/app.store.js";

const setToast = useApp.getState().setToast;

export const useCommentSubmit = ({
    postId,
    text,
    replyingTo,
    resetInput,
    onCommentAdded,
    expandRepliesFor
}) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () =>
            createComment({
                postId,
                content: text.trim(),
                parentId: replyingTo?._id ?? null
            }),

        onSuccess: res => {
            if (!res.success) return;
            setToast("green=>Commented");

            // 1. Safely normalize the comment object with defaults
            const newComment = {
                ...res.comment,
                likedByMe: res.comment.likedByMe ?? false,
                likesCount: res.comment.likesCount ?? 0,
                repliesCount: res.comment.repliesCount ?? 0
            };

            const targetParentId = replyingTo?._id;

            // 2. Expand reply thread if replying to a comment
            if (targetParentId) {
                expandRepliesFor?.(targetParentId);
            }

            // 3. Single cache update call
            optimisticCommentUpdate({
                qc,
                postId,
                replyingTo,
                newComment
            });

            // 4. Update parent post comment count in feed if top-level
            if (!replyingTo) {
                qc.setQueryData(["feed"], old => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(p =>
                                p._id === postId
                                    ? {
                                          ...p,
                                          commentsCount:
                                              (p.commentsCount || 0) + 1
                                      }
                                    : p
                            )
                        }))
                    };
                });
            }

            resetInput();
            Keyboard.dismiss();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCommentAdded?.();
        }
    });
};
