import jwt from "jsonwebtoken";

export const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
};
