import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 220
        },

        description: {
            type: String,
            trim: true,
            maxlength: 3000
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true
            }
        ],

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },

        mediaType: {
            type: String,
            enum: ["image", "video"]
        },

        url: {
            type: String
        },

        mediaPublicId: {
            type: String
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],

        likesCount: {
            type: Number,
            default: 0
        },

        commentsCount: {
            type: Number,
            default: 0
        },
        
        views: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

        viewsCount: {
            type: Number,
            default: 0
        },

        isEdited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

postSchema.index({ userId: 1, createdAt: -1 });

postSchema.index({ tags: 1 });

export default mongoose.model("post", postSchema);
