import api from "../../utils/axios.js";

/**
 * Fetch top-level comments for a post (cursor-paginated).
 * @param {string} postId
 * @param {{ createdAt, _id } | null} cursor
 * @param {number} limit
 */
export const fetchComments = async ({ postId, cursor = null, limit = 20 }) => {
    const params = { limit };
    if (cursor) params.cursor = JSON.stringify(cursor);
    const { data } = await api.get(`/post/${postId}/comments`, { params });
    return data; // { success, comments, nextCursor, hasMore }
};

/**
 * Post a new comment (or reply if parentId provided).
 * @param {string} postId
 * @param {string} content
 * @param {string|null} parentId
 */
export const createComment = async ({ postId, content, parentId = null }) => {
    const { data } = await api.post(`/post/${postId}/comments`, {
        content,
        parentId
    });
    return data; // { success, comment }
};

/**
 * Toggle like on a comment.
 * @param {string} commentId
 */
export const toggleCommentLike = async commentId => {
    const { data } = await api.post(`/post/comment/${commentId}/like`);
    return data; // { success, liked, likesCount }
};

/**
 * Fetch replies for a comment (oldest-first, cursor-paginated).
 * @param {string} commentId
 * @param {{ createdAt, _id } | null} cursor
 * @param {number} limit
 */
export const fetchReplies = async ({
    commentId,
    cursor = null,
    limit = 10
}) => {
    const params = { limit };
    if (cursor) params.cursor = JSON.stringify(cursor);
    const { data } = await api.get(`/post/comment/${commentId}/replies`, {
        params
    });
    return data; // { success, replies, nextCursor, hasMore }
};
