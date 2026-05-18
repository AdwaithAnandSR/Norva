import bcrypt from "bcryptjs";
import chalk from "chalk";
import jwt from "jsonwebtoken";

import User from "../../models/user.models.js";
import { genToken } from "../../utils/genToken.js";

const signIn = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (
            !username ||
            !password ||
            username.trim().length < 5 ||
            password.trim().length < 5
        ) {
            return res
                .status(400)
                .json({ message: "REQUIRMENTS_NOT_MET", success: false });
        }

        const user = await User.findOne({ username });
        if (!user)
            return res.status(404).json({
                message: "INCORRECT CREDENTIALS",
                success: false
            });

        const isPassMatch = await bcrypt.compare(password, user.password);
        if (!isPassMatch)
            return res.status(400).json({
                message: "INCORRECT CREDENTIALS",
                success: false
            });

        const { accessToken, refreshToken } = await genToken({
            userId: user._id,
            role: user.role
        });

        if (!accessToken || !refreshToken)
            return res
                .status(500)
                .json({ message: "FAILED TO GENERATE TOKEN", success: false });

        const { password: _, ...userWithoutPassword } = user;
        
        console.log(userWithoutPassword)

        res.json({
            message: "SIGNIN_SUCCESS",
            success: true,
            accessToken,
            refreshToken,
            user: userWithoutPassword._doc
        });
    } catch (err) {
        console.log(`Error while SignIn: ${err}`);

        res.status(500).json({
            message: "INTERNAL_ERROR",
            success: false,
            error: err
        });
    }
};

export default signIn;
