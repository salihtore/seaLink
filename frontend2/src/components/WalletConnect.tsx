import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from "@mysten/dapp-kit";
import { useState } from "react";

export function WalletConnect() {
  const account = useCurrentAccount();
  const { mutateAsync: connectAsync, isLoading } = useConnectWallet() as any;
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const [error, setError] = useState<string | null>(null);

  const handleDisconnect = () => {
    disconnect();
  };

  if (account) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Connection Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#4CAF50',
          fontSize: '0.9rem',
          fontWeight: '600',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
            animation: 'pulse 2s infinite',
          }} />
          <span>Connected</span>
        </div>
        
        {/* Wallet Address */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: '#4CAF50',
          fontWeight: '500',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={() => {
          navigator.clipboard.writeText(account.address);
          alert('Address copied to clipboard!');
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
        
        {/* Disconnect Button */}
        <button 
          onClick={handleDisconnect} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
            minWidth: '100px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  const handleConnect = async () => {
    setError(null);
    try {
      console.log("WalletConnect: invoking connect...");
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallets available - install a Wallet Standard compatible extension or provider.");
      }

      // pick the first wallet that supports standard:connect
      const candidate = wallets.find((w: any) => w?.features && w.features['standard:connect']);
      if (!candidate) {
        throw new Error("No compatible wallet found that supports standard:connect");
      }

      const res = await connectAsync({ wallet: candidate } as any);
      console.log("WalletConnect: connect result:", res);
    } catch (err: any) {
      console.error("WalletConnect error:", err);
      setError(err?.message || String(err));
      alert("Wallet connect failed: " + (err?.message || String(err)));
    }
  };

  return (
    <div className="wallet-connect">
      <button 
        onClick={handleConnect} 
        disabled={isLoading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: isLoading ? '#666' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: isLoading ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)',
          minWidth: '140px',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#5a6fd8';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#667eea';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }
        }}
      >
        {isLoading ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && (
        <div style={{ 
          color: "#ff6b6b", 
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid rgba(255, 107, 107, 0.3)',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
