import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        fullname: String,
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("user", userSchema);
