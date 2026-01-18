import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { walrusApi } from "../utils/walrusApi";

interface Message {
  id: string;
  sealBlobId: string;
  senderHash: string;
  senderName: string;
  isAnonymous: boolean;
  createdAt: number;
  content?: string;  // Downloaded from Walrus Seal
}

interface SealedMessagesViewProps {
  profileId?: string;
  messageBoxId?: string;
  isOwner?: boolean;
}

// Memoized message item component for better performance
const MessageItem = memo(({ 
  msg, 
  index, 
  expandedMessageId, 
  onToggleExpanded, 
  onCopyMessage 
}: {
  msg: Message;
  index: number;
  expandedMessageId: string | null;
  onToggleExpanded: (id: string) => void;
  onCopyMessage: (content: string) => void;
}) => {
  const isExpanded = expandedMessageId === msg.id;
  
  const handleClick = useCallback(() => {
    onToggleExpanded(msg.id);
  }, [msg.id, onToggleExpanded]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyMessage(msg.content || "");
  }, [msg.content, onCopyMessage]);

  const formattedDate = useMemo(() => {
    return new Date(msg.createdAt * 1000).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [msg.createdAt]);

         return (
           <div
             style={{
               background: "rgba(255, 255, 255, 0.1)",
               padding: "1rem",
               borderRadius: "12px",
               cursor: "pointer",
               transition: "all 0.3s ease",
               backdropFilter: "blur(10px)",
               border: "1px solid rgba(255, 255, 255, 0.2)",
               position: "relative",
               overflow: "hidden",
               marginBottom: "0.75rem",
             }}
             onClick={handleClick}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
               e.currentTarget.style.transform = "translateY(-2px)";
               e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.2)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "none";
             }}
           >
             {/* Message Header */}
             <div style={{
               background: "rgba(255, 255, 255, 0.15)",
               padding: "0.75rem 1rem",
               borderRadius: "12px 12px 0 0",
               marginBottom: "0.5rem",
               borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
             }}>
               <div style={{
                 display: "flex",
                 justifyContent: "space-between",
                 alignItems: "center",
                 flexWrap: "wrap",
                 gap: "0.5rem",
               }}>
                 <div style={{
                   display: "flex",
                   alignItems: "center",
                   gap: "0.5rem",
                 }}>
                   <span style={{ fontSize: "1.2rem" }}>📬</span>
                   <span style={{
                     fontSize: "1rem",
                     fontWeight: "600",
                     color: "white",
                   }}>
                     {msg.isAnonymous ? "Anonymous Message" : `${msg.senderName || "Unknown"} Message`}
                   </span>
                 </div>
                 
                 <div style={{
                   background: "rgba(255, 255, 255, 0.2)",
                   padding: "0.25rem 0.5rem",
                   borderRadius: "12px",
                   fontSize: "0.75rem",
                   fontWeight: "600",
                 }}>
                   #{index + 1}
                 </div>
               </div>
             </div>

             <div style={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               marginBottom: "0.75rem",
               flexWrap: "wrap",
               gap: "0.75rem",
             }}>
               <div style={{
                 background: "rgba(255, 255, 255, 0.2)",
                 padding: "0.4rem 0.8rem",
                 borderRadius: "16px",
                 fontSize: "0.8rem",
                 fontWeight: "500",
                 display: "flex",
                 alignItems: "center",
                 gap: "0.4rem",
                 opacity: 0.9,
               }}>
                 {msg.isAnonymous ? "🕵️ Anonim" : `👤 ${msg.senderName || "İsimsiz"}`}
               </div>
               
               <div style={{
                 fontSize: "0.8rem",
                 opacity: 0.8,
                 background: "rgba(255, 255, 255, 0.1)",
                 padding: "0.2rem 0.6rem",
                 borderRadius: "12px",
               }}>
                 {formattedDate}
               </div>
             </div>

      <div style={{
        marginBottom: isExpanded ? "1rem" : "0",
        lineHeight: "1.6",
        position: "relative",
      }}>
        <div style={{
          overflow: isExpanded ? "visible" : "hidden",
          textOverflow: "ellipsis",
          display: isExpanded ? "block" : "-webkit-box",
          WebkitLineClamp: isExpanded ? "none" : "2",
          WebkitBoxOrient: "vertical",
          whiteSpace: isExpanded ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}>
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {msg.content || "[Yükleniyor...]"}
          </p>
        </div>
        
        {!isExpanded && (
          <div style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.8) 100%)",
            padding: "0.5rem 1rem",
            borderRadius: "0 0 16px 0",
            fontSize: "0.8rem",
            fontWeight: "600",
          }}>
            Devamını okumak için tıklayın...
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <button 
            onClick={handleCopy}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            📋 Copy
          </button>
          
          <div style={{
            fontSize: "0.75rem",
            opacity: 0.7,
            background: "rgba(255, 255, 255, 0.1)",
            padding: "0.25rem 0.5rem",
            borderRadius: "8px",
            fontFamily: "monospace",
          }}>
            Blob: {msg.sealBlobId.slice(0, 12)}...
          </div>
        </div>
      )}
    </div>
  );
});

