/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiResponseServerIo } from "@/lib/types";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";

export const config = { api: { bodyParser: false } };

const ioHandler = (
  request: NextApiRequest,
  response: NextApiResponseServerIo
) => {
  if (!response.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = response.socket.server as any;
    const io = new ServerIO(httpServer, { path, addTrailingSlash: false });
    io.on("connection", (socket) => {
      socket.on("create-room", (room) => {
        socket.join(room);
      });
      socket.on("send-changes", (delta, room) => {
        socket.to(room).emit("receive-changes", delta, room);
      });
      socket.on("send-cursor-move", (range, room, cursor) => {
        socket.to(room).emit("receive-cursor-move", range, room, cursor);
      });
    });
    response.socket.server.io = io;
  }
  response.end();
};

export default ioHandler;
