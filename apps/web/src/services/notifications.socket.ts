import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectNotifications(userId: string) {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_API_URL + "/notifications", {
    transports: ["websocket"],
    auth: {
      userId,
    },
  });

  return socket;
}

export function disconnectNotifications() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
