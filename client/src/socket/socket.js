import { io } from "socket.io-client";
import { getToken } from "../auth/auth";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(socketUrl, {
  transports: ["websocket"],
  autoConnect: false,
});

export const connectSocketWithAuth = () => {
  const token = getToken();
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export default socket;
