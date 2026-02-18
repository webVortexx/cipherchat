import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userColor, setUserColor] = useState("#000000");

  const messagesEndRef = useRef(null);

  // =========================
  // Generate color from username
  // =========================
  const getColorFromUsername = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - color.length) + color;
  };

  // =========================
  // Load + receive messages
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
  }, [messages]);

  // =========================
  // Join room
  // =========================
  const joinRoom = () => {
    if (!username || !room) return alert("Fill all fields");

    socket.emit("join_room", { username, room });
    setJoined(true);
    setUserColor(getColorFromUsername(username));
  };

  // =========================
  // Upload file
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
  // Send message
  // =========================
  const sendMessage = async () => {
    // FILE MESSAGE
    if (selectedFile) {
      const fileUrl = await handleFileUpload(selectedFile);

      socket.emit("send_message", {
        room,
        author: username,
        messageType: "file",
        fileUrl,
        usercolor: userColor,
      });

      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
      return;
    }

    // TEXT MESSAGE
    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      author: username,
      messageType: "text",
      content: message,
      usercolor: userColor,
    });

    setMessage("");
  };

  return (
    <>
      <div className="chat-header">
        <h3>🔐 CipherChat</h3>
        <span>Room: {room}</span>
      </div>

      <div className="chat-box row flex items-center justify-center pt-4">
        {/* Groups Sidebar */}
        <div className="chat-groups w-1/3">
          <div>Groups panel</div>
        </div>

        {/* Chat Container */}
        <div className="chat-container w-2/3">
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
              {/* Messages */}
              <div className="chat-messages">
                {messages.map((msg) => {
                  if (msg.type === "system") {
                    return (
                      <div key={msg.id} className="system-message">
                        {msg.content}
                      </div>
                    );
                  }

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
                        <p
                          style={{
                            color:
                              msg.usercolor ||
                              getColorFromUsername(msg.author),
                          }}
                        >
                          {msg.author}
                        </p>

                        <div className="message-text">
                          {msg.messageType === "file" ? (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                              📎 View File
                            </a>
                          ) : (
                            <p>{msg.content}</p>
                          )}

                          <span>
                            {msg.timestamp &&
                              new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("fileInput").click()
                  }
                >
                  📎
                </button>

                {selectedFile && (
                  <span style={{ fontSize: "12px", marginRight: "8px" }}>
                    {selectedFile.name}
                  </span>
                )}

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
      </div>
    </>
  );
}

export default Chat;