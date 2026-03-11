import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket, { connectSocketWithAuth } from "../socket/socket";
import { clearAuthSession, getAuthUser } from "../auth/auth";

export default function useChatController() {
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
  const [internetConnected, setInternetConnected] = useState(true);
  const [messageMenu, setMessageMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    msg: null,
    isMine: false,
  });

  const navigate = useNavigate();
  const authUser = getAuthUser();
  const username = authUser?.username || "";
  const notificationTimerRef = useRef(null);

  const getColorFromUsername = useCallback((name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
  }, []);

  const showNotification = useCallback((text, type = "success") => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification({ message: text, type });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    socket.disconnect();
    navigate("/", { replace: true });
  }, [navigate]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await API.get("/api/groups");
      setGroups(response.data);
       setInternetConnected(true);
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      showNotification("Failed to load chat list", "error");
      setInternetConnected(false);
    }
  }, [handleUnauthorized, showNotification]);

  useEffect(() => {
    if (!authUser) {
      navigate("/", { replace: true });
      return;
    }

    setUserColor(getColorFromUsername(username));
    fetchGroups();
  }, [authUser, fetchGroups, getColorFromUsername, navigate, username]);

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
    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };
    const onMessageDeleteError = ({ error }) => {
      showNotification(error || "Delete failed", "error");
    };

    socket.on("load_messages", onLoadMessages);
    socket.on("receive_message", onReceiveMessage);
    socket.on("connect_error", onConnectError);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("message_delete_error", onMessageDeleteError);

    return () => {
      socket.off("load_messages", onLoadMessages);
      socket.off("receive_message", onReceiveMessage);
      socket.off("connect_error", onConnectError);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("message_delete_error", onMessageDeleteError);
    };
  }, [handleUnauthorized, showNotification]);

  useEffect(() => {
    const closeMenu = () => {
      setMessageMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("mousedown", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [groups, search]
  );

  const activeGroup = useMemo(
    () => groups.find((group) => group.name === room),
    [groups, room]
  );

  const canSend = Boolean((message.trim() || selectedFile) && !uploading);

  const joinRoom = useCallback(
    async (targetRoom = roomDraft) => {
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
    },
    [fetchGroups, roomDraft]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification("File size exceeds 10MB limit", "error");
        return;
      }

      setSelectedFile(file);
      showNotification(`Selected: ${file.name}`, "info");
    },
    [showNotification]
  );

  const handleFileUpload = useCallback(
    async (file) => {
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
    },
    [handleUnauthorized, room, showNotification, userColor]
  );

  const sendMessage = useCallback(async () => {
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
  }, [
    handleFileUpload,
    joined,
    message,
    room,
    selectedFile,
    showNotification,
    userColor,
  ]);

  const handleCopyMessage = useCallback(
    async (msg) => {
      const textToCopy =
        msg.type === "file" ? msg.fileUrl || msg.fileName : msg.content;
      if (!textToCopy) {
        showNotification("Nothing to copy", "error");
        return;
      }

      try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification("Copied", "success");
      } catch {
        showNotification("Copy not supported in this browser", "error");
      }
    },
    [showNotification]
  );

  const handleDeleteMessage = useCallback(
    (msg) => {
      if (!msg?._id || !room) {
        showNotification("Unable to delete this message", "error");
        return;
      }

      socket.emit("delete_message", {
        messageId: msg._id,
        room,
      });
    },
    [room, showNotification]
  );

  const openMessageMenu = useCallback((e, msg, isMine) => {
    e.preventDefault();
    const menuWidth = 152;
    const menuHeight = isMine ? 88 : 52;
    const padding = 8;

    const x = Math.min(e.clientX, window.innerWidth - menuWidth - padding);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - padding);

    setMessageMenu({
      open: true,
      x,
      y,
      msg,
      isMine,
    });
  }, []);

  const closeMessageMenu = useCallback(() => {
    setMessageMenu((prev) => ({ ...prev, open: false }));
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    socket.disconnect();
    navigate("/", { replace: true });
  }, [navigate]);

  return {
    username,
    internetConnected,
    room,
    roomDraft,
    search,
    message,
    messages,
    joined,
    selectedFile,
    groups,
    filteredGroups,
    activeGroup,
    notification,
    uploading,
    sidebarOpen,
    messageMenu,
    canSend,
    setRoomDraft,
    setSearch,
    setMessage,
    setSelectedFile,
    setSidebarOpen,
    joinRoom,
    handleFileSelect,
    sendMessage,
    handleCopyMessage,
    handleDeleteMessage,
    openMessageMenu,
    closeMessageMenu,
    handleLogout,
  };
}
