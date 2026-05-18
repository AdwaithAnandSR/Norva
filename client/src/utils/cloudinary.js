import axios from "../utils/axios";

export const uploadToCloudinary = async file => {
    try {
        const { data: signData } = await axios.post("/file/signature", {
            folder: "posts"
        });
        
        console.log(signData)

        const formData = new FormData();

        formData.append("file", {
            uri: file.uri,
            type: file.mimeType,
            name: file.name || `upload.${file.uri.split(".").pop()}`
        });

        formData.append("api_key", signData.apiKey);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        return {
            success: true,
            mediaType: data.resource_type === "video" ? "video" : "image",
            url: data.secure_url,
            mediaPublicId: data.public_id
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            error
        };
    }
};
