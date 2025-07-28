import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

import Token from "../models/token.model.js";

export const genAccessToken = payload => {
    return jwt.sign({ ...payload }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15s"
    });
};

export const genRefreshToken = (payload, jti) => {
    return jwt.sign({ ...payload, jti }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "15d"
    });
};

export const genToken = async payload => {
    try {
        if (!payload || !payload.userId) return;

        const jti = uuid();
        const accessToken = genAccessToken(payload);
        const refreshToken = genRefreshToken(payload, jti);

        if (!accessToken || !refreshToken)
            return console.error("Failed to generate jwt tokens");

        const hash = await bcrypt.hash(refreshToken, 10);

        await Token.create({
            jti,
            hash,
            userId: payload.userId
        });

        return { accessToken, refreshToken };
    } catch (err) {
        console.log(`Error while generating tokens: ${err}`);
    }
};
