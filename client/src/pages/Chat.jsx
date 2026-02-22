import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [randomColor, setRandomColor] = useState(() =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );

  const messagesEndRef = useRef(null);

  const getRandomColor = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  // =========================
  // Load old + new messages
  // =========================
  useEffect(() => {
    socket.on("load_messages", (data) => {
      setMessages(data);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [joined]);

  // =========================
  // Auto scroll
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, joined]);

  // =========================
  // Join room
  // =========================
  const joinRoom = () => {
    if (!username || !room) return alert("Fill all fields");

    socket.emit("join_room", { username, room });
    setJoined(true);
    setRandomColor(getRandomColor());
  };

  // =========================
  // Upload file to backend
  // =========================
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.fileUrl;
  };

  // =========================
  // Send message (text OR file)
  // =========================
  const sendMessage = async () => {
    // Send file if selected
    if (selectedFile) {
      const fileUrl = await handleFileUpload(selectedFile);

      socket.emit("send_message", {
        room,
        author: username,
        messageType: "file",
        fileUrl,
      });

      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
      return;
    }

    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      author: username,
      messageType: "text",
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
            {messages.map((msg, index) => {
              if (msg.type === "system") {
                return (
                  <div key={index} className="system-message">
                    {msg.content}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.author === username
                      ? "my-message"
                      : "other-message"
                  }`}
                >
                  <div className="bubble">
                    <p style={{ color: randomColor }}>
                      {msg.author}
                    </p>

                    <div className="message-text">
                      {msg.messageType === "file" ? (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📎 View File
                        </a>
                      ) : (
                        <p>{msg.content}</p>
                      )}

                      <span>
                        {msg.timestamp &&
                          new Date(msg.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">

            {/* Hidden File Input */}
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) =>
                setSelectedFile(e.target.files[0])
              }
            />

            {/* Attachment Icon */}
            <button
              type="button"
              onClick={() =>
                document.getElementById("fileInput").click()
              }
              style={{ marginRight: "6px" }}
            >
              📎
            </button>

            {/* Show selected file name */}
            {selectedFile && (
              <span
                style={{
                  fontSize: "12px",
                  marginRight: "8px",
                }}
              >
                {selectedFile.name}
              </span>
            )}

            {/* Text Input */}
            <input
              placeholder="Type a message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            {/* Send Button */}
            <button onClick={sendMessage}>➤</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;
