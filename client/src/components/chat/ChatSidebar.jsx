function ChatSidebar({
  sidebarOpen,
  onCloseSidebar,
  handleLogout,
  search,
  setSearch,
  roomDraft,
  setRoomDraft,
  joinRoom,
  filteredGroups,
  room,
}) {
  return (
    <>
      {sidebarOpen ? (
        <button
          type="button"
          onClick={onCloseSidebar}
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
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-100"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H9m8 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </div>

          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
            />
          </div>
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
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-indigo-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Join
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => {
              const active = room === group.name;
              return (
                <button
                  type="button"
                  key={group._id}
                  onClick={() => joinRoom(group.name)}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-in-out ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-transparent text-gray-700 hover:bg-gray-100"
                  } animate-chat-item`}
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
    </>
  );
}

export default ChatSidebar;
