import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";

// file imports
import { initIo } from "./services/socket.service.js";
import "./config/db.config.js";

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

server.listen(PORT, () => console.log(`app started at port ${PORT} 🍄`));
