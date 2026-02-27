import useChatController from "../hooks/useChatController";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatComposer from "../components/chat/ChatComposer";
import MessageContextMenu from "../components/chat/MessageContextMenu";
import NotificationToast from "../components/chat/NotificationToast";

function Chat() {
  const {
    username,
    room,
    roomDraft,
    search,
    message,
    messages,
    joined,
    selectedFile,
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
  } = useChatController();

  return (
    <div className="premium-shell h-screen flex text-gray-800">
      <NotificationToast notification={notification} />

      <MessageContextMenu
        messageMenu={messageMenu}
        onCopy={handleCopyMessage}
        onDelete={handleDeleteMessage}
        onClose={closeMessageMenu}
      />

      <ChatSidebar
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        handleLogout={handleLogout}
        search={search}
        setSearch={setSearch}
        roomDraft={roomDraft}
        setRoomDraft={setRoomDraft}
        joinRoom={joinRoom}
        filteredGroups={filteredGroups}
        room={room}
      />

      <main className="premium-main flex min-w-0 flex-1 flex-col">
        <ChatHeader
          room={room}
          joined={joined}
          activeGroup={activeGroup}
          username={username}
          openSidebar={() => setSidebarOpen(true)}
        />

        <MessageList
          joined={joined}
          messages={messages}
          username={username}
          onOpenMessageMenu={openMessageMenu}
        />

        <ChatComposer
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleFileSelect={handleFileSelect}
          message={message}
          setMessage={setMessage}
          uploading={uploading}
          canSend={canSend}
          sendMessage={sendMessage}
        />
      </main>
    </div>
  );
}

export default Chat;

