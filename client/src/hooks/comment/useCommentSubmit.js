import { Keyboard } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { createComment } from "../../controllers/post/comment.controller.js";
import { optimisticCommentUpdate } from "../../utils/feed/optimisticCommentUpdate.js";

export const useCommentSubmit = ({
    postId,
    text,
    replyingTo,
    resetInput,
    onCommentAdded
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

            const newComment = {
                ...res.comment,
                likedByMe: false
            };

            optimisticCommentUpdate({
                qc,
                postId,
                replyingTo,
                newComment
            });

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
                                          commentsCount: p.commentsCount + 1
                                      }
                                    : p
                            )
                        }))
                    };
                });
            }

            resetInput();
            Keyboard.dismiss();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onCommentAdded?.();
        }
    });
};
