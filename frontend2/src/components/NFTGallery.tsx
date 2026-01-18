import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";

interface NFTContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number; // SUI amount
  isPremium: boolean;
  creator: string;
  createdAt: number;
  category: 'photo' | 'video' | 'art' | 'exclusive';
  isPurchased?: boolean;
  isOwned?: boolean;
}

interface NFTGalleryProps {
  profileId: string;
  isOwner: boolean;
}

const SUI_DECIMALS = 9; // SUI has 9 decimal places

export function NFTGallery({ profileId, isOwner }: NFTGalleryProps) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  const [nfts, setNfts] = useState<NFTContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Mock NFT data - in production, this would come from blockchain
  const mockNFTs: NFTContent[] = [
    {
      id: 'nft_1',
      title: 'Exclusive Photo Set 1',
      description: 'Premium photo collection with high-quality images',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      price: 5, // 5 SUI
      isPremium: true,
      creator: profileId,
      createdAt: Date.now() - 86400000,
      category: 'photo'
    },
    {
      id: 'nft_2',
      title: 'Behind the Scenes Video',
      description: 'Exclusive behind the scenes content',
      imageUrl: 'https://picsum.photos/400/300?random=2',
      price: 10, // 10 SUI
      isPremium: true,
      creator: profileId,
      createdAt: Date.now() - 172800000,
      category: 'video'
    },
    {
      id: 'nft_3',
      title: 'Digital Art Collection',
      description: 'Unique digital artwork created by the artist',
      imageUrl: 'https://picsum.photos/400/300?random=3',
      price: 15, // 15 SUI
      isPremium: true,
      creator: profileId,
      createdAt: Date.now() - 259200000,
      category: 'art'
    },
    {
      id: 'nft_4',
      title: 'Free Preview',
      description: 'Free preview content for everyone',
      imageUrl: 'https://picsum.photos/400/300?random=4',
      price: 0,
      isPremium: false,
      creator: profileId,
      createdAt: Date.now() - 345600000,
      category: 'photo'
    }
  ];

  useEffect(() => {
    loadNFTs();
  }, [profileId]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // In production, fetch from blockchain or IPFS
      // For now, use mock data
      setNfts(mockNFTs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (nft: NFTContent) => {
    if (!account) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    if (nft.isOwned || nft.isPurchased) {
      alert('You already own this NFT');
      return;
    }

    setPurchasing(nft.id);

    try {
      // Check if NFT is free (price = 0)
      if (nft.price === 0) {
        console.log(`🆓 Claiming free NFT: ${nft.title}`);
        
        // For free NFTs, just mark as owned without payment
        setNfts(prev => prev.map(prevNft => 
          prevNft.id === nft.id 
            ? { ...prevNft, isOwned: true, isPurchased: true }
            : prevNft
        ));
        
        console.log("✅ Free NFT claimed successfully!");
        alert('Free NFT claimed successfully!');
        return;
      }

      // For paid NFTs, proceed with SUI transaction
      console.log(`🛒 Purchasing NFT: ${nft.title} for ${nft.price} SUI`);
      
      // Convert SUI amount to smallest unit
      const amountInMist = BigInt(nft.price * Math.pow(10, SUI_DECIMALS));
      
      // Create transaction to transfer SUI
      const tx = {
        kind: 'transferSui',
        data: {
          recipient: nft.creator,
          amount: amountInMist.toString()
        }
      };

      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transactionBlock: tx as any },
          {
            onSuccess: (result: any) => {
              console.log('Purchase successful:', result);
              // Update NFT as purchased
              setNfts(prev => prev.map(n => 
                n.id === nft.id ? { ...n, isPurchased: true } : n
              ));
              alert(`Successfully purchased "${nft.title}" for ${nft.price} SUI!`);
              resolve();
            },
            onError: (error: any) => {
              console.error('Purchase failed:', error);
              alert('Purchase failed. Please try again.');
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const filteredNFTs = selectedCategory === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.category === selectedCategory);

  const categories = ['all', 'photo', 'video', 'art', 'exclusive'];

  if (loading) return <div>Loading NFT gallery...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      maxWidth: "1000px",
      margin: "0 auto",
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: "2rem",
      }}>
        <h3 style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          color: "#667eea",
          margin: "0 0 0.5rem 0",
        }}>🎨 My NFT Gallery</h3>
        <p style={{
          fontSize: "1.1rem",
          color: "#666",
          margin: "0 0 1.5rem 0",
        }}>Premium NFT Gallery</p>
        <p style={{
          fontSize: "0.9rem",
          color: "#888",
          margin: "0 0 2rem 0",
        }}>Exclusive content available for purchase with SUI</p>
        
        {/* Category Filter */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '0.75rem 1.5rem',
                margin: '0.25rem',
                border: '1px solid #ddd',
                borderRadius: '25px',
                backgroundColor: selectedCategory === category ? '#667eea' : 'white',
                color: selectedCategory === category ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: selectedCategory === category ? '0 4px 15px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '1rem'
      }}>
        {filteredNFTs.map(nft => (
          <div key={nft.id} style={{
            border: '1px solid #e9ecef',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
          }}>
            <div className="nft-image" style={{ position: 'relative' }}>
              <img 
                src={nft.imageUrl} 
                alt={nft.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />
              {nft.isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  PREMIUM
                </div>
              )}
              {nft.isOwned || nft.isPurchased ? (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  OWNED
                </div>
              ) : null}
            </div>
            
            <div style={{ padding: '1.25rem' }}>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#333',
                lineHeight: '1.3'
              }}>
                {nft.title}
              </h4>
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: '#666', 
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {nft.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  backgroundColor: '#f8f9fa',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  color: '#666',
                  fontWeight: '600'
                }}>
                  {nft.category.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: nft.price === 0 ? '#28a745' : '#667eea'
                }}>
                  {nft.price === 0 ? 'FREE' : `${nft.price} SUI`}
                </span>
              </div>

              {!isOwner && (
                <button
                  onClick={() => handlePurchase(nft)}
                  disabled={purchasing === nft.id || nft.isOwned || nft.isPurchased}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: nft.isOwned || nft.isPurchased ? '#28a745' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: nft.isOwned || nft.isPurchased ? 'default' : 'pointer',
                    opacity: purchasing === nft.id ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!nft.isOwned && !nft.isPurchased && purchasing !== nft.id) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!nft.isOwned && !nft.isPurchased && purchasing !== nft.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  {purchasing === nft.id ? 'Processing...' : 
                   nft.isOwned || nft.isPurchased ? 'Owned' :
                   nft.price === 0 ? 'View Free' : `Buy for ${nft.price} SUI`}
                </button>
              )}

              {isOwner && (
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <p>No NFTs found in this category.</p>
        </div>
      )}
    </div>
  );
}
