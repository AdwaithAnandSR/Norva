export const createPost = async ({ title, description, tags, media }) => {
    try {
        const { data } = await axios.post("/posts", {
            title,
            description,
            tags,
            media
        });

        return true;
    } catch (error) {
        console.log(error);

        return false;
    }
};
