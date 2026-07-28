import ORGAxios from "axios";
import axios from "../utils/axios";

export const uploadToCloudinary = async (file, onProgress, folder = "posts") => {
    try {
        const { data: signData } = await axios.post("/file/signature", {
            folder
        });

        const formData = new FormData();

        const asset = file.assets?.[0] || file;
        const uri = asset.uri;
        const type = asset.mimeType || asset.type || "image/jpeg";
        const name = asset.name || `upload.${uri.split(".").pop()}`;

        formData.append("file", {
            uri,
            type,
            name
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
        
        return {
            success: false,
            error
        };
    }
};
