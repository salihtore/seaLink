import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SealedMessaging } from "./SealedMessaging";
import { SealedMessagesView } from "./SealedMessagesView";
import { NFTGallery } from "./NFTGallery";
import { CreateNFT } from "./CreateNFT";

interface LinkTreeProfile {
  id: string;
  owner: string;
  username: string;
  bio: string;
  avatar_cid: string;
  links: Array<{ label: string; url: string }>;
  theme: string;
  created_at: number;
  updated_at: number;
  messageBoxId?: string;
}

interface ViewProfileProps {
  profileId?: string;
  username?: string;
  walrusBlobId?: string;
}

export function ViewProfile({ profileId, username }: ViewProfileProps) {
  const account = useCurrentAccount();
  const [profile, setProfile] = useState<LinkTreeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'nfts' | 'messages'>('links');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const key = "sealink:profiles";
        const raw = localStorage.getItem(key);
        const map: Record<string, LinkTreeProfile> = raw ? JSON.parse(raw) : {};

        let found: LinkTreeProfile | null = null;
        
        // Önce profileId ile ara
        if (profileId) {
          found = map[profileId] ?? null;
        }
        
        // Sonra username ile ara
        if (!found && username) {
          found = Object.values(map).find((p) => p.username === username) ?? null;
        }
        
        // Son olarak wallet adresi ile ara (cüzdan bağlıysa)
        if (!found && account) {
          found = map[account.address] ?? null;
        }
        
        // Eğer hiçbir şey bulunamazsa, ilk mevcut profili göster (demo olmayan)
        if (!found) {
          const allProfiles = Object.values(map);
          found = allProfiles.find((p) => !(p as any).demo) ?? allProfiles[0] ?? null;
        }
        
        // Demo profiller için özel mesaj kutusu ID'si
        if (found && (found as any).demo && found.messageBoxId) {
          // Demo profiller için mesaj kutusu ID'sini düzelt
          found.messageBoxId = found.messageBoxId;
        }

        // Migration: Add messageBoxId to existing profiles that don't have it
        if (found && !found.messageBoxId) {
          found.messageBoxId = `msgbox_${found.id.slice(0, 8)}_${Date.now()}`;
          map[found.id] = found;
          localStorage.setItem(key, JSON.stringify(map));
        }

        setProfile(found);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profileId, username, account?.address]);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  const isOwner = account?.address === profile.owner;

  // Generate shareable profile URL
  const generateProfileUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/profile/${profile.id}`;
  };

  const handleShareProfile = async () => {
    const profileUrl = generateProfileUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username} - SeaLink Profil`,
          text: `${profile.username} profilini SeaLink'te görüntüle`,
          url: profileUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(profileUrl);
        alert('Profil linki panoya kopyalandı!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(profileUrl);
      alert('Profil linki panoya kopyalandı!');
    }
  };

  return (
    <div className="profile-view">
      <div className="profile-header" style={{ textAlign: 'center', position: 'relative' }}>
        {/* Share Button */}
        <button
          onClick={handleShareProfile}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }}
        >
          📤 Paylaş
        </button>

        {profile.avatar_cid && (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${profile.avatar_cid}`}
            alt={profile.username}
            className="avatar"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '16px'
            }}
          />
        )}
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{profile.username}</h1>
        <p className="bio" style={{ margin: '0 0 24px 0', color: '#666', fontSize: '1.1rem' }}>
          {profile.bio}
        </p>
        
        {/* Profile Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
              {profile.links?.length || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Link</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
              {profile.messageBoxId ? '✓' : '✗'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Mesajlaşma</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
              {isOwner ? '👑' : '👤'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {isOwner ? 'Sahip' : 'Ziyaretçi'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        borderBottom: '1px solid #ddd',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('links')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'links' ? '#007bff' : 'transparent',
            color: activeTab === 'links' ? 'white' : '#666',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          🔗 Links
        </button>
        <button
          onClick={() => setActiveTab('nfts')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'nfts' ? '#007bff' : 'transparent',
            color: activeTab === 'nfts' ? 'white' : '#666',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          🎨 NFTs
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'messages' ? '#ff6b6b' : 'transparent',
            color: activeTab === 'messages' ? 'white' : '#666',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            position: 'relative'
          }}
        >
          💬 Messages
          {!isOwner && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              !
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'links' && (
        <div className="links">
          {profile.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
              style={{
                display: 'block',
                padding: '16px 20px',
                margin: '8px 0',
                backgroundColor: '#f8f9fa',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {activeTab === 'nfts' && (
        <div className="nft-section">
          {isOwner && (
            <div style={{ marginBottom: '24px' }}>
              <CreateNFT onNFTCreated={() => {
                // Refresh NFT gallery
                console.log('NFT created, refreshing gallery...');
              }} />
            </div>
          )}
          <NFTGallery profileId={profile.id} isOwner={isOwner} />
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
          {/* Mesajlaşma Özelliği Tanıtımı */}
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>
              💬 Send Anonymous Messages
            </h3>
            <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
              Send encrypted, anonymous messages to {profile.username}. 
              {isOwner ? ' View your inbox below.' : ' Your identity will be protected.'}
            </p>
            {!isOwner && (
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🔐 Encrypted
                </span>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🕵️ Anonymous
                </span>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  💎 Decentralized
                </span>
              </div>
            )}
          </div>

          {/* 🔐 Anonymous Messaging Section */}
          {profile.messageBoxId ? (
            <SealedMessaging 
              profileId={profile.id}
              messageBoxId={profile.messageBoxId}
              onMessageSent={() => {
                // Mesaj gönderildikten sonra yapılacaklar
                console.log('Message sent successfully!');
              }}
            />
          ) : (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #e9ecef', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#6c757d' }}>
                💬 Messaging not available for this profile
              </p>
            </div>
          )}

          {/* Mesajları Göster (Sadece Sahip Görebilir) */}
          {profile.messageBoxId && (
            <SealedMessagesView
              profileId={profile.id}
              messageBoxId={profile.messageBoxId}
              isOwner={account?.address === profile.owner}  // Gerçek sahip kontrolü
            />
          )}
        </div>
      )}

      <div className="profile-footer">
        <p>Created: {new Date(profile.created_at * 1000).toLocaleDateString()}</p>
        <p>Theme: {profile.theme}</p>
      </div>
    </div>
  );
}
