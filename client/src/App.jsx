import { useEffect, useState } from "react";
import socket from "./socket/socket";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

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
    <div className="app">
      <div className="card">
        <div className="header">🔐 CipherChat</div>

        {!joined ? (
          <>
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
          </>
        ) : (
          <>
            <div className="chat-box">
              {messages.map((msg, i) => (
                <div className="message" key={i}>
                  <strong>{msg.author}</strong>: {msg.message}
                  <span>{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
