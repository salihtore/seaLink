import { useCurrentAccount, useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { useState } from "react";
import { walrusApi } from "../utils/walrusApi";

const PACKAGE_ID = (import.meta as any).env?.VITE_PACKAGE_ID || "";
const REGISTRY_ID = (import.meta as any).env?.VITE_REGISTRY_ID || "";

interface CreateProfileProps {
  onSuccess?: (profileId: string) => void;
}

interface Link {
  label: string;
  url: string;
}

export function CreateProfile({ onSuccess }: CreateProfileProps) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  // signAndExecute (on-chain) is optional — the flow below will try to register on-chain if
  // environment variables (VITE_PACKAGE_ID & VITE_REGISTRY_ID) are set and the runtime
  // exposes the TransactionBlock builder. If not available we gracefully skip on-chain.

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar_cid: "",
    theme: "light",
  });

  const [links, setLinks] = useState<Link[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  
  // Upload profile JSON to Walrus using optimized API client
  const uploadProfileToWalrus = async (profileObj: any): Promise<string> => {
    try {
      console.log("📤 Uploading profile to Walrus...");
      const blobId = await walrusApi.uploadBlob(
        JSON.stringify(profileObj, null, 2), 
        `profile_${profileObj.id}.json`
      );
      console.log("✅ Profile uploaded to Walrus:", blobId);
      return blobId;
    } catch (error) {
      console.error("❌ uploadProfileToWalrus error:", error);
      throw new Error(`Profile could not be uploaded to Walrus: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    try {
      // Build a local profile with unique ID (not dependent on wallet connection)
      const uniqueProfileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const profile: any = {
        id: uniqueProfileId,
        owner: account.address,
        username: formData.username,
        bio: formData.bio,
        avatar_cid: formData.avatar_cid,
        links,
        theme: formData.theme,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        messageBoxId: `msgbox_${uniqueProfileId.slice(0, 8)}_${Date.now()}`,
      };

      const key = "sealink:profiles";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      
      // Upload profile metadata to Walrus FIRST (mandatory for cross-browser access)
      console.log("📤 Uploading profile to Walrus (mandatory)...");
      const blobId = await uploadProfileToWalrus(profile);
      profile.walrus_blob_id = blobId;
      
      // Save profile with unique ID and also with wallet address for easy lookup
      map[uniqueProfileId] = profile;
      map[account.address] = profile; // For wallet-based lookup
      map[formData.username] = profile; // For username-based lookup
      
      localStorage.setItem(key, JSON.stringify(map));
      console.log("✅ Profile saved locally with Walrus blob ID:", blobId);

        // MANDATORY on-chain registration: Call the Move create_profile function
        console.log("🔗 Registering profile on-chain (mandatory)...");
        if (!PACKAGE_ID || !REGISTRY_ID) {
          throw new Error("PACKAGE_ID ve REGISTRY_ID environment variables gerekli!");
        }
        
        if (typeof signAndExecute !== "function") {
          throw new Error("Wallet signAndExecute fonksiyonu mevcut değil!");
        }

        const TransactionBlock: any = (window as any).TransactionBlock || (window as any).sui?.TransactionBlock;
        if (!TransactionBlock) {
          throw new Error("TransactionBlock mevcut değil! SUI SDK yüklü değil.");
        }

        const txb = new TransactionBlock();
        txb.moveCall({
          target: `${PACKAGE_ID}::linktree::create_profile`,
          arguments: [
            txb.object(REGISTRY_ID),
            txb.pure.string(profile.username),
            txb.pure.string(profile.bio),
            txb.pure.string(profile.avatar_cid),
            txb.pure.string(profile.theme),
            txb.pure.string(profile.walrus_blob_id),
          ],
        });

        console.log("📝 Executing on-chain profile creation...");
        const result = await signAndExecute({ transactionBlock: txb });
        console.log("✅ Profile registered on-chain:", result);

        alert("✅ Profile created successfully and registered on blockchain!");
        if (onSuccess) onSuccess(profile.id);

      // reset form
      setFormData({ username: "", bio: "", avatar_cid: "", theme: "light" });
      setLinks([]);
      setNewLinkLabel("");
      setNewLinkUrl("");
    } catch (error) {
      console.error("❌ Profile creation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata oluştu";
      alert(`❌ Profile could not be created: ${errorMessage}`);
    }
  };

  return (
    <div className="create-profile">
      <h2>Create Your LinkTree Profile</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="your_name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatar_cid">Avatar IPFS CID (Pinata/IPFS)</label>
          <input
            type="text"
            id="avatar_cid"
            name="avatar_cid"
            value={formData.avatar_cid}
            onChange={handleInputChange}
            placeholder="QmXxxx..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="form-group links-editor">
          <label>Links</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Label (e.g. Website)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
            />
            <input
              placeholder="URL (https://...)"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
            />
            <button type="button" onClick={() => {
              if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
              setLinks((s: Link[]) => [...s, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
              setNewLinkLabel("");
              setNewLinkUrl("");
            }}>Add</button>
          </div>

          {links.length === 0 ? (
            <small>No links yet</small>
          ) : (
            <ul>
              {links.map((l: Link, idx: number) => (
                <li key={idx}>
                  <a href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                  <button type="button" onClick={() => setLinks((s: Link[]) => s.filter((_: Link, i: number) => i !== idx))} style={{ marginLeft: 8 }}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={!account}>
          {account ? "Create Profile" : "Connect Wallet First"}
        </button>
      </form>
    </div>
  );
}
