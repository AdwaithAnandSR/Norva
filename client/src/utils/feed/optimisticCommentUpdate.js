export const optimisticCommentUpdate = ({
    qc,
    postId,
    replyingTo,
    newComment
}) => {
    qc.setQueryData(["comments", postId], old => {
        if (!old?.pages) return old;

        if (replyingTo?._id) {
            return {
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    comments: page.comments.map(comment => {
                        if (comment._id === replyingTo._id) {
                            return {
                                ...comment,
                                repliesCount: (comment.repliesCount || 0) + 1
                            };
                        }

                        return comment;
                    })
                }))
            };
        }

        return {
            ...old,
            pages: old.pages.map((page, index) => {
                if (index !== 0) {
                    return page;
                }

                return {
                    ...page,
                    comments: [newComment, ...page.comments]
                };
            })
        };
    });

    if (replyingTo?._id) {
        qc.setQueryData(["replies", replyingTo._id], old => {
            if (!old?.pages) return old;

            return {
                ...old,
                pages: old.pages.map((page, index) => {
                    if (index !== 0) {
                        return page;
                    }

                    return {
                        ...page,
                        replies: [newComment, ...page.replies]
                    };
                })
            };
        });
    }
};
