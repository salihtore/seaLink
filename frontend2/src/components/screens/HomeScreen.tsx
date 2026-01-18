import { FeatureCard, QuickActionButton } from "./FeatureCard";

export function HomeScreen() {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      minHeight: "70vh",
    }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 2rem",
        textAlign: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            margin: "0 0 1rem 0",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}>
            🚀 SeaLink
          </h1>
          <p style={{
            fontSize: "1.2rem",
            margin: "0 0 2rem 0",
            opacity: 0.9,
            fontWeight: "300",
          }}>
            Decentralized LinkTree with Anonymous Messaging & NFT Marketplace
          </p>

          {/* Stats */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>🔒</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Anonymous Chat</div>
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>🎨</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>NFT Marketplace</div>
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>🌊</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Walrus Storage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}>
        <h3 style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          margin: "0 0 1.5rem 0",
          textAlign: "center",
        }}>
          ✨ Platform Features
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔐</div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Secure Messaging</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Encrypted anonymous messaging system with Walrus Seal
            </p>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎨</div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>NFT Marketplace</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              NFT trading and content marketing with SUI tokens
            </p>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🌊</div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Decentralized</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Fully decentralized platform on Walrus and Sui blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