export const SealedMessagesView = memo(({ messageBoxId, isOwner = false }: SealedMessagesViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleToggleExpanded = useCallback((id: string) => {
    setExpandedMessageId(prev => prev === id ? null : id);
  }, []);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // Memoized message loading logic
  const loadMessages = useCallback(async () => {
    console.log("🔄 Loading messages for messageBoxId:", messageBoxId);
    
    if (!messageBoxId) {
      console.log("❌ No messageBoxId provided");
      setLoading(false);
      return;
    }

      try {
        setLoading(true);

      // Load message metadata from localStorage
        const key = `sealink:messages:${messageBoxId}`;
      console.log("🔍 Loading messages with key:", key);
        const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
      console.log("📦 Found messages:", storedMessages.length);
      console.log("📋 Messages:", storedMessages);
      
      if (storedMessages.length === 0) {
        console.log("❌ No messages found");
        setMessages([]);
        return;
      }

      // Separate demo messages from real Walrus messages
      const demoMessages = storedMessages.filter((msg: any) => 
        msg.sealBlobId.startsWith('demo_blob_') || msg.sealBlobId.startsWith('local_')
      );
      
      const walrusMessages = storedMessages.filter((msg: any) => 
        !msg.sealBlobId.startsWith('demo_blob_') && !msg.sealBlobId.startsWith('local_')
      );

      // Batch fetch all Walrus messages for better performance
      const messagesWithContent: Message[] = [...demoMessages];
      
      if (walrusMessages.length > 0) {
        try {
          const blobIds = walrusMessages.map((msg: any) => msg.sealBlobId);
          const blobContents = await walrusApi.fetchBlobs(blobIds);
          
          walrusMessages.forEach((msg: any) => {
            const content = blobContents.get(msg.sealBlobId);
            if (content) {
              // Parse the encrypted content
              let decryptedContent = content;
              try {
                const parsedContent = JSON.parse(content);
                if (parsedContent.content) {
                  decryptedContent = parsedContent.content;
                }
              } catch {
                // If parsing fails, use raw content
              }
              
              messagesWithContent.push({
                ...msg,
                content: decryptedContent
              });
        } else {
              // Keep message without content if fetch failed
              messagesWithContent.push({
                ...msg,
                content: "[Message content could not be loaded - Walrus API inaccessible]"
              });
            }
          });
        } catch (error) {
          console.error("Batch fetch failed:", error);
          // Fallback to individual messages
          walrusMessages.forEach((msg: any) => {
            messagesWithContent.push({
              ...msg,
                content: "[Message content could not be loaded - Walrus API inaccessible]"
            });
          });
        }
      }

      // Sort messages by creation time (newest first)
      messagesWithContent.sort((a, b) => b.createdAt - a.createdAt);
      
      setMessages(messagesWithContent);
      } catch (err) {
        console.error("Message loading error:", err);
      setMessages([]);
      } finally {
        setLoading(false);
      }
  }, [messageBoxId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  if (!isOwner) {
    return (
      <div className="messages-view" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>💌 Message Inbox</h3>
        <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
          This profile has received <strong>{messages.length}</strong> anonymous messages
        </p>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Only the profile owner can view the messages
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "center",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "2rem",
        gap: "1rem",
      }}>
               <h3 style={{ 
                 margin: 0, 
                 fontSize: "1.8rem", 
                 fontWeight: "700",
                 display: "flex",
                 alignItems: "center",
                 gap: "0.5rem",
                 color: "#ecf0f1",
               }}>
                 💬 My Messages
                 <span style={{
                   background: "rgba(102, 126, 234, 0.3)",
                   padding: "0.25rem 0.75rem",
                   borderRadius: "20px",
                   fontSize: "0.9rem",
                   fontWeight: "600",
                   border: "1px solid rgba(102, 126, 234, 0.5)",
                 }}>
                   {messages.length}
                 </span>
               </h3>
      </div>

      {loading ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            animation: "pulse 2s infinite",
          }}>
            🔄
          </div>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📬</div>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem", fontWeight: "600", color: "#ecf0f1" }}>
            No messages yet
          </h4>
          <p style={{ margin: "0 0 2rem 0", opacity: 0.9, fontSize: "1rem", lineHeight: "1.5" }}>
            Share your profile and start receiving messages!
          </p>
          
          <button
            onClick={() => {
              // Navigate to send message screen using proper navigation
              if (typeof window !== 'undefined') {
                // Use history API instead of hash + reload
                window.history.pushState({}, '', '#send-message');
                // Dispatch a custom event to notify the app about navigation
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'send-message' }));
              }
            }}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "25px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: "0 auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            📤 Send Message
          </button>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          {messages.map((msg, index) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              index={index}
              expandedMessageId={expandedMessageId}
              onToggleExpanded={handleToggleExpanded}
              onCopyMessage={handleCopyMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
});
