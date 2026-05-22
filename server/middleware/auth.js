import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "NO_TOKEN"
            });
        }

        if (!authHeader.startsWith("Bearer ")) 
            return res.status(401).json({
                success: false,
                message: "INVALID_FORMAT"
            });
        

        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        const { userId, jti, role } = payload;

        if (!userId || !jti)
            return res.status(401).json({
                success: false,
                message: "INVALID_TOKEN_PAYLOAD"
            });

        req.user = {
            userId,
            jti,
            role
        };

        next();
    } catch (error) {
        console.error("Auth middleware error: ", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "TOKEN_EXPIRED"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "INVALID_TOKEN"
            });
        }

        return res.status(500).json({
            success: false,
            message: "AUTH_SERVER_ERROR"
        });
    }
};
