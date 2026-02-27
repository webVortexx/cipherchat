function ChatHeader({ room, joined, activeGroup, username, openSidebar }) {
  return (
    <header className="premium-header flex items-center justify-between px-5 py-4 md:px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openSidebar}
          className="rounded-md border border-gray-200 p-2 text-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-100 md:hidden"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="premium-title text-base font-semibold text-gray-900">{room || "Select a chat"}</p>
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {joined
              ? `${activeGroup?.members?.length || 1} members online`
              : "Not in a room"}
          </p>
        </div>
      </div>
      <p className="premium-chip px-2.5 py-1 text-xs text-gray-500">{username}</p>
    </header>
  );
}

export default ChatHeader;


