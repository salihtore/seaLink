import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { IS_MOCK_MODE } from '../config/sui';

export interface Profile {
    id: string;
    owner: string;
    username: string;
    bio: string;
    avatar_cid: string;
    links: Array<{ label: string; url: string }>;
    theme: string;
    created_at: number;
    updated_at: number;
    walrus_blob_id?: string;
    messageBoxId?: string;
}

// function useProfile(identity?: string) { // identity can be address or username
export function useProfile(identity?: string) {
    // const client = suiClient();
    const account = useCurrentAccount();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!identity && !account) return;
        setLoading(true);
        setError(null);

        try {
            if (IS_MOCK_MODE) {
                // MOCK IMPLEMENTATION (Backwards compatible with localStorage)
                const key = "sealink:profiles";
                const raw = localStorage.getItem(key);
                const map: Record<string, Profile> = raw ? JSON.parse(raw) : {};

                let found = Object.values(map).find(p => p.id === identity || p.username === identity || p.owner === identity);

                // Fallback to connected account if no specific identity
                if (!found && !identity && account) {
                    found = map[account.address];
                }

                if (found) {
                    setProfile(found);
                } else {
                    setProfile(null); // Not found
                }
            } else {
                // REAL ON-CHAIN IMPLEMENTATION
                // 1. If identity is username -> Lookup in Registry Dynamic Fields
                // 2. If identity is address -> Indexer or iterate events (harder without indexer), 
                //    OR assume 1-to-1 and store address->profileId mapping in localStorage cache or Indexer.

                // For now, let's assume we look up by Username (Dynamic Field in Registry)
                // This part requires the exact Move structure to be implemented.
                // const parentId = SUI_CONFIG.REGISTRY_ID;
                // const dynamicField = await client.getDynamicFieldObject(...)

                // Placeholder:
                console.warn("On-chain fetching not fully implemented yet without deployed contract");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [identity, account?.address]);

    return { profile, loading, error, refetch: fetchProfile };
}


