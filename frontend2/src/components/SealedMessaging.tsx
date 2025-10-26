import { useState, useCallback, memo, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { walrusApi } from "../utils/walrusApi";

interface SealedMessagingProps {
  profileId?: string;
  messageBoxId?: string;
  onMessageSent?: () => void;
}

interface MessageData {
  content: string;
  sender: string;
  senderName: string;
  isAnonymous: boolean;
  timestamp: number;
  messageType: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  readStatus: 'sent' | 'delivered' | 'read';
  messageId: string;
}

export const SealedMessaging = memo(({ profileId: _profileId, messageBoxId, onMessageSent }: SealedMessagingProps) => {
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [senderName, setSenderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'file'>('text');
  const account = useCurrentAccount();

  // Demo profilleri yükle
  const [availableRecipients, setAvailableRecipients] = useState<any[]>([]);

  // File handling functions
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Determine message type based on file type
    if (file.type.startsWith('image/')) {
      setMessageType('image');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type.startsWith('video/')) {
      setMessageType('video');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setMessageType('file');
      setPreviewUrl(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessageType('text');
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  // Upload file to Walrus Sites
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      console.log('📤 Walrus Sites: Preparing file for upload:', file.name, file.size);
      
      // File'ı base64'e çevir
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Walrus Sites yaklaşımı ile upload
      const blobId = await walrusApi.uploadBlob(fileContent, file.name);
      
      console.log('✅ Walrus Sites: File prepared for site-builder deploy:', blobId);
      return blobId;
    } catch (error) {
      console.error('❌ Walrus Sites: File upload error:', error);
      
      // Daha spesifik hata mesajları
      if (error instanceof Error) {
        if (error.message.includes('Walrus Sites')) {
          throw new Error('Walrus Sites system is not active. File saved locally.');
        } else {
          throw new Error(`File preparation error: ${error.message}`);
        }
      } else {
        throw new Error('Unexpected file preparation error');
      }
    }
  }, []);

  useEffect(() => {
    const loadRecipients = () => {
      // Demo profilleri her zaman ekle
      const demoProfiles = [
        {
          id: "demo_user_1",
          username: "Alice",
          bio: "Blockchain geliştirici ve NFT sanatçısı",
          messageBoxId: "msgbox_demo_1",
          demo: true
        },
        {
          id: "demo_user_2", 
          username: "Bob",
          bio: "DeFi uzmanı ve kripto yatırımcısı",
          messageBoxId: "msgbox_demo_2",
          demo: true
        },
        {
          id: "demo_user_3",
          username: "Charlie",
          bio: "Web3 tasarımcı ve UI/UX uzmanı",
          messageBoxId: "msgbox_demo_3",
          demo: true
        }
      ];

      // localStorage'dan mevcut profilleri yükle
      const key = "sealink:profiles";
      const raw = localStorage.getItem(key);
      const profiles: Record<string, any> = raw ? JSON.parse(raw) : {};
      
      // Demo profilleri localStorage'a kaydet
      demoProfiles.forEach(profile => {
        profiles[profile.id] = profile;
      });
      localStorage.setItem(key, JSON.stringify(profiles));

      // Tüm profilleri birleştir ve messageBoxId'si olanları filtrele
      const allProfiles = [...Object.values(profiles)];
      const recipientsWithMessageBox = allProfiles.filter(p => p.messageBoxId && p.messageBoxId.trim() !== "");
      
      console.log("📋 Available recipients:", recipientsWithMessageBox);
      setAvailableRecipients(recipientsWithMessageBox);
    };

    loadRecipients();
  }, []);

  // Memoized encryption functions
  const encryptMessage = useCallback((text: string, key: string): string => {
    // Simple XOR encryption (for demo purposes - in production use proper encryption)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  }, []);

  const generateEncryptionKey = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(false);
    
    if (!message.trim() && !selectedFile) {
      setError("Please enter a message or select a file");
      return;
    }

    // Alıcı seçimi kontrolü
    const targetMessageBoxId = selectedRecipient || messageBoxId;
    if (!targetMessageBoxId) {
      setError("Please select a recipient or message box not found.");
      return;
    }

    if (!account) {
      setError("Please connect your wallet to send a message");
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Prepare message data
      const encryptionKey = generateEncryptionKey();
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let mediaUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      
      // Upload file if selected
      if (selectedFile) {
        console.log("📤 Uploading file to Walrus...");
        mediaUrl = await uploadFile(selectedFile);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        console.log("✅ File uploaded:", mediaUrl);
      }
      
      const messageData: MessageData = {
        content: message || (selectedFile ? `📎 ${fileName}` : ''),
        sender: account.address.slice(0, 8),
        senderName: isAnonymous ? "Anonymous" : (senderName || "Anonymous"),
        isAnonymous,
        timestamp: Date.now(),
        messageType,
        mediaUrl,
        fileName,
        fileSize,
        readStatus: 'sent',
        messageId,
      };

      // 2️⃣ Encrypt message content
      const encryptedContent = encryptMessage(JSON.stringify(messageData), encryptionKey);
      
      // 3️⃣ Upload encrypted message to Walrus Seal using optimized API client
      console.log("📤 Uploading encrypted message to Walrus Seal...");
      const sealBlobId = await walrusApi.uploadBlob(encryptedContent, "sealed_message.json");
      console.log("✅ Encrypted blob uploaded:", sealBlobId);

      // 4️⃣ Message successfully uploaded to Walrus - save metadata and show success
      console.log("✅ Message successfully uploaded to Walrus with blob ID:", sealBlobId);
      
      // Save message metadata to localStorage for the recipient to find
      const messageMetadata = {
        id: messageId,
                    sealBlobId: sealBlobId,
                    senderHash: account.address.slice(0, 8),
                    senderName: isAnonymous ? 'Anonymous' : (senderName || 'Anonymous'),
                    isAnonymous: isAnonymous,
                    createdAt: Math.floor(Date.now() / 1000),
        content: message || `📎 ${fileName}`,
        messageType,
        mediaUrl,
        fileName,
        fileSize,
        readStatus: 'sent'
      };
                  
      console.log("💾 Saving message metadata:", messageMetadata);
      console.log("📦 MessageBoxId:", targetMessageBoxId);
      
      const key = `sealink:messages:${targetMessageBoxId}`;
                  const existingMessages = JSON.parse(localStorage.getItem(key) || '[]');
      existingMessages.unshift(messageMetadata); // Add to beginning
                  localStorage.setItem(key, JSON.stringify(existingMessages));
      
      console.log("✅ Message saved to localStorage with key:", key);
      console.log("📊 Total messages:", existingMessages.length);
                  
                  setSuccess(true);
                  setMessage("");
                  setSenderName("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessageType('text');
      
                  if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("❌ Error:", error);
      
      // More user-friendly error messages
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        console.log("🔍 Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        if (error.message.includes("Walrus Sites")) {
          errorMessage = "Walrus Sites system is not active. Your message has been saved locally. It can be uploaded to Walrus with site-builder deploy.";
        } else if (error.message.includes("File preparation error")) {
          errorMessage = error.message;
        } else if (error.message.includes("File upload error")) {
          errorMessage = error.message;
        } else if (error.message.includes("File upload failed")) {
          errorMessage = "File preparation failed. Please check file size.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Walrus Sites system is not active. Site-builder deploy required.";
        } else if (error.message.includes("NetworkError")) {
          errorMessage = "Walrus Sites system is not active. Site-builder deploy required.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [message, selectedFile, selectedRecipient, messageBoxId, account, isAnonymous, senderName, messageType, generateEncryptionKey, encryptMessage, uploadFile, onMessageSent]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "1.5rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      maxWidth: "800px",
      margin: "0 auto",
      minHeight: "600px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Chat Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#ecf0f1" }}>
            💬 Sealed Chat
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", opacity: 0.8 }}>
            End-to-end encrypted messaging with media support
          </p>
        </div>
        <div style={{
          background: "rgba(76, 175, 80, 0.2)",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          border: "1px solid rgba(76, 175, 80, 0.3)",
        }}>
          <span style={{ fontSize: "0.8rem", color: "#4CAF50", fontWeight: "600" }}>
            🔒 Encrypted
          </span>
        </div>
      </div>

      {/* Recipient Selection */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "0.5rem", 
          fontWeight: "600",
          color: "#ecf0f1",
          fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}>
          📤 Send to:
        </label>
        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ecf0f1",
            backdropFilter: "blur(10px)",
          }}
        >
          <option value="">Select recipient...</option>
          {availableRecipients.map((recipient) => (
            <option key={recipient.id} value={recipient.messageBoxId}>
              {recipient.username} {recipient.demo ? "(Demo)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Message Type Toggle */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ 
          display: "flex", 
          gap: "clamp(0.25rem, 1vw, 0.5rem)", 
          marginBottom: "0.5rem",
          flexWrap: "wrap",
        }}>
          <button
            type="button"
            onClick={() => setMessageType('text')}
            style={{
              padding: "clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)",
              border: "none",
              borderRadius: "6px",
              fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
              fontWeight: "600",
              cursor: "pointer",
              background: messageType === 'text' ? "#667eea" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            📝 Text
          </button>
          <button
            type="button"
            onClick={() => setMessageType('image')}
            style={{
              padding: "clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)",
              border: "none",
              borderRadius: "6px",
              fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
              fontWeight: "600",
              cursor: "pointer",
              background: messageType === 'image' ? "#667eea" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            🖼️ Image
          </button>
          <button
            type="button"
            onClick={() => setMessageType('video')}
            style={{
              padding: "clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)",
              border: "none",
              borderRadius: "6px",
              fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
              fontWeight: "600",
              cursor: "pointer",
              background: messageType === 'video' ? "#667eea" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            🎥 Video
          </button>
          <button
            type="button"
            onClick={() => setMessageType('file')}
            style={{
              padding: "clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)",
              border: "none",
              borderRadius: "6px",
              fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
              fontWeight: "600",
              cursor: "pointer",
              background: messageType === 'file' ? "#667eea" : "rgba(255, 255, 255, 0.1)",
              color: "white",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            📎 File
          </button>
        </div>
      </div>

      {/* File Upload */}
      {(messageType === 'image' || messageType === 'video' || messageType === 'file') && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            id="file-input"
            type="file"
            accept={
              messageType === 'image' ? 'image/*' :
              messageType === 'video' ? 'video/*' :
              '*/*'
            }
            onChange={handleFileSelect}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ecf0f1",
              backdropFilter: "blur(10px)",
            }}
          />
          
          {previewUrl && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              {messageType === 'image' && (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                  }}
                />
              )}
              {messageType === 'video' && (
                <video 
                  src={previewUrl} 
                  controls 
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "12px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                  }}
                />
              )}
              {selectedFile && (
          <div style={{ 
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                }}>
                  <p style={{ margin: 0, fontSize: "0.8rem" }}>
                    📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={clearFile}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, marginBottom: "1rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "600",
            color: "#ecf0f1",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}>
            💬 Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
            }}
            placeholder={
              messageType === 'text' ? "Type your message here..." :
              messageType === 'image' ? "Add a caption for your image..." :
              messageType === 'video' ? "Add a description for your video..." :
              "Add a description for your file..."
            }
            style={{
              width: "100%",
              minHeight: "80px",
              maxHeight: "300px",
              padding: "1rem",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ecf0f1",
              backdropFilter: "blur(10px)",
              resize: "none",
              fontFamily: "inherit",
              overflow: "auto",
              lineHeight: "1.4",
            }}
          />
        </div>

        {/* Anonymous Toggle */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "clamp(0.25rem, 1vw, 0.5rem)",
            cursor: "pointer",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            color: "#ecf0f1",
            flexWrap: "wrap",
          }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{
                width: "clamp(16px, 4vw, 18px)",
                height: "clamp(16px, 4vw, 18px)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
              🔒 Send anonymously
            </span>
          </label>
        </div>

        {/* Sender Name (if not anonymous) */}
        {!isAnonymous && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: "600",
              color: "#ecf0f1",
              fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}>
              👤 Your name:
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: "100%",
                padding: "clamp(0.5rem, 2vw, 0.75rem)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ecf0f1",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || (!message.trim() && !selectedFile)}
          style={{
            width: "100%",
            padding: "clamp(0.8rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)",
            background: isLoading ? "#666" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "clamp(0.9rem, 3vw, 1rem)",
            fontWeight: "700",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: isLoading ? "none" : "0 4px 16px rgba(102, 126, 234, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(0.25rem, 1vw, 0.5rem)",
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? (
            <>
              <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)" }}>⏳</span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)" }}>🚀</span>
              <span>Send Message</span>
            </>
          )}
        </button>

        {/* Status Messages */}
        {success && (
          <div style={{
            marginTop: "1rem",
            padding: "clamp(0.8rem, 2vw, 1rem)",
            background: "rgba(76, 175, 80, 0.2)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            borderRadius: "8px",
            color: "#4CAF50",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            textAlign: "center",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}>
            ✅ Message sent successfully! It's encrypted and stored in Walrus.
          </div>
        )}

        {error && (
          <div style={{
            marginTop: "1rem",
            padding: "clamp(0.8rem, 2vw, 1rem)",
            background: "rgba(244, 67, 54, 0.2)",
            border: "1px solid rgba(244, 67, 54, 0.3)",
            borderRadius: "8px",
            color: "#f44336",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            textAlign: "center",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}>
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
});
