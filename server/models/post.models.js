import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true 
        },
        description: String,
        tags:[{
            type: String,
            trim: true,
            lowercase: true
        }],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        mediaType: {
            type: String,
            enum: ["image", "video"]
        },
        mediaUrl: {
            type: String,
            required: true
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            }
        ],
        
    },
    { timestamp: true }
);

// postSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("post", postSchema);
