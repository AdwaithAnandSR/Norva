import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

import Token from "../models/token.model.js";

export const genAccessToken = (payload, jti) => {
    return jwt.sign({ ...payload, jti }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1h"
    });
};

export const genRefreshToken = (payload, jti) => {
    return jwt.sign({ ...payload, jti }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "15d"
    });
};

export const genToken = async payload => {
    try {
        if (!payload || !payload.userId || !payload.role) {
            return console.error(
                "invalid payload for token generaing\npayload: ",
                payload
            );
        }

        const jti = uuid();
        const accessToken = genAccessToken(payload, jti);
        const refreshToken = genRefreshToken(payload, jti);

        if (!accessToken || !refreshToken)
            return console.error("Failed to generate jwt tokens");

        const hash = await bcrypt.hash(refreshToken, 10);

        const { exp } = jwt.decode(refreshToken);

        await Token.create({
            jti,
            hash,
            userId: payload.userId,
            expiresIn: new Date(exp * 1000)
        });

        return { accessToken, refreshToken };
    } catch (err) {
        console.log(`Error while generating tokens: ${err}`);
    }
};
