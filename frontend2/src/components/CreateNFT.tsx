import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { walrusApi } from "../utils/walrusApi";

interface CreateNFTProps {
  onNFTCreated?: (nftId: string) => void;
}

interface NFTFormData {
  title: string;
  description: string;
  price: number;
  category: 'photo' | 'video' | 'art' | 'exclusive';
  imageFile: File | null;
  isPremium: boolean;
}

export function CreateNFT({ onNFTCreated }: CreateNFTProps) {
  const account = useCurrentAccount();
  // const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock(); // Will be used for on-chain NFT creation
  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    price: 0,
    category: 'photo',
    imageFile: null,
    isPremium: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadToIPFS = async (_file: File): Promise<string> => {
    // In production, use real IPFS upload
    // For now, return a mock URL
    return `https://picsum.photos/400/300?random=${Date.now()}`;
  };

  const createNFTOnChain = async (_nftData: any): Promise<string> => {
    // In production, create NFT on Sui blockchain
    // For now, return a mock NFT ID
    return `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      setError('Please connect your wallet to create NFTs');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.imageFile) {
      setError('Please select an image file');
      return;
    }

    if (formData.isPremium && formData.price <= 0) {
      setError('Please enter a valid price for premium content');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload image to IPFS
      console.log('📤 Uploading image to IPFS...');
      const imageUrl = await uploadToIPFS(formData.imageFile);
      console.log('✅ Image uploaded:', imageUrl);

      // 2. Create NFT metadata
      const nftMetadata = {
        title: formData.title,
        description: formData.description,
        imageUrl,
        price: formData.price,
        isPremium: formData.isPremium,
        category: formData.category,
        creator: account.address,
        createdAt: Date.now()
      };

      // 3. Upload NFT metadata to Walrus (mandatory for cross-browser access)
      console.log('📤 Uploading NFT metadata to Walrus...');
      const walrusBlobId = await walrusApi.uploadBlob(
        JSON.stringify(nftMetadata, null, 2),
        `nft_${nftMetadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      );
      console.log('✅ NFT metadata uploaded to Walrus:', walrusBlobId);
      
      // Add Walrus blob ID to metadata
      (nftMetadata as any).walrusBlobId = walrusBlobId;

      // 4. Create NFT on blockchain
      console.log('🔗 Creating NFT on blockchain...');
      const nftId = await createNFTOnChain(nftMetadata);
      console.log('✅ NFT created:', nftId);

      // 5. Store locally with Walrus reference
      const key = `sealink:nfts:${account.address}`;
      const existingNFTs = JSON.parse(localStorage.getItem(key) || '[]');
      existingNFTs.push({ id: nftId, ...nftMetadata });
      localStorage.setItem(key, JSON.stringify(existingNFTs));
      console.log('✅ NFT stored locally with Walrus reference');

      setSuccess(true);
      if (onNFTCreated) onNFTCreated(nftId);

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: 'photo',
        imageFile: null,
        isPremium: false
      });
      setPreviewUrl(null);

    } catch (error) {
      console.error('❌ NFT creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'NFT oluşturulamadı';
      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      maxWidth: "600px",
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
        }}>✨ Create NFT</h3>
        <p style={{
          fontSize: "1.1rem",
          color: "#bdc3c7",
          margin: "0 0 0.5rem 0",
        }}>🎨 Create New NFT</p>
        <p style={{
          fontSize: "0.9rem",
          color: "#95a5a6",
          margin: "0 0 2rem 0",
        }}>Upload exclusive content and set a price in SUI</p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          color: '#4caf50',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          ✅ NFT başarıyla oluşturuldu! İçeriğiniz Walrus'ta saklandı ve satışa hazır.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          color: '#f44336',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600',
            color: '#ecf0f1',
            fontSize: '1rem',
          }}>
            🖼️ Image/Video File
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ecf0f1',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
            }}
          />
          {previewUrl && (
            <div style={{ marginTop: '1rem' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600',
            color: '#ecf0f1',
            fontSize: '1rem',
          }}>
            📝 Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter NFT title"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ecf0f1',
              backdropFilter: 'blur(10px)',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600',
            color: '#ecf0f1',
            fontSize: '1rem',
          }}>
            📄 Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your NFT content"
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              resize: 'vertical',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ecf0f1',
              backdropFilter: 'blur(10px)',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600',
            color: '#ecf0f1',
            fontSize: '1rem',
          }}>
            🏷️ Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ecf0f1',
              backdropFilter: 'blur(10px)',
            }}
          >
            <option value="photo" style={{ background: '#2c3e50', color: '#ecf0f1' }}>📸 Photo</option>
            <option value="video" style={{ background: '#2c3e50', color: '#ecf0f1' }}>🎥 Video</option>
            <option value="art" style={{ background: '#2c3e50', color: '#ecf0f1' }}>🎨 Digital Art</option>
            <option value="exclusive" style={{ background: '#2c3e50', color: '#ecf0f1' }}>⭐ Exclusive Content</option>
          </select>
        </div>

        {/* Premium Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            color: '#ecf0f1',
            fontSize: '1rem',
            fontWeight: '600',
          }}>
            <input
              type="checkbox"
              name="isPremium"
              checked={formData.isPremium}
              onChange={handleInputChange}
              style={{ 
                margin: 0,
                width: '18px',
                height: '18px',
                accentColor: '#667eea',
              }}
            />
            <span>💎 Make this premium content (requires SUI payment)</span>
          </label>
        </div>

        {/* Price */}
        {formData.isPremium && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontWeight: '600',
              color: '#ecf0f1',
              fontSize: '1rem',
            }}>
              💰 Price (SUI)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.0"
              min="0"
              step="0.1"
              required={formData.isPremium}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ecf0f1',
                backdropFilter: 'blur(10px)',
              }}
            />
            <small style={{ 
              color: '#bdc3c7', 
              marginTop: '0.5rem', 
              display: 'block',
              fontSize: '0.8rem',
            }}>
              Set the price in SUI tokens that users must pay to view this content
            </small>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            backgroundColor: isLoading ? 'rgba(108, 117, 125, 0.5)' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isLoading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {isLoading ? '🔄 Creating NFT...' : '💡 Create NFT'}
        </button>
      </form>

      {/* Info Box */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
      }}>
        <h4 style={{ 
          margin: '0 0 1rem 0', 
          color: '#f39c12',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}>💡 NFT Creation Tips</h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '1.5rem', 
          color: '#bdc3c7', 
          fontSize: '0.9rem',
          lineHeight: '1.6',
        }}>
          <li>Upload high-quality images or videos for better appeal</li>
          <li>Write compelling descriptions to attract buyers</li>
          <li>Set reasonable prices to encourage purchases</li>
          <li>Use appropriate categories for better organization</li>
          <li>Premium content requires SUI payment to view</li>
        </ul>
      </div>
    </div>
  );
}
