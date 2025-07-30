import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Token from "../../models/token.model.js";
import { genToken } from "../../utils/genToken.js";

const refreshTokens = async (req, res) => {
    const { refreshToken } = req.body;
    let payload;

    if (!refreshToken)
        return res.status(401).json({ message: "TOKEN_NOT_FOUND" });

    try {
        payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "INVALID_REFRESH_TOKEN" });
    }

    const { jti, userId, role } = payload;
    const tokenDoc = await Token.findOne({ jti });

    if (!tokenDoc || tokenDoc?.revoked) {
        return res.status(401).json({ message: "INVALID_REFRESH_TOKEN" });
    }

    const isTokenMatch = await bcrypt.compare(refreshToken, tokenDoc.hash);
    if (!isTokenMatch) {
        console.error("Token not matches, suspecting token theft🛑⚠️");
        await Token.updateMany({ userId }, { revoked: true });
        return res.status(401).json({ message: "SUSPECT_TOKEN_THEFT" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await genToken({
        userId,
        role
    });

    tokenDoc.revoked = true;
    await tokenDoc.save();

    return res.status(200).json({
        message: "TOKEN_GENERATED",
        accessToken,
        refreshToken: newRefreshToken
    });
};

export default refreshTokens;
