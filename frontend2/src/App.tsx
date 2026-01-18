import { CSSProperties, useState, useEffect } from "react";
import { WalletConnect } from "./components/WalletConnect";
import { HomeScreen } from "./components/screens/HomeScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { MessagesScreen } from "./components/screens/MessagesScreen";
import { NFTGalleryScreen } from "./components/screens/NFTGalleryScreen";
import { CreateNFTScreen } from "./components/screens/CreateNFTScreen";
import { NFTMarketplaceScreen } from "./components/screens/NFTMarketplaceScreen";
import { SendMessageScreen } from "./components/screens/SendMessageScreen";

type Screen = 'home' | 'profile' | 'messages' | 'nft-gallery' | 'create-nft' | 'send-message' | 'nft-marketplace';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

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
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
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
        return <HomeScreen />;
    }
  };

  return (
    <div style={containerStyle}>
      <header style={{
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
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
            style={{ /* Styles... kept simple for brevity if this file was huge, but will inline significant ones */
              background: isLeftMenuOpen ? "rgba(102, 126, 234, 0.8)" : "rgba(255, 255, 255, 0.15)",
              border: "none", fontSize: "1.3rem", cursor: "pointer", padding: "0.75rem", borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white", minWidth: "48px", minHeight: "48px",
            }}
          >
            {isLeftMenuOpen ? "✕" : "☰"}
          </button>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>SeaLink</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <WalletConnect />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: isMobileMenuOpen ? "rgba(102, 126, 234, 0.8)" : "rgba(255, 255, 255, 0.15)",
              border: "none", fontSize: "1.3rem", cursor: "pointer", padding: "0.75rem", borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white", minWidth: "48px", minHeight: "48px",
            }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Menus logic is same, can be extracted too but fits okay here */}
      {isMobileMenuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.6)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <MenuContent buttons={navigationButtons} currentScreen={currentScreen} onNavigate={(id: Screen) => { setCurrentScreen(id); setIsMobileMenuOpen(false); }} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {isLeftMenuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.6)", zIndex: 1000, display: "flex", justifyContent: "flex-start" }}>
          <MenuContent buttons={navigationButtons} currentScreen={currentScreen} onNavigate={(id: Screen) => { setCurrentScreen(id); setIsLeftMenuOpen(false); }} onClose={() => setIsLeftMenuOpen(false)} isLeft />
        </div>
      )}

      <main style={{ flex: 1, padding: "1rem", maxWidth: "100%", margin: "0 auto", width: "100%" }}>
        {renderScreen()}
      </main>

      <footer style={{
        background: "rgba(44, 62, 80, 0.95)", padding: "1rem", textAlign: "center", color: "rgba(255, 255, 255, 0.8)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)", marginTop: "auto", fontSize: "0.8rem", backdropFilter: "blur(10px)",
      }}>
        <p style={{ margin: 0 }}>Built with Sui, Walrus, and SuiNS | Part of Walrus Hackathon</p>
      </footer>
    </div>
  );
}

function MenuContent({ buttons, currentScreen, onNavigate, onClose, isLeft = false }: any) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)", width: "320px", height: "100%", padding: "2rem 1.5rem",
      boxShadow: "0 0 30px rgba(0, 0, 0, 0.4)", backdropFilter: "blur(20px)", borderRight: isLeft ? "1px solid rgba(255, 255, 255, 0.1)" : "none", borderLeft: !isLeft ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "white", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🚀 SeaLink</h2>
        <button onClick={onClose} style={{ background: "rgba(255, 255, 255, 0.15)", border: "none", fontSize: "1.3rem", cursor: "pointer", padding: "0.75rem", borderRadius: "12px", color: "white", minWidth: "48px", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {buttons.map((button: any) => (
          <button
            key={button.id}
            onClick={() => onNavigate(button.id)}
            style={{
              background: currentScreen === button.id ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
              color: "white", border: "none", padding: "1rem 1.25rem", borderRadius: "12px", cursor: "pointer", fontSize: "1rem", fontWeight: currentScreen === button.id ? "700" : "500",
              textAlign: "left", display: "flex", alignItems: "center", gap: "1rem", transition: "all 0.3s ease",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>{button.icon}</span>{button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
