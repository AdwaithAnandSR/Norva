import "dotenv/config";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import { createServer } from "http";

// file imports
import { initIo } from "./services/socket.service.js";
import "./config/db.config.js";
import AuthRoutes from "./routes/auth.routes.js";
import PostRoutes from "./routes/post.routes.js";

// constants
const app = express();
const PORT = process.env.PORT || 5050;

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
app.use("/post", PostRoutes);

server.listen(PORT, () =>
    console.log(chalk.hex("#2ef8ad")(`app started at port ${PORT} 🍄`))
);
