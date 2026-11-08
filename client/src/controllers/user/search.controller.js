import api from "../../utils/axios.js";

export const searchUsers = async q => {
    const { data } = await api.get("/user/search", { params: { q } });
    return data; // { success, users: [{ _id, username, fullname, followersCount, isFollowing }] }
};

export const getRecentSearches = async () => {
    const { data } = await api.get("/user/search/recent");
    return data; // { success, users: [{ _id, username, fullname, followersCount, searchedAt }] }
};

export const addRecentSearch = async userId => {
    const { data } = await api.post(`/user/search/recent/${userId}`);
    return data; // { success }
};

export const removeRecentSearch = async userId => {
    const { data } = await api.delete(`/user/search/recent/${userId}`);
    return data; // { success }
};

export const clearRecentSearches = async () => {
    const { data } = await api.delete("/user/search/recent");
    return data; // { success }
};
