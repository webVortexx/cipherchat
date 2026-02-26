import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket, { connectSocketWithAuth } from "../socket/socket";
import { clearAuthSession, getAuthUser } from "../auth/auth";

function Chat() {
  const [room, setRoom] = useState("");
  const [roomDraft, setRoomDraft] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userColor, setUserColor] = useState("#4f46e5");
  const [groups, setGroups] = useState([]);
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const authUser = getAuthUser();
  const username = authUser?.username || "";

  const getColorFromUsername = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
  };

  const showNotification = (text, type = "success") => {
    setNotification({ message: text, type });
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    socket.disconnect();
    navigate("/", { replace: true });
  }, [navigate]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await API.get("/api/groups");
      setGroups(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      showNotification("Failed to load chat list", "error");
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!authUser) {
      navigate("/", { replace: true });
      return;
    }

    setUserColor(getColorFromUsername(username));
    fetchGroups();
  }, [authUser, fetchGroups, navigate, username]);

  useEffect(() => {
    const onLoadMessages = (data) => {
      setMessages(data);
    };
    const onReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    const onConnectError = (err) => {
      if (err.message === "Unauthorized" || err.message === "Invalid token") {
        handleUnauthorized();
      }
    };

    socket.on("load_messages", onLoadMessages);
    socket.on("receive_message", onReceiveMessage);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("load_messages", onLoadMessages);
      socket.off("receive_message", onReceiveMessage);
      socket.off("connect_error", onConnectError);
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [groups, search]
  );

  const joinRoom = async (targetRoom = roomDraft) => {
    const nextRoom = targetRoom.trim();
    if (!nextRoom) return;

    connectSocketWithAuth();
    socket.emit("join_room", { room: nextRoom });
    setRoom(nextRoom);
    setJoined(true);
    setMessages([]);
    setRoomDraft("");
    setSidebarOpen(false);
    await fetchGroups();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification("File size exceeds 10MB limit", "error");
      return;
    }

    setSelectedFile(file);
    showNotification(`Selected: ${file.name}`, "info");
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("room", room);
    setUploading(true);

    try {
      const response = await API.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.fileUrl) {
        socket.emit("send_message", {
          room,
          content: file.name,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2),
          messageType: "file",
          fileUrl: response.data.fileUrl,
          usercolor: userColor,
        });

        setSelectedFile(null);
        showNotification("File sent", "success");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      showNotification("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!joined || !room) {
      showNotification("Join a chat first", "error");
      return;
    }

    if (selectedFile) {
      await handleFileUpload(selectedFile);
      setMessage("");
      return;
    }

    if (!message.trim()) return;
    socket.emit("send_message", {
      room,
      content: message,
      messageType: "text",
      usercolor: userColor,
    });
    setMessage("");
  };

  const handleLogout = () => {
    clearAuthSession();
    socket.disconnect();
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen flex bg-gray-50 text-gray-800">
      {notification ? (
        <div
          className={`fixed right-4 top-4 z-[70] rounded-lg border px-3 py-2 text-sm transition-all duration-200 ease-in-out ${
            notification.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : notification.type === "info"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      {sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/30 md:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white transition-all duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 animate-sidebar-in" : "-translate-x-full"
        } md:flex md:flex-col`}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">CipherChat</h1>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-100"
            >
              Logout
            </button>
          </div>

          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
          />
        </div>

        <div className="border-b border-gray-200 p-4">
          <p className="mb-2 text-xs text-gray-400">Join or create room</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomDraft}
              onChange={(e) => setRoomDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="room-name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => joinRoom()}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-indigo-700"
            >
              Join
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const active = room === group.name;
              return (
                <button
                  type="button"
                  key={group._id}
                  onClick={() => joinRoom(group.name)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-in-out ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-gray-400">{group.members.length} members</p>
                </button>
              );
            })
          ) : (
            <p className="px-2 text-sm text-gray-400">No chats found.</p>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-gray-200 p-2 text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-100 md:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">{room || "Select a chat"}</p>
              <p className="flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                {joined ? "Online" : "Not in a room"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">{username}</p>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto p-6">
          {!joined ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">Choose a room from the sidebar to start chatting.</p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg.id || `${msg.content}-${msg.timestamp}`} className="text-center text-xs text-gray-400">
                    {msg.content}
                  </div>
                );
              }

              const isMine = msg.author === username;
              return (
                <div
                  key={msg.id || `${msg.author}-${msg.timestamp}`}
                  className={`flex animate-message-in ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      isMine ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className={`text-sm font-medium ${isMine ? "text-indigo-100" : "text-indigo-600"}`}>
                      {isMine ? "You" : msg.author}
                    </p>

                    {msg.type === "file" ? (
                      <div className="mt-1 space-y-2">
                        <p className="text-sm font-normal">{msg.fileName || msg.content}</p>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex rounded-md px-2 py-1 text-xs transition-all duration-200 ease-in-out ${
                            isMine
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-normal">{msg.content}</p>
                    )}

                    <p className={`mt-1 text-xs ${isMine ? "text-indigo-200" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </section>

        <footer className="border-t border-gray-200 bg-white p-4">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={uploading}
              placeholder={selectedFile ? `Selected: ${selectedFile.name}` : "Type your message..."}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm font-normal outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-all duration-200 ease-in-out hover:bg-gray-100 disabled:opacity-60"
            >
              File
            </button>
            <button
              type="button"
              onClick={sendMessage}
              disabled={uploading}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-indigo-700 disabled:opacity-60"
            >
              {uploading ? "Sending..." : "Send"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Chat;
