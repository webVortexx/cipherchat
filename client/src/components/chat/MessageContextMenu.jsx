function MessageContextMenu({
  messageMenu,
  onCopy,
  onDelete,
  onClose,
}) {
  if (!messageMenu.open) return null;

  return (
    <div
      className="fixed z-[90] min-w-36 origin-top-left rounded-lg border border-gray-200 bg-white p-1 shadow-sm transition-all duration-200 ease-in-out animate-context-menu"
      style={{ left: messageMenu.x, top: messageMenu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          onCopy(messageMenu.msg);
          onClose();
        }}
        className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs text-gray-700 transition-all duration-200 ease-in-out hover:bg-gray-100"
      >
        Copy
      </button>
      {messageMenu.isMine ? (
        <button
          type="button"
          onClick={() => {
            onDelete(messageMenu.msg);
            onClose();
          }}
          className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs text-red-600 transition-all duration-200 ease-in-out hover:bg-red-50"
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}

export default MessageContextMenu;
