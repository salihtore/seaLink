import { useState, useEffect, useCallback, memo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface NFT {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'photo' | 'video' | 'art' | 'exclusive';
  imageUrl: string;
  isPremium: boolean;
  owner: string;
  creator: string;
  createdAt: number;
  walrusBlobId: string;
  sold: boolean;
}

export const NFTMarketplace = memo(() => {
  const account = useCurrentAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // Load NFTs from localStorage and Walrus
  const loadNFTs = useCallback(async () => {
    setLoading(true);
    try {
      const key = "sealink:nfts";
      const raw = localStorage.getItem(key);
      const storedNFTs: NFT[] = raw ? JSON.parse(raw) : [];

      // Load demo NFTs
      const demoNFTs: NFT[] = [
        {
          id: "demo_nft_1",
          title: "Blockchain Art #1",
          description: "Dijital sanat eseri - Sui ekosisteminden ilham alınmış",
          price: 5.0,
          category: 'art',
          imageUrl: "https://via.placeholder.com/300x300/667eea/ffffff?text=Blockchain+Art",
          isPremium: true,
          owner: "demo_user_1",
          creator: "Alice",
          createdAt: Date.now() - 86400000,
          walrusBlobId: "demo_nft_blob_1",
          sold: false
        },
        {
          id: "demo_nft_2",
          title: "DeFi Masterclass",
          description: "Exclusive DeFi strategies and analysis report",
          price: 10.0,
          category: 'exclusive',
          imageUrl: "https://via.placeholder.com/300x300/4ecdc4/ffffff?text=DeFi+Masterclass",
          isPremium: true,
          owner: "demo_user_2",
          creator: "Bob",
          createdAt: Date.now() - 172800000,
          walrusBlobId: "demo_nft_blob_2",
          sold: false
        },
        {
          id: "demo_nft_3",
          title: "Web3 Design Kit",
          description: "Modern Web3 uygulamaları için tasarım kiti",
          price: 3.0,
          category: 'art',
          imageUrl: "https://via.placeholder.com/300x300/ff6b6b/ffffff?text=Web3+Design+Kit",
          isPremium: false,
          owner: "demo_user_3",
          creator: "Charlie",
          createdAt: Date.now() - 259200000,
          walrusBlobId: "demo_nft_blob_3",
          sold: false
        }
      ];

      // Combine stored and demo NFTs
      const allNFTs = [...storedNFTs, ...demoNFTs];
      
      // Save demo NFTs to localStorage
      const updatedNFTs = [...storedNFTs];
      demoNFTs.forEach(demoNFT => {
        if (!updatedNFTs.find(nft => nft.id === demoNFT.id)) {
          updatedNFTs.push(demoNFT);
        }
      });
      localStorage.setItem(key, JSON.stringify(updatedNFTs));

      setNfts(allNFTs);
    } catch (err) {
      console.error("NFT loading error:", err);
      setError("NFT'ler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  // Buy NFT with SUI tokens
  const handleBuyNFT = useCallback(async (nft: NFT) => {
    if (!account) {
      setError("Please connect your wallet to purchase NFT");
      return;
    }

    if (nft.owner === account.address) {
      setError("You cannot purchase your own NFT");
      return;
    }

    try {
      setLoading(true);
      
      // Check if NFT is free (price = 0)
      if (nft.price === 0) {
        console.log(`🆓 Claiming free NFT: ${nft.title}`);
        
        // For free NFTs, just update ownership without payment
        const key = "sealink:nfts";
        const raw = localStorage.getItem(key);
        const storedNFTs: NFT[] = raw ? JSON.parse(raw) : [];
        
        const updatedNFTs = storedNFTs.map(storedNFT => 
          storedNFT.id === nft.id 
            ? { ...storedNFT, owner: account.address, sold: true }
            : storedNFT
        );
        
        localStorage.setItem(key, JSON.stringify(updatedNFTs));
        
        // Update local state
        setNfts(prev => prev.map(prevNFT => 
          prevNFT.id === nft.id 
            ? { ...prevNFT, owner: account.address, sold: true }
            : prevNFT
        ));

        console.log("✅ Free NFT claimed successfully!");
        setError(null);
        return;
      }
      
      // For paid NFTs, check balance first, then simulate SUI transaction
      console.log(`🛒 Buying NFT: ${nft.title} for ${nft.price} SUI`);
      
      // TODO: Check actual SUI balance from wallet
      // For now, simulate balance check
      const simulatedBalance = 100; // This should be actual balance from SuiClient
      if (simulatedBalance < nft.price) {
        setError(`Insufficient balance. Required: ${nft.price} SUI, Available: ${simulatedBalance} SUI`);
        return;
      }
      
      // Simulate transaction (TODO: Replace with actual Sui transaction)
      console.log(`💰 Simulating ${nft.price} SUI payment...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Update NFT ownership only after successful "payment"
      const key = "sealink:nfts";
      const raw = localStorage.getItem(key);
      const storedNFTs: NFT[] = raw ? JSON.parse(raw) : [];
      
      const updatedNFTs = storedNFTs.map(storedNFT => 
        storedNFT.id === nft.id 
          ? { ...storedNFT, owner: account.address, sold: true }
          : storedNFT
      );
      
      localStorage.setItem(key, JSON.stringify(updatedNFTs));
      
      // Update local state
      setNfts(prev => prev.map(prevNFT => 
        prevNFT.id === nft.id 
          ? { ...prevNFT, owner: account.address, sold: true }
          : prevNFT
      ));

      console.log("✅ NFT purchased successfully!");
      setError(null);
      
    } catch (err) {
      console.error("NFT purchase error:", err);
      setError("An error occurred while purchasing NFT");
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Filter and sort NFTs
  const filteredNFTs = nfts
    .filter(nft => selectedCategory === 'all' || nft.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem",
        borderBottom: "1px solid #dbdbdb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "1.1rem", 
          fontWeight: "600",
          color: "#262626",
        }}>
          NFT Marketplace
        </h3>
        <span style={{
          background: "#f0f0f0",
          padding: "0.25rem 0.5rem",
          borderRadius: "12px",
          fontSize: "0.8rem",
          fontWeight: "500",
          color: "#8e8e8e",
        }}>
          {filteredNFTs.length} NFT
        </span>
      </div>

        {/* Filters */}
        <div style={{
          padding: "1rem",
          borderBottom: "1px solid #dbdbdb",
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
        }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #dbdbdb",
              borderRadius: "6px",
              fontSize: "0.9rem",
              background: "white",
              color: "#262626",
              minWidth: "120px",
            }}
          >
            <option value="all">All Categories</option>
            <option value="photo">Photo</option>
            <option value="video">Video</option>
            <option value="art">Art</option>
            <option value="exclusive">Exclusive Content</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "0.5rem",
              border: "1px solid #dbdbdb",
              borderRadius: "6px",
              fontSize: "0.9rem",
              background: "white",
              color: "#262626",
              minWidth: "120px",
            }}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price (Low)</option>
            <option value="price-high">Price (High)</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#fee',
            color: '#d32f2f',
            padding: '0.75rem 1rem',
            margin: '1rem',
            borderRadius: '6px',
            border: '1px solid #ffcdd2',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* NFT Grid */}
        {loading ? (
          <div style={{
            padding: "2rem",
            textAlign: "center",
            color: "#8e8e8e",
          }}>
            <div style={{
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
            }}>
              Yükleniyor...
            </div>
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div style={{
            padding: "2rem",
            textAlign: "center",
            color: "#8e8e8e",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>store</div>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Bu kategoride henüz NFT yok
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "0.75rem",
            padding: "1rem",
          }}>
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* NFT Image */}
                <div style={{
                  width: "100%",
                  height: "120px",
                  background: `url(${nft.imageUrl}) center/cover`,
                  position: "relative",
                }}>
                  {nft.isPremium && (
                    <div style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "#ffd700",
                      color: "#000",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "8px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                    }}>
                      Premium
                    </div>
                  )}
                  {nft.sold && (
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}>
                      Satıldı
                    </div>
                  )}
                </div>

                {/* NFT Info */}
                <div style={{ padding: "0.75rem" }}>
                  <h4 style={{ 
                    margin: "0 0 0.25rem 0", 
                    fontSize: "0.9rem", 
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#262626",
                  }}>
                    {nft.title}
                  </h4>
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}>
                    <div style={{
                      fontSize: "0.8rem",
                      color: "#8e8e8e",
                    }}>
                      {nft.creator}
                    </div>
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#262626",
                    }}>
                      {nft.price} SUI
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyNFT(nft)}
                    disabled={loading || nft.sold || nft.owner === account?.address}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: nft.sold || nft.owner === account?.address
                        ? "#f0f0f0"
                        : "#0095f6",
                      color: nft.sold || nft.owner === account?.address ? "#8e8e8e" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: nft.sold || nft.owner === account?.address ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {nft.sold ? "Sold" : 
                     nft.owner === account?.address ? "Your NFT" : 
                     "Satın Al"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
});
