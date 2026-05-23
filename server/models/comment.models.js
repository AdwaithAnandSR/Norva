import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        likesCount: {
            type: Number,
            default: 0
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],

        // null = top-level comment, set = reply
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment",
            default: null,
            index: true
        },

        repliesCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Newest-first pagination per post
commentSchema.index({ postId: 1, createdAt: -1, _id: -1 });

export default mongoose.model("comment", commentSchema);
