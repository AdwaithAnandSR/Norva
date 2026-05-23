import api from "../../utils/axios.js";

export const createPost = async ({ title, description, tags, media }) => {
    try {
        const { data } = await api.post("/post/create", {
            title,
            description,
            tags,
            ...media
        });

        return true;
    } catch (error) {
        console.log(error);

        return false;
    }
};

export const fetchFeed = async ({ cursor = null, limit = 10 } = {}) => {
    const { data } = await api.post("/post/getFeed", {
        cursor,
        limit
    });
    return data; // { success, posts, nextCursor, hasMore }
};

export const deletePost = async postId => {
    const { data } = await api.delete(`/post/${postId}`);
    
    console.log("data ", data)
    return data; // { success }
};

export const editPost = async (postId, { title, description, tags }) => {
    const { data } = await api.patch(`/post/${postId}`, {
        title,
        description,
        tags
    });
    return data; // { success, post }
};

export const incrementView = async postId => {
    await api.post(`/post/${postId}/view`);
};

export const setLike = async (postId, shouldLike) => {
    const response = shouldLike
        ? await api.post(`/post/like/${postId}`)
        : await api.delete(`/post/like/${postId}`);

    return response.data;
};
