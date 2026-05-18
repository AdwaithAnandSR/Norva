import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Token from "../../models/token.model.js";
import { genToken } from "../../utils/genToken.js";

const refreshTokens = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        console.log("refreshing ")

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "TOKEN_NOT_FOUND"
            });
        }

        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const { jti, userId, role } = payload;

        if (!jti || !userId) {
            return res.status(401).json({
                success: false,
                message: "INVALID_REFRESH_TOKEN"
            });
        }

        const tokenDoc = await Token.findOne({
            jti,
            revoked: false
        });

        if (!tokenDoc) {
            return res.status(401).json({
                success: false,
                message: "INVALID_REFRESH_TOKEN"
            });
        }

        const isTokenMatch = await bcrypt.compare(refreshToken, tokenDoc.hash);

        if (!isTokenMatch) {
            await Token.updateMany(
                { userId },
                {
                    $set: { revoked: true }
                }
            );

            return res.status(401).json({
                success: false,
                message: "INVALID_REFRESH_TOKEN"
            });
        }

        // Atomic revoke AFTER validation
        const revokedDoc = await Token.findOneAndUpdate(
            {
                _id: tokenDoc._id,
                revoked: false
            },
            {
                $set: {
                    revoked: true
                }
            }
        );

        if (!revokedDoc) {
            return res.status(401).json({
                success: false,
                message: "TOKEN_ALREADY_USED"
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = await genToken({
            userId,
            role
        });

        return res.status(200).json({
            success: true,
            message: "TOKEN_REFRESHED",
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error("Refresh token error:", error);

        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message: "INVALID_REFRESH_TOKEN"
            });
        }

        return res.status(500).json({
            success: false,
            message: "SERVER_ERROR"
        });
    }
};

export default refreshTokens;
