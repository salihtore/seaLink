import { CSSProperties, useState, useEffect, lazy, Suspense } from "react";
import { WalletConnect } from "./components/WalletConnect";
import { CreateProfile } from "./components/CreateProfile";
import { ViewProfile } from "./components/ViewProfile";
import { useSuiClient } from "@mysten/dapp-kit";

// Lazy load heavy components for better performance
const SealedMessagesView = lazy(() => import("./components/SealedMessagesView").then(module => ({ default: module.SealedMessagesView })));
const SealedMessaging = lazy(() => import("./components/SealedMessaging").then(module => ({ default: module.SealedMessaging })));
const NFTGallery = lazy(() => import("./components/NFTGallery").then(module => ({ default: module.NFTGallery })));
const CreateNFT = lazy(() => import("./components/CreateNFT").then(module => ({ default: module.CreateNFT })));
const NFTMarketplace = lazy(() => import("./components/NFTMarketplace").then(module => ({ default: module.NFTMarketplace })));

type Screen = 'home' | 'profile' | 'messages' | 'nft-gallery' | 'create-nft' | 'send-message' | 'nft-marketplace';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  // Listen for navigation events from components
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const screen = event.detail as Screen;
      if (screen && navigationButtons.some(btn => btn.id === screen)) {
        setCurrentScreen(screen);
      }
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);

  const containerStyle: CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

         const navigationButtons = [
           { id: 'home' as Screen, label: 'Home', icon: 'home' },
           { id: 'profile' as Screen, label: 'Profile', icon: 'person' },
           { id: 'messages' as Screen, label: 'Messages', icon: 'chat' },
           { id: 'nft-gallery' as Screen, label: 'NFT Gallery', icon: 'collections' },
           { id: 'nft-marketplace' as Screen, label: 'NFT Marketplace', icon: 'store' },
           { id: 'create-nft' as Screen, label: 'Create NFT', icon: 'add' },
           { id: 'send-message' as Screen, label: 'Send Message', icon: 'send' },
         ];

         const renderScreen = () => {
           switch (currentScreen) {
             case 'home':
               return <HomeScreen onNavigate={setCurrentScreen} />;
             case 'profile':
               return <ProfileScreen profileId={null} messageBoxId={null} />;
             case 'messages':
               return <MessagesScreen messageBoxId={null} />;
             case 'nft-gallery':
               return <NFTGalleryScreen />;
             case 'nft-marketplace':
               return <NFTMarketplaceScreen />;
             case 'create-nft':
               return <CreateNFTScreen />;
             case 'send-message':
               return <SendMessageScreen messageBoxId={null} />;
             default:
               return <HomeScreen onNavigate={setCurrentScreen} />;
           }
  };

  return (
    <div style={containerStyle}>
      <header
        style={{
                 background: "rgba(44, 62, 80, 0.95)",
          color: "white",
                 padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
                 borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                 position: "sticky",
                 top: 0,
                 zIndex: 100,
                 backdropFilter: "blur(10px)",
               }}
             >
               <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                 {/* Left Hamburger Menu Button */}
                 <button
                   onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
                   style={{
                     background: isLeftMenuOpen ? "rgba(102, 126, 234, 0.8)" : "rgba(255, 255, 255, 0.15)",
                     border: "none",
                     fontSize: "1.3rem",
                     cursor: "pointer",
                     padding: "0.75rem",
                     borderRadius: "12px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "white",
                     transition: "all 0.3s ease",
                     boxShadow: isLeftMenuOpen ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
                     minWidth: "48px",
                     minHeight: "48px",
                   }}
                   onMouseEnter={(e) => {
                     if (!isLeftMenuOpen) {
                       e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                       e.currentTarget.style.transform = "scale(1.05)";
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!isLeftMenuOpen) {
                       e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                       e.currentTarget.style.transform = "scale(1)";
                     }
                   }}
                 >
                   {isLeftMenuOpen ? "✕" : "☰"}
                 </button>
                 <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>SeaLink</h1>
        </div>

               <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <WalletConnect />
                 
                 {/* Right Hamburger Menu Button */}
                 <button
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                   style={{
                     background: isMobileMenuOpen ? "rgba(102, 126, 234, 0.8)" : "rgba(255, 255, 255, 0.15)",
                     border: "none",
                     fontSize: "1.3rem",
                     cursor: "pointer",
                     padding: "0.75rem",
                     borderRadius: "12px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "white",
                     transition: "all 0.3s ease",
                     boxShadow: isMobileMenuOpen ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
                     minWidth: "48px",
                     minHeight: "48px",
                   }}
                   onMouseEnter={(e) => {
                     if (!isMobileMenuOpen) {
                       e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                       e.currentTarget.style.transform = "scale(1.05)";
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!isMobileMenuOpen) {
                       e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                       e.currentTarget.style.transform = "scale(1)";
                     }
                   }}
                 >
                   {isMobileMenuOpen ? "✕" : "☰"}
                 </button>
        </div>
      </header>

             {/* Mobile Menu */}
             {isMobileMenuOpen && (
               <div style={{
                 position: "fixed",
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 background: "rgba(0, 0, 0, 0.6)",
                 zIndex: 1000,
                 display: "flex",
                 justifyContent: "flex-end",
               }}>
                 <div style={{
                   background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                   width: "320px",
                   height: "100%",
                   padding: "2rem 1.5rem",
                   boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.4)",
                   backdropFilter: "blur(20px)",
                   borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                 }}>
                   <div style={{
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     marginBottom: "2.5rem",
                   }}>
                     <h2 style={{ 
                       margin: 0, 
                       fontSize: "1.4rem", 
                       fontWeight: "700", 
                       color: "white",
                       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                       WebkitBackgroundClip: "text",
                       WebkitTextFillColor: "transparent",
                     }}>🚀 SeaLink</h2>
                     <button
                       onClick={() => setIsMobileMenuOpen(false)}
          style={{
                         background: "rgba(255, 255, 255, 0.15)",
                         border: "none",
                         fontSize: "1.3rem",
                         cursor: "pointer",
                         padding: "0.75rem",
            borderRadius: "12px",
                         color: "white",
                         transition: "all 0.3s ease",
                         minWidth: "48px",
                         minHeight: "48px",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                         e.currentTarget.style.transform = "scale(1.05)";
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                         e.currentTarget.style.transform = "scale(1)";
                       }}
                     >
                       ✕
                     </button>
                   </div>
                   
                   <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                     {navigationButtons.map((button) => (
                       <button
                         key={button.id}
                         onClick={() => {
                           setCurrentScreen(button.id);
                           setIsMobileMenuOpen(false);
                         }}
                         style={{
                           background: currentScreen === button.id 
                             ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                             : "rgba(255, 255, 255, 0.1)",
                           color: "white",
                           border: "none",
                           padding: "1rem 1.25rem",
                           borderRadius: "12px",
                           cursor: "pointer",
                           fontSize: "1rem",
                           fontWeight: currentScreen === button.id ? "700" : "500",
                           textAlign: "left",
                           display: "flex",
                           alignItems: "center",
                           gap: "1rem",
                           transition: "all 0.3s ease",
                           boxShadow: currentScreen === button.id 
                             ? "0 4px 15px rgba(102, 126, 234, 0.4)" 
                             : "0 2px 8px rgba(0, 0, 0, 0.2)",
                           border: currentScreen === button.id 
                             ? "1px solid rgba(255, 255, 255, 0.3)" 
                             : "1px solid rgba(255, 255, 255, 0.1)",
                         }}
                         onMouseEnter={(e) => {
                           if (currentScreen !== button.id) {
                             e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                             e.currentTarget.style.transform = "translateX(4px)";
                             e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (currentScreen !== button.id) {
                             e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                             e.currentTarget.style.transform = "translateX(0)";
                             e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                           }
                         }}
                       >
                         <span style={{ fontSize: "1.3rem" }}>{button.icon}</span>
                         {button.label}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div 
                   style={{ flex: 1 }}
                   onClick={() => setIsMobileMenuOpen(false)}
                 />
               </div>
             )}

             {/* Left Menu */}
             {isLeftMenuOpen && (
          <div style={{ 
                 position: "fixed",
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 background: "rgba(0, 0, 0, 0.6)",
                 zIndex: 1000,
                 display: "flex",
                 justifyContent: "flex-start",
               }}>
                 <div style={{
                   background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                   width: "320px",
                   height: "100%",
                   padding: "2rem 1.5rem",
                   boxShadow: "10px 0 30px rgba(0, 0, 0, 0.4)",
                   backdropFilter: "blur(20px)",
                   borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                 }}>
                   <div style={{
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     marginBottom: "2.5rem",
                   }}>
                     <h2 style={{ 
                       margin: 0, 
                       fontSize: "1.4rem", 
                       fontWeight: "700", 
            color: "white",
                       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                       WebkitBackgroundClip: "text",
                       WebkitTextFillColor: "transparent",
                     }}>🚀 SeaLink</h2>
                     <button
                       onClick={() => setIsLeftMenuOpen(false)}
                       style={{
                         background: "rgba(255, 255, 255, 0.15)",
                         border: "none",
                         fontSize: "1.3rem",
                         cursor: "pointer",
                         padding: "0.75rem",
                         borderRadius: "12px",
                         color: "white",
                         transition: "all 0.3s ease",
                         minWidth: "48px",
                         minHeight: "48px",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                         e.currentTarget.style.transform = "scale(1.05)";
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                         e.currentTarget.style.transform = "scale(1)";
                       }}
                     >
                       ✕
                     </button>
                   </div>
                   
                   <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                     {navigationButtons.map((button) => (
                       <button
                         key={button.id}
                         onClick={() => {
                           setCurrentScreen(button.id);
                           setIsLeftMenuOpen(false);
                         }}
                         style={{
                           background: currentScreen === button.id 
                             ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                             : "rgba(255, 255, 255, 0.1)",
                           color: "white",
                           border: "none",
                           padding: "1rem 1.25rem",
                           borderRadius: "12px",
                           cursor: "pointer",
                           fontSize: "1rem",
                           fontWeight: currentScreen === button.id ? "700" : "500",
                           textAlign: "left",
                           display: "flex",
                           alignItems: "center",
                           gap: "1rem",
                           transition: "all 0.3s ease",
                           boxShadow: currentScreen === button.id 
                             ? "0 4px 15px rgba(102, 126, 234, 0.4)" 
                             : "0 2px 8px rgba(0, 0, 0, 0.2)",
                           border: currentScreen === button.id 
                             ? "1px solid rgba(255, 255, 255, 0.3)" 
                             : "1px solid rgba(255, 255, 255, 0.1)",
                         }}
                         onMouseEnter={(e) => {
                           if (currentScreen !== button.id) {
                             e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                             e.currentTarget.style.transform = "translateX(-4px)";
                             e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (currentScreen !== button.id) {
                             e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                             e.currentTarget.style.transform = "translateX(0)";
                             e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                           }
                         }}
                       >
                         <span style={{ fontSize: "1.3rem" }}>{button.icon}</span>
                         {button.label}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div 
                   style={{ flex: 1 }}
                   onClick={() => setIsLeftMenuOpen(false)}
                 />
               </div>
             )}

             <main style={{ 
               flex: 1, 
               padding: "1rem", 
               maxWidth: "100%", 
               margin: "0 auto", 
               width: "100%" 
             }}>
               {renderScreen()}
             </main>

             <footer
          style={{
                 background: "rgba(44, 62, 80, 0.95)",
                 padding: "1rem",
                 textAlign: "center",
                 color: "rgba(255, 255, 255, 0.8)",
                 borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                 marginTop: "auto",
                 fontSize: "0.8rem",
                 backdropFilter: "blur(10px)",
               }}
             >
               <p style={{ margin: 0 }}>
                 Built with Sui, Walrus, and SuiNS | Part of Walrus Hackathon
               </p>
             </footer>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
          </div>
  );
}

export default App;

// Home Screen Component
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
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

      {/* NFT Marketplace Section */}
      <div style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#2c3e50",
            margin: "0 0 0.5rem 0",
          }}>
            🏪 NFT Marketplace
          </h2>
          <p style={{
            fontSize: "1rem",
            color: "#6c757d",
            margin: "0 0 2rem 0",
          }}>
            Discover, buy and sell exclusive NFTs with SUI tokens
          </p>
        </div>
        
        <Suspense fallback={
          <div style={{
            padding: "3rem",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🔄</div>
            <div style={{ color: "#6c757d", fontSize: "1rem" }}>Loading NFT Marketplace...</div>
          </div>
        }>
          <NFTMarketplace />
        </Suspense>
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

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  color, 
  onClick 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  color: string; 
  onClick: () => void; 
}) {
  return (
    <div
      onClick={onClick}
        style={{
        background: "white",
          padding: "2rem",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
      }}
    >
      <div style={{
        background: color,
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        marginBottom: "1rem",
      }}>
        {icon}
      </div>
      <h3 style={{ 
        margin: "0 0 0.5rem 0", 
        fontSize: "1.2rem", 
        fontWeight: "600",
        color: "#213547",
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: 0, 
          color: "#666",
        fontSize: "0.95rem",
        lineHeight: "1.5",
      }}>
        {description}
      </p>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: string; 
  label: string; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "600",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
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
      <span>{icon}</span>
      {label}
    </button>
  );
}

// Profile Screen Component
function ProfileScreen({ profileId, messageBoxId }: { profileId: string | null; messageBoxId: string | null }) {
  const [activeTab, setActiveTab] = useState<'create' | 'view' | 'search'>('create');

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2.5rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      maxWidth: "900px",
      margin: "0 auto",
      minHeight: "600px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2.5rem",
        flexWrap: "wrap",
        gap: "1.5rem",
      }}>
        <h2 style={{ color: "#667eea", margin: 0, fontSize: "1.8rem", fontWeight: "700" }}>👤 Profile Management</h2>
        
        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          background: "rgba(102, 126, 234, 0.1)",
          borderRadius: "12px",
          padding: "4px",
          gap: "0.5rem",
        }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: "1rem 2rem",
              border: "none",
              background: activeTab === 'create' ? "#667eea" : "transparent",
              color: activeTab === 'create' ? "white" : "#667eea",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ✨ Create
          </button>
          <button
            onClick={() => setActiveTab('view')}
            style={{
              padding: "1rem 2rem",
              border: "none",
              background: activeTab === 'view' ? "#667eea" : "transparent",
              color: activeTab === 'view' ? "white" : "#667eea",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            👁️ View
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: "1rem 2rem",
              border: "none",
              background: activeTab === 'search' ? "#667eea" : "transparent",
              color: activeTab === 'search' ? "white" : "#667eea",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🔍 Search
          </button>
        </div>
          </div>

      {/* Tab Content */}
      <div style={{
        minHeight: "400px",
        padding: "1.5rem",
        background: "rgba(102, 126, 234, 0.05)",
        borderRadius: "16px",
        border: "1px solid rgba(102, 126, 234, 0.1)",
      }}>
        {activeTab === 'create' && (
          <div>
            <CreateProfile onSuccess={(id) => {
              console.log('profile created', id);
              setActiveTab('view'); // Profil oluşturulduktan sonra görüntüleme sekmesine geç
            }} />
          </div>
        )}

        {activeTab === 'view' && (
          <div>
            <h3 style={{ color: "#667eea", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>Profile Preview</h3>
              <ViewProfile />
            </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h3 style={{ color: "#667eea", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>Search Profile</h3>
            <ProfileSearch />
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '3rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Yükleniyor...</p>
      </div>
    </div>
  );
}

// Messages Screen Component
function MessagesScreen({ messageBoxId }: { messageBoxId: string | null }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      maxWidth: "700px",
      margin: "0 auto",
    }}>
      <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem", textAlign: "center" }}>💬 My Messages</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <SealedMessagesView messageBoxId={messageBoxId} isOwner={true} />
      </Suspense>
    </div>
  );
}

// NFT Gallery Screen Component
function NFTGalleryScreen() {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    }}>
      <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>🎨 My NFT Gallery</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <NFTGallery profileId="demo" isOwner={true} />
      </Suspense>
    </div>
  );
}

// Create NFT Screen Component
function CreateNFTScreen() {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    }}>
      <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>✨ Create NFT</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <CreateNFT />
      </Suspense>
    </div>
  );
}

