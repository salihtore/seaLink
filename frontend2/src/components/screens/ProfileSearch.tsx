import React, { useState } from "react";

// TODO: Replace with actual contract constant
// const REGISTRY_ID = "0x..."; // We will update this

export function ProfileSearch() {
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // const suiClient = useSuiClient();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchInput.trim();
        if (!trimmed) return;

        setLoading(true);
        setSearchResults([]);

        try {
            // Here we will implement actual Chain Search using Dynamic Fields
            // Unlike the demo code, we will look up the Registry object
            console.log("Searching for:", trimmed);

            // Mock Implementation for now until we have constants
            // In real impl: 
            // const profileId = await suiClient.getDynamicFieldObject{ parentId: REGISTRY_ID, name: { type: 'string', value: trimmed } }

            setSearchResults([]); // No results for now
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search username... (e.g., alice)"
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        fontSize: '1rem',
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0 2rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            {/* Results area */}
            {searchResults.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    Enter a username to search on SeaLink Registry
                </div>
            )}
        </div>
    );
}
