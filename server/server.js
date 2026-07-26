import "dotenv/config";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import { createServer } from "http";

import { initIo } from "./services/socket.service.js";
import "./config/db.config.js";

import AuthRoutes from "./routes/auth.routes.js";
import PostRoutes from "./routes/post.routes.js";
import FileRoutes from "./routes/file.routes.js";
import UserRoutes from "./routes/user.routes.js";

import ChatRoutes from "./routes/chat.routes.js";

import { isAuthenticated } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
initIo(server);

// middlewares
app.use(express.json());
app.use(
    cors({
        origin: "*"
    })
);
app.use("/auth", AuthRoutes);
app.use(isAuthenticated);
app.use("/post", PostRoutes);
app.use("/file", FileRoutes);
app.use("/user", UserRoutes);
app.use("/chat", ChatRoutes);

server.listen(PORT, () =>
    console.log(chalk.hex("#2ef8ad")(`app started at port ${PORT} 🍄`))
);
