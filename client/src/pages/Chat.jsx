import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    if (!username || !room) return alert("Fill all fields");
    socket.emit("join_room", { username, room });
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      author: username,
      message,
      time: new Date().toLocaleTimeString(),
    });

    setMessage("");
  };

  return (
  <div className="chat-container">
    <div className="chat-header">
      <h3>🔐 CipherChat</h3>
      <span>Room: {room}</span>
    </div>

    {!joined ? (
      <div className="join-box">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    ) : (
      <>
        <div className="chat-messages">
          {messages.map((msg, i) => {
            if (msg.author === "system") {
              return (
                <div key={i} className="system-message">
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`chat-message ${
                  msg.author === username ? "my-message" : "other-message"
                }`}
              >
                <div className="bubble">
                  <p>{msg.message}</p>
                  <span>{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </>
    )}
  </div>
);
}

export default Chat;
