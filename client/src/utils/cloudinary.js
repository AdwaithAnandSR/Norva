import ORGAxios from "axios";
import axios from "../utils/axios";

export const uploadToCloudinary = async (file, onProgress) => {
    try {
        const { data: signData } = await axios.post("/file/signature", {
            folder: "posts"
        });

        const formData = new FormData();

        formData.append("file", {
            uri: file.assets[0].uri,
            type: file.assets[0].mimeType,
            name:
                file.assets[0].name ||
                `upload.${file.assets[0].uri.split(".").pop()}`
        });

        formData.append("api_key", signData.data.apiKey);
        formData.append("timestamp", signData.data.timestamp);
        formData.append("signature", signData.data.signature);
        formData.append("folder", signData.data.folder);

        const { data } = await ORGAxios.post(
            `https://api.cloudinary.com/v1_1/${signData.data.cloudName}/auto/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },

                onUploadProgress: progressEvent => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    onProgress?.(percent);
                }
            }
        );

        return {
            success: true,
            mediaType: data.resource_type === "video" ? "video" : "image",
            url: data.secure_url,
            mediaPublicId: data.public_id
        };
    } catch (error) {
        console.log(error);
        console.log(error?.response?.data);

        return {
            success: false,
            error
        };
    }
};
