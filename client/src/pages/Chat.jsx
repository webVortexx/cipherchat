import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [randomColor, setRandomColor] = useState(() =>
  "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));



  
  const messagesEndRef = useRef(null);

  // Load old messages + receive new messages
useEffect(() => {
  
  
  // Load chat history when joining
  socket.on("load_messages", (data) => {
    setMessages(data);
  });

  // Receive new messages in real-time
  socket.on("receive_message", (data) => {
    setMessages((prev) => [...prev, data]);
  });

  return () => {
    socket.off("load_messages");
    socket.off("receive_message");
  };
}, [joined]);
const getRandomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");



  // Auto scroll
  useEffect(() => {
    
     
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages,joined]);

  // Join room
  const joinRoom = () => {
    if (!username || !room) return alert("Fill all fields");

    socket.emit("join_room", { username, room });
    setJoined(true);
    setRandomColor(getRandomColor());
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      author: username,
      content: message,
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
            {messages.map((msg) => {
              // System Message
              if (msg.type === "system") {
                return (
                  <div key={msg.id} className="system-message">
                    {msg.content}
                  </div>
                );
              }

              // Normal Message
              return (
                <div
                  key={msg.id}
                  className={`chat-message ${
                    msg.author === username
                      ? "my-message"
                      : "other-message"
                  }`}
                >
                  <div className="bubble">
                    <p style={{color:randomColor}}>{msg.author}</p>
                    <br/>
                    <div className="message-text">
                      <p>{msg.content}</p>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

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
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;
