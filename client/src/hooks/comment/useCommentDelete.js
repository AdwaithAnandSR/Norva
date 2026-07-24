import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { deleteComment } from "../../controllers/post/comment.controller.js";

export const useCommentDelete = ({ postId, parentId = null }) => {
    const qc = useQueryClient();
    // Normalize postId in case an object was passed
    const cleanPostId = typeof postId === "object" ? postId?._id : postId;

    return useMutation({
        mutationFn: commentId => deleteComment(commentId),

        onSuccess: (_, commentId) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (!parentId) {
                qc.setQueryData(["comments", cleanPostId], old => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            comments: page.comments.filter(
                                c => c._id !== commentId
                            )
                        }))
                    };
                });

                // Decrement post comment count in feed
                qc.setQueryData(["feed"], old => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(p =>
                                p._id === cleanPostId
                                    ? {
                                          ...p,
                                          commentsCount: Math.max(
                                              0,
                                              p.commentsCount - 1
                                          )
                                      }
                                    : p
                            )
                        }))
                    };
                });

                // Safety refetch to guarantee UI sync
                qc.invalidateQueries({ queryKey: ["comments", cleanPostId] });
            } else {
                qc.setQueryData(["replies", parentId], old => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            replies: page.replies.filter(
                                r => r._id !== commentId
                            )
                        }))
                    };
                });

                qc.setQueryData(["comments", cleanPostId], old => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            comments: page.comments.map(c =>
                                c._id === parentId
                                    ? {
                                          ...c,
                                          repliesCount: Math.max(
                                              0,
                                              (c.repliesCount || 1) - 1
                                          )
                                      }
                                    : c
                            )
                        }))
                    };
                });

                qc.invalidateQueries({ queryKey: ["replies", parentId] });
            }
        }
    });
};
