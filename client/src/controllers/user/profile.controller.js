import api from "../../utils/axios.js";

export const getMyProfile = async () => {
    const { data } = await api.get("/user/me");
    return data; // { success, user: { fullname, username, followersCount, followingCount, postsCount } }
};

export const getMyPosts = async ({ cursor = null, limit = 12 } = {}) => {
    const params = { limit };
    if (cursor) params.cursor = JSON.stringify(cursor);
    const { data } = await api.get("/user/me/posts", { params });
    return data; // { success, posts, nextCursor, hasMore }
};

export const updateProfile = async ({ fullname, username }) => {
    const { data } = await api.patch("/user/me", { fullname, username });
    return data; // { success, user }
};

export const getProfile = async id => {
    const { data } = await api.get(`/user/${id}`);
    return data; // { success, user: { fullname, username, followersCount, followingCount, postsCount } }
};

export const getPosts = async ({ cursor = null, limit = 12, id } = {}) => {
    const params = { limit: 15 };
    if (cursor) params.cursor = JSON.stringify(cursor);
    const { data } = await api.get(`/user/${id}/posts`, { params });
    return data;
};
