import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SealedMessaging } from "./SealedMessaging";
import { SealedMessagesView } from "./SealedMessagesView";
import { NFTGallery } from "./NFTGallery";
import { CreateNFT } from "./CreateNFT";
import { useProfile } from "../hooks/useProfile";

interface ViewProfileProps {
  profileId?: string; // If null, tries to load own profile
  username?: string;
  walrusBlobId?: string;
}

export function ViewProfile({ profileId, username }: ViewProfileProps) {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<'links' | 'nfts' | 'messages'>('links');

  // Determine identity to fetch: profileId > username > account.address
  const identity = profileId || username || account?.address;
  const { profile, loading, error } = useProfile(identity);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;

  // If no profile found and we are looking for OUR OWN profile, show a welcome message
  if (!profile) {
    if (!profileId && !username && account) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>You haven't created a profile yet. Go to the "Create" tab!</div>;
    }
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Profile not found.</div>;
  }

  const isOwner = account?.address === profile.owner;

  // Generate shareable profile URL
  const handleShareProfile = async () => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${profile.id}`; // Note: Routing logic might need update to support this URL

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username} - SeaLink Profil`,
          text: `${profile.username} profilini SeaLink'te görüntüle`,
          url: profileUrl,
        });
      } catch (error) {
        // Share cancelled
      }
    } else {
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
                // Refresh logic would be complex here, but normally specific NFT hook would handle this
                console.log('NFT created');
              }} />
            </div>
          )}
          <NFTGallery profileId={profile.id} isOwner={isOwner} />
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
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
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>🔐 Encrypted</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>🕵️ Anonymous</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>💎 Decentralized</span>
              </div>
            )}
          </div>

          {profile.messageBoxId ? (
            <SealedMessaging
              profileId={profile.id}
              messageBoxId={profile.messageBoxId}
              onMessageSent={() => console.log('Message sent')}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Messaging not enabled for this profile.</div>
          )}

          {profile.messageBoxId && (
            <SealedMessagesView
              profileId={profile.id}
              messageBoxId={profile.messageBoxId}
              isOwner={isOwner}
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
