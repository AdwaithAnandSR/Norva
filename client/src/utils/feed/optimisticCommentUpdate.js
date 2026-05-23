export const optimisticCommentUpdate = ({
    qc,
    postId,
    replyingTo,
    newComment
}) => {
    qc.setQueryData(["comments", postId], old => {
        
        if (!old?.pages) return old;
        if (replyingTo?._id) {
            qc.setQueryData(["replies", replyingTo._id], old => {
                if (!old?.pages) {
                    return {
                        pages: [
                            {
                                replies: [newComment],
                                hasMore: false,
                                nextCursor: null
                            }
                        ],
                        pageParams: [null]
                    };
                }

                return {
                    ...old,
                    pages: old.pages.map((page, index) => {
                        if (index !== 0) return page;
                        return {
                            ...page,
                            replies: [newComment, ...page.replies]
                        };
                    })
                };
            });
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