// NFT Marketplace Screen Component
function NFTMarketplaceScreen() {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    }}>
      <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>🛒 NFT Marketplace</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <NFTMarketplace />
      </Suspense>
    </div>
  );
}

// Send Message Screen Component
function SendMessageScreen({ messageBoxId }: { messageBoxId: string | null }) {
  return (
          <div style={{ 
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    }}>
      <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>📤 Send Message</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <SealedMessaging messageBoxId={messageBoxId} />
      </Suspense>
    </div>
  );
}

// Profile Search Component with SUI NS support
function ProfileSearch() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const suiClient = useSuiClient();

  // SUI NS name resolution
  const resolveSuiNSName = async (name: string): Promise<string | null> => {
    try {
      // Basic SUI NS validation
      if (!name.includes('.') || !name.endsWith('.sui')) return null;
      
      console.log("🔍 Resolving SUI NS name:", name);
      
      const result = await suiClient.resolveNameServiceAddress({ name });
      console.log("✅ SUI NS resolved:", result);
      return result;
    } catch (error) {
      console.warn("⚠️ SUI NS resolution failed:", error);
      return null;
    }
  };

  // Demo profiller oluştur
  const createDemoProfiles = () => {
    const demoProfiles = [
      {
        id: "demo_user_1",
        owner: "0x1234567890abcdef1234567890abcdef12345678",
        username: "Alice",
        bio: "Blockchain geliştirici ve NFT sanatçısı. Sui ekosisteminde aktif.",
        avatar_cid: "",
        links: [
          { label: "Twitter", url: "https://twitter.com/alice" },
          { label: "GitHub", url: "https://github.com/alice" },
          { label: "Portfolio", url: "https://alice.dev" }
        ],
        theme: "light",
        created_at: Math.floor(Date.now() / 1000) - 86400,
        updated_at: Math.floor(Date.now() / 1000) - 86400,
        messageBoxId: "msgbox_demo_1",
        demo: true
      },
      {
        id: "demo_user_2", 
        owner: "0xabcdef1234567890abcdef1234567890abcdef12",
        username: "Bob",
        bio: "DeFi uzmanı ve kripto yatırımcısı. Walrus hackathon katılımcısı.",
        avatar_cid: "",
        links: [
          { label: "LinkedIn", url: "https://linkedin.com/in/bob" },
          { label: "Medium", url: "https://medium.com/@bob" },
          { label: "Discord", url: "https://discord.gg/bob" }
        ],
        theme: "dark",
        created_at: Math.floor(Date.now() / 1000) - 172800,
        updated_at: Math.floor(Date.now() / 1000) - 172800,
        messageBoxId: "msgbox_demo_2",
        demo: true
      },
      {
        id: "demo_user_3",
        owner: "0x9876543210fedcba9876543210fedcba98765432",
        username: "Charlie",
        bio: "Web3 tasarımcı ve UI/UX uzmanı. Merkezi olmayan uygulamalar tasarlıyorum.",
        avatar_cid: "",
        links: [
          { label: "Dribbble", url: "https://dribbble.com/charlie" },
          { label: "Behance", url: "https://behance.net/charlie" },
          { label: "Instagram", url: "https://instagram.com/charlie" }
        ],
        theme: "light",
        created_at: Math.floor(Date.now() / 1000) - 259200,
        updated_at: Math.floor(Date.now() / 1000) - 259200,
        messageBoxId: "msgbox_demo_3",
        demo: true
      }
    ];

    const key = "sealink:profiles";
    const raw = localStorage.getItem(key);
    const profiles: Record<string, any> = raw ? JSON.parse(raw) : {};
    
    // Demo profilleri ekle
    demoProfiles.forEach(profile => {
      profiles[profile.id] = profile;
    });
    
    localStorage.setItem(key, JSON.stringify(profiles));
    
    // Also add demo messages
    const demoMessages = [
      {
        id: "demo_msg_1",
        sealBlobId: "demo_blob_1",
        senderHash: "0x1234",
        senderName: "Anonymous",
        isAnonymous: true,
        createdAt: Math.floor(Date.now() / 1000) - 3600,
        content: "Hello Alice! You've created a great profile. I want to work on blockchain projects."
      },
      {
        id: "demo_msg_2", 
        sealBlobId: "demo_blob_2",
        senderHash: "0x5678",
        senderName: "Bob",
        isAnonymous: false,
        createdAt: Math.floor(Date.now() / 1000) - 7200,
        content: "Alice, your NFT art is very impressive! Can we work on a project together?"
      },
      {
        id: "demo_msg_3",
        sealBlobId: "demo_blob_3", 
        senderHash: "0x9abc",
        senderName: "Anonymous",
        isAnonymous: true,
        createdAt: Math.floor(Date.now() / 1000) - 10800,
        content: "SeaLink platformu gerçekten harika! Walrus entegrasyonu mükemmel çalışıyor."
      }
    ];
    
    // Add demo messages to localStorage
    demoMessages.forEach(msg => {
      const msgKey = `sealink:messages:${msg.id}`;
      localStorage.setItem(msgKey, JSON.stringify([msg]));
    });
    
    return profiles;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      // Önce demo profilleri oluştur
      const profiles = createDemoProfiles();

      const results = Object.values(profiles).filter((profile: any) => 
        profile.username.toLowerCase().includes(trimmed.toLowerCase()) ||
        profile.bio.toLowerCase().includes(trimmed.toLowerCase()) ||
        profile.owner.toLowerCase().includes(trimmed.toLowerCase()) ||
        profile.id.toLowerCase().includes(trimmed.toLowerCase())
      );

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time search effect with SUI NS support
  useEffect(() => {
    const trimmed = searchInput.trim();
    
    if (trimmed.length === 0) {
      setSearchResults([]);
      return;
    }

    // Debounce search - wait 300ms after user stops typing
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        
        // Check if input is a SUI NS name
        if (trimmed.includes('.') && trimmed.endsWith('.sui')) {
          console.log("🔍 SUI NS name detected:", trimmed);
          const resolvedAddress = await resolveSuiNSName(trimmed);
          
          if (resolvedAddress) {
            // Search for profile by resolved address
            const profiles = createDemoProfiles();
            const addressResults = Object.values(profiles).filter((profile: any) => 
              profile.owner.toLowerCase() === resolvedAddress.toLowerCase()
            );
            
            if (addressResults.length > 0) {
              setSearchResults(addressResults);
              setLoading(false);
              return;
            }
          }
        }
        
        // Regular search in profiles
        const profiles = createDemoProfiles();
        const results = Object.values(profiles).filter((profile: any) => 
          profile.username.toLowerCase().includes(trimmed.toLowerCase()) ||
          profile.bio.toLowerCase().includes(trimmed.toLowerCase()) ||
          profile.owner.toLowerCase().includes(trimmed.toLowerCase()) ||
          profile.id.toLowerCase().includes(trimmed.toLowerCase())
        );

        setSearchResults(results);
      } catch (error) {
        console.error("❌ Search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, suiClient]);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}>
        <input
          type="text"
          placeholder="Search by username, bio, wallet address or SUI NS name... (e.g. Alice, Bob, name.sui)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "0.75rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "1rem",
            background: "white",
            color: "#333",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: loading ? "#ccc" : "rgba(102, 126, 234, 0.1)",
            color: loading ? "#666" : "#667eea",
            border: "1px solid rgba(102, 126, 234, 0.3)",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {loading ? "🔄" : "🔍"} {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Quick Search Suggestions */}
      <div style={{
        marginBottom: "1.5rem",
        padding: "1rem",
        background: "rgba(102, 126, 234, 0.05)",
        borderRadius: "8px",
        border: "1px solid rgba(102, 126, 234, 0.1)",
      }}>
        <h5 style={{ margin: "0 0 0.75rem 0", color: "#667eea", fontSize: "0.9rem" }}>
          💡 Quick Search Suggestions:
        </h5>
        <div style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}>
          {["Alice", "Bob", "Charlie", "Blockchain", "DeFi", "Web3"].map((term) => (
            <button
              key={term}
              onClick={() => setSearchInput(term)}
              style={{
                padding: "0.25rem 0.75rem",
                background: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "0.8rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
              }}
            >
              {term}
            </button>
          ))}
            </div>
          </div>

      {/* Search Results */}
      {searchInput && (
        <div style={{
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.5rem",
          border: "1px solid rgba(102, 126, 234, 0.1)",
        }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#667eea", fontSize: "1.1rem", fontWeight: "600" }}>
            🔍 Searchma Sonuçları ({searchResults.length})
          </h4>
          
          {searchResults.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
              {searchResults.map((profile: any) => (
                <div
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e9ecef",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}>
                    {profile.avatar_cid && (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${profile.avatar_cid}`}
                        alt={profile.username}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div>
                      <h5 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>
                        @{profile.username}
                      </h5>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>
                        {profile.owner.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#555",
                    lineHeight: "1.4",
                  }}>
                    {profile.bio}
                  </p>
                  <div style={{
                    marginTop: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#888",
                  }}>
                    {profile.links?.length || 0} link • {new Date(profile.created_at * 1000).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              ))}
            </div>
          ) : searchInput.length > 0 ? (
            <div style={{
              textAlign: "center",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
              <p style={{ margin: 0, color: "#666" }}>
                No results found for "{searchInput}"
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Profile View */}
      {selectedProfile && (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #e9ecef",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}>
            <h4 style={{ margin: 0, color: "#667eea" }}>👤 Selected Profile</h4>
            <button
              onClick={() => setSelectedProfile(null)}
        style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ✕ Kapat
            </button>
          </div>
          <ViewProfile profileId={selectedProfile} />
        </div>
      )}
    </div>
  );
}

function ProfileLookup() {
  const [input, setInput] = useState("");
  const [viewAddr, setViewAddr] = useState<string | null>(null);
  const [walrusBlob, setWalrusBlob] = useState<string | null>(null);

  const handleView = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // If input looks like a wallet address (0x...), treat as profileId. Otherwise treat as walrus blob id.
    if (trimmed.startsWith("0x")) {
      setWalrusBlob(null);
      setViewAddr(trimmed);
      return;
    }

    // Otherwise, try to fetch from Walrus as a blob id
    setViewAddr(null);
    setWalrusBlob(trimmed);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <form onSubmit={handleView} style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Enter wallet address (0x...) or Walrus blob id"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">View</button>
        <button type="button" onClick={() => { setInput(""); setViewAddr(null); setWalrusBlob(null); }}>Clear</button>
      </form>

      {viewAddr && (
        <div style={{ marginTop: 12 }}>
          <ViewProfile profileId={viewAddr} />
        </div>
      )}

      {walrusBlob && (
        <div style={{ marginTop: 12 }}>
          <WalrusProfile blobId={walrusBlob} />
        </div>
      )}
    </div>
  );
}

function WalrusProfile({ blobId }: { blobId: string }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://aggregator-mainnet.walrus.space/v1/blobs/${blobId}`);
        if (!res.ok) throw new Error('Walrus blob not found');
        const text = await res.text();
        // Blob may be plain JSON text
        try {
          const parsed = JSON.parse(text);
          setProfile(parsed);
        } catch (e) {
          setProfile({ raw: text });
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [blobId]);

  if (loading) return <div>Loading Walrus profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  if (profile.raw) {
    return <pre style={{ whiteSpace: 'pre-wrap' }}>{profile.raw}</pre>;
  }

  return (
    <div>
      <h4>{profile.username || 'Profile'}</h4>
      {profile.avatar_cid && (
        <img src={`https://gateway.pinata.cloud/ipfs/${profile.avatar_cid}`} alt={profile.username} style={{ maxWidth: 120 }} />
      )}
      <p>{profile.bio}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(profile.links || []).map((l: any, i: number) => (
          <a key={i} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <a href={`https://aggregator-mainnet.walrus.space/v1/blobs/${blobId}`} target="_blank" rel="noreferrer">View raw on Walrus</a>
      </div>
    </div>
  );
}
