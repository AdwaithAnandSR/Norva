import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "conversation",
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        text: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        isDeliveredTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],
        isReadBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ]
    },
    {
        timestamps: true
    }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("message", messageSchema);
