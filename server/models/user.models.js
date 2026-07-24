import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true
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
        followingCount: { type: Number, default: 0 },

        // Instagram-style "recent searches" — capped list of users this account searched for
        recentSearches: [
            {
                _id: false,
                user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
                searchedAt: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

userSchema.index({ fullname: 1 });

export default mongoose.model("user", userSchema);
