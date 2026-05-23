import api from "../../utils/axios.js";

/**
 * Fetches a page of feed posts.
 * @param {object|null} cursor - { createdAt, _id } of last seen post, or null for first page
 * @param {number} limit
 * @returns {{ posts, nextCursor, hasMore }}
 */
export const fetchFeed = async ({ cursor = null, limit = 10 } = {}) => {
    const { data } = await api.post("/post/getFeed", {
        cursor,
        limit
    });
    return data; // { success, posts, nextCursor, hasMore }
};

/**
 * Toggle like on a post.
 * @param {string} postId
 * @returns {{ liked: boolean, likesCount: number }}
 */
export const toggleLike = async postId => {
    const { data } = await api.post(`/post/like/${postId}`);
    return data;
};

export const setLike = async (postId, shouldLike) => {
    const response = shouldLike
        ? await api.post(`/post/like/${postId}`)
        : await api.delete(`/post/like/${postId}`);

    return response.data;
};
