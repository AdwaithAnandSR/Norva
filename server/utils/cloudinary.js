import crypto from "crypto";
import cloudinary from "../config/cloudinary.config.js";

export const generateUploadSignature = folder => {
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        timestamp,
        folder,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY
    };
};

export const deleteAsset = async (publicId, resourceType = null) => {
    try {
        if (resourceType)
            return await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType
            });

        const resourceTypes = ["image", "video", "raw"];

        for (const type of resourceTypes) {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: type
            });

            if (result.result === "ok")
                return {
                    ...result,
                    resource_type: type
                };
        }

        return {
            result: "not found"
        };
    } catch (error) {
        throw error;
    }
};
