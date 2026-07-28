import bcrypt from "bcryptjs";
import chalk from "chalk";
import jwt from "jsonwebtoken";

import User from "../../models/user.models.js";
import { genToken } from "../../utils/genToken.js";

const signUp = async (req, res) => {
    let { username, password, fullname } = req.body;

    try {
        username = username.trim();
        password = password.trim();
        fullname = fullname.trim();
        if (
            !username ||
            !password ||
            !fullname ||
            username.length < 5 ||
            password.length < 5
        )
            return res
                .status(400)
                .json({ message: "REQUIRMENTS_NOT_MET", success: false });

        const existUser = await User.findOne({ username });
        if (existUser)
            return res
                .status(400)
                .json({ message: "USER_EXIST", success: false });

        const hashPass = await bcrypt.hash(password, 10);

        let user = await User.create({
            username,
            fullname,
            password: hashPass
        });

        user = {
            username: user.username,
            fullname: user.fullname,
            createdAt: user.createdAt,
            role: user.role,
            _id: user._id
        };

        const { accessToken, refreshToken } = await genToken({
            userId: user._id,
            role: user.role
        });

        if (!accessToken || !refreshToken)
            return res
                .status(500)
                .json({ message: "TOKEN_GEN_FAILED", success: false });

        console.log(
            chalk.hex("#a4f731")(
                `${user.username} joined (${user.createdAt}) 🤩`
            )
        );

        res.status(200).json({
            message: "SIGNUP_SUCCESS",
            success: true,
            user,
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(`Error while SignUp: ${err}`);

        res.status(500).json({
            message: "INTERNAL_ERROR",
            success: false,
            error: err
        });
    }
};

export default signUp;
