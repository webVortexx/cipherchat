import { useEffect, useRef } from "react";

function MessageList({ joined,internetConnected, messages, username, onOpenMessageMenu }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="premium-message-list flex-1 space-y-4 overflow-y-auto p-6">
      {!joined ? (
        !internetConnected?(
                      
        <div className="flex flex-col h-full items-center justify-center">
          <p className="premium-title text-3xl font-semibold text-gray-900">Welcome to Cipher chat</p>
          <br/>  
            <p className=" flex premium-title text-2xl font-semibold text-gray-900">poh ! No Internet please try again after some time</p>
          <br/>
            <img src="/nointernet.jpg" alt="home" className="h-64 my-4" />
      
        </div>

        ):(
            
        <div className="flex flex-col h-full items-center justify-center">
          <p className="premium-title text-3xl font-semibold text-gray-900">Welcome to Cipher chat</p>
          <br/>  
            <p className=" flex premium-title text-2xl font-semibold text-gray-900">Please join a group to start chatting ;)</p>
          <br/>
            <img src="/chathome.jpg" alt="home" className="h-64 my-4" />
      
        </div>
        )

        
            
      ) : messages.length === 0 ? (
        
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
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
          const messageId = msg._id || msg.id || `${msg.author}-${msg.timestamp}`;
          return (
            <div
              key={messageId}
              className={`flex animate-message-in ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-md rounded-2xl px-4 py-3 ${
                  isMine ? "bubble-own" : "bubble-other"
                }`}
                onContextMenu={(e) => onOpenMessageMenu(e, msg, isMine)}
              >

                <p className={`text-sm font-semibold ${isMine ? "text-blue-100" : "text-blue-700"}`}>
                  {isMine ? "You" : msg.author}
                </p>
                <div className="flex flex-row justify-between items-end min-w-24 max-w-64 gap-2 ">
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
                    <p className="mt-1 text-sm font-normal break-words whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <p className={`min-w-14 mt-1 text-xs ${isMine ? "text-indigo-200" : "text-gray-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </section>
  );
}

export default MessageList;

