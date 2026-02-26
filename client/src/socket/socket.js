import { io } from "socket.io-client";
import { getToken } from "../auth/auth";

const socket = io("http://localhost:5000", {
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
