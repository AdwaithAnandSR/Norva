import express from "express";
import { generateUploadSignature, deleteAsset } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/signature", async (req, res) => {
    const { folder = "default" } = req.body;
    const data = await generateUploadSignature(folder);

    res.json({ data });
});

router.post("/delete", async (req, res) => {
    try {
        const { publicId } = req.body;

        if (!publicId)
            return res.json({
                success: false,
                message: "You must provide publicId of the asset to be deleted"
            });

        const result = await deleteAsset(req.params.publicId, "image");

        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;
