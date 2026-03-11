import { useRef } from "react";

function ChatComposer({
  selectedFile,
  setSelectedFile,
  handleFileSelect,
  message,
  setMessage,
  uploading,
  canSend,
  sendMessage,
  joined
}) {
  const fileInputRef = useRef(null);
    if (!joined) {
      return <div></div>;
    }


  return (
    <footer className="premium-composer px-4 py-4">
      <input type="file"  ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      {selectedFile ? (
        <div className="premium-chip mb-2 flex items-center justify-between px-3 py-2 text-xs text-gray-600">
          <span className="truncate pr-2">Selected file: {selectedFile.name}</span>
          {console.log("welcome")}
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded-md border border-gray-200 px-2 py-1 transition-all duration-200 ease-in-out hover:bg-white"
          >
            Remove
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={uploading}
          placeholder="Type your message..."
          className="premium-input w-full  h-12 rounded-full px-4 py-2 text-sm text-gray-700 outline-none"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="premium-chip inline-flex  h-12 items-center gap-1 px-6 py-2 text-sm text-gray-700 transition-all duration-200 ease-in-out hover:bg-white disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.657-5.657L5.757 10.757a6 6 0 108.486 8.486L20 13.486" />
          </svg>
          File
        </button>
        <button
          type="button"
          onClick={sendMessage}
          disabled={!canSend}
          className="premium-button  h-12 inline-flex items-center gap-1 rounded-full px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          {uploading ? "Sending..." : "Send"}
        </button>
      </div>
    </footer>
  );
}

export default ChatComposer;

