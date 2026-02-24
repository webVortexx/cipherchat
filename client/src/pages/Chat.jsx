import { useState, useRef, useEffect } from "react";
import socket from "../socket/socket";

function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userColor, setUserColor] = useState("#000000");
  const [groups, setGroups] = useState([]);
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getColorFromUsername = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showNotification("Failed to load groups", "error");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (joined) {
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
    }
  }, [joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    if (username.trim() && room.trim()) {
      const color = getColorFromUsername(username);
      setUserColor(color);
      socket.emit("join_room", { username, room });
      setJoined(true);
      fetchGroups();
    }
  };

  const joinGroupFromSidebar = (groupName) => {
    if (!joined) {
      alert("Please join a room first or login");
      return;
    }
    setRoom(groupName);
    socket.emit("join_room", { username, room: groupName });
    setMessages([]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showNotification("File size exceeds 10MB limit", "error");
        return;
      }
      setSelectedFile(file);
      showNotification(`File selected: ${file.name}`, "info");
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("room", room);

    setUploading(true);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.fileUrl) {
        socket.emit("send_message", {
          room,
          author: username,
          content: file.name,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2), // KB
          messageType: "file",
          fileUrl: data.fileUrl,
          usercolor: userColor,
        });
        
        setSelectedFile(null);
        showNotification(`✅ Document uploaded successfully: ${file.name}`, "success");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Failed to upload file", "error");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (selectedFile) {
      await handleFileUpload(selectedFile);
      setMessage("");
    } else if (message.trim()) {
      socket.emit("send_message", {
        room,
        author: username,
        content: message,
        messageType: "text",
        usercolor: userColor,
      });
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!joined) {
    return (
      <div className="chat-container">
        <div className="join-box">
          <h2>Join Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && joinRoom()}
          />
          <input
            type="text"
            placeholder="Enter or create room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && joinRoom()}
          />
          <button onClick={joinRoom}>Join Room</button>

          <div className="groups-preview">
            <h3>Available Groups</h3>
            <div className="groups-list-preview">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div
                    key={group._id}
                    className="group-item-preview"
                    onClick={() => {
                      setRoom(group.name);
                    }}
                  >
                    <span className="group-name">{group.name}</span>
                    <span className="group-members">{group.members.length} members</span>
                  </div>
                ))
              ) : (
                <p className="no-groups">No groups yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💬 Groups</h2>
        </div>

        <div className="groups-list">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                className={`group-item ${room === group.name ? "active" : ""}`}
                onClick={() => joinGroupFromSidebar(group.name)}
              >
                <div className="group-info">
                  <p className="group-name">{group.name}</p>
                  <span className="group-meta">{group.members.length} members</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-groups">No groups available</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-wrapper">
        <div className="chat-header">
          <h3>💬 {room}</h3>
          <span>Welcome, {username}</span>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.author === username ? "my-message" : "other-message"
              }`}
            >
              {msg.type === "system" ? (
                <div className="system-message">{msg.content}</div>
              ) : (
                <div className="bubble">
                  <p style={{ color: msg.usercolor }}>
                    {msg.author === username ? "You" : msg.author}
                  </p>
                  {msg.messageType === "file" ? (
                    <div className="file-message">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <p className="file-name">{msg.fileName || msg.content}</p>
                          <span className="file-size">{msg.fileSize || "0"} KB</span>
                        </div>
                      </div>
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="download-btn"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  ) : (
                    <div className="message-content">{msg.content}</div>
                  )}
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="input-footer">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          <div className="input-container">
            <input
              type="text"
              className="message-input"
              placeholder={selectedFile ? `Selected: ${selectedFile.name}` : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={uploading}
            />

            <button
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              title="Upload File"
              disabled={uploading}
            >
              📎
            </button>

            <button
              className={`btn-send ${uploading ? "uploading" : ""}`}
              onClick={sendMessage}
              title="Send Message"
              disabled={uploading}
            >
              {uploading ? "⏳" : "✈️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;