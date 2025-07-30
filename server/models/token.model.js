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
        revoked: {
            type: Boolean,
            default: false
        },
        expiresIn:{
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('token', tokenSchema)