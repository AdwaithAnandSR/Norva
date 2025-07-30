import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization.split(" ")[1];

        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const { userId, jti, role } = payload;
        req.userId = userId;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError")
            console.log("Authentication failed due to expired Token");
        else if (error.name === "JsonWebTokenError")
            console.error("Invalid Token");
        else console.log("Error while verifying token: ", error);
        return res.status(401).json({ message: "SESSION_TIMEOUT" });
    }
};
