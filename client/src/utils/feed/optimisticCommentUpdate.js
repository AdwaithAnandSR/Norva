export const optimisticCommentUpdate = ({
    qc,
    postId,
    replyingTo,
    newComment
}) => {
    // ==========================================
    // CASE 1: Top-Level Comment
    // ==========================================
    if (!replyingTo?._id) {
        qc.setQueryData(["comments", postId], old => {
            if (!old?.pages) return old;

            return {
                ...old,
                pages: old.pages.map((page, index) => {
                    // Prepend to page 0 (Newest-first)
                    if (index !== 0) return page;

                    return {
                        ...page,
                        comments: [newComment, ...(page.comments || [])]
                    };
                })
            };
        });
        return;
    }

    // ==========================================
    // CASE 2: Reply Comment
    // ==========================================
    const parentId = replyingTo._id;

    // A. Update or initialize the replies query cache
    qc.setQueryData(["replies", parentId], old => {
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

        // Replies are oldest-first -> append to the last page
        const updatedPages = [...old.pages];
        const lastIndex = updatedPages.length - 1;

        updatedPages[lastIndex] = {
            ...updatedPages[lastIndex],
            replies: [...(updatedPages[lastIndex].replies || []), newComment]
        };

        return {
            ...old,
            pages: updatedPages
        };
    });

    // B. Increment `repliesCount` on the parent comment in main list
    qc.setQueryData(["comments", postId], old => {
        if (!old?.pages) return old;

        return {
            ...old,
            pages: old.pages.map(page => ({
                ...page,
                comments: page.comments.map(comment =>
                    comment._id === parentId
                        ? {
                              ...comment,
                              repliesCount: (comment.repliesCount || 0) + 1
                          }
                        : comment
                )
            }))
        };
    });
};
