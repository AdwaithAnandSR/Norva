import mongoose from "mongoose";

const tokenSchema = mongoose.Schema(
    {
        jti: {
            type: String,
            required: true,
            unique: true
        },
        hash: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        revoke: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('token', tokenSchema)