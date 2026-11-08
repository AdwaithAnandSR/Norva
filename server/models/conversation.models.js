import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true
            }
        ],
        isGroup: {
            type: Boolean,
            default: false
        },
        groupName: {
            type: String,
            default: ""
        },
        groupAvatar: {
            type: String,
            default: ""
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message"
        },
        // Object mapping userId string -> number of unread messages
        unreadCount: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model("conversation", conversationSchema);
