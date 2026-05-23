import axios from "../../utils/axios.js";

export const createPost = async ({ title, description, tags, media }) => {
    try {
        
        const { data } = await axios.post("/post/create", {
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
