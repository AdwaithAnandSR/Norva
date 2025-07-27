import { Server } from "socket.io";

let io;

export const initIo = server => {
    try {
        if (!server) {
            throw new Error(
                "server instance created using createServer from http must be passed as an argument for initIo()!"
            );
            return;
        }

        io = new Server(server, {
            cors: {
                origin: "*"
            }
        });
        console.log("socket initialised 🎊");
        // io.sockets.sockets.size : connected users
        return io;
    } catch (err) {
        console.log(err);
    }
};

export const getIo = () => {
    if (io) return io;
    throw new Error("io not initialised yet!");
};
