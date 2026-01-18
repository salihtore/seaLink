import { useState } from "react";
import { CreateProfile } from "../CreateProfile";
import { ViewProfile } from "../ViewProfile";
import { ProfileSearch } from "./ProfileSearch";

export function ProfileScreen() {
    const [activeTab, setActiveTab] = useState<'create' | 'view' | 'search'>('create');

    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "2.5rem",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            maxWidth: "900px",
            margin: "0 auto",
            minHeight: "600px",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2.5rem",
                flexWrap: "wrap",
                gap: "1.5rem",
            }}>
                <h2 style={{ color: "#667eea", margin: 0, fontSize: "1.8rem", fontWeight: "700" }}>👤 Profile Management</h2>

                {/* Tab Navigation */}
                <div style={{
                    display: "flex",
                    background: "rgba(102, 126, 234, 0.1)",
                    borderRadius: "12px",
                    padding: "4px",
                    gap: "0.5rem",
                }}>
                    <button
                        onClick={() => setActiveTab('create')}
                        style={{
                            padding: "1rem 2rem",
                            border: "none",
                            background: activeTab === 'create' ? "#667eea" : "transparent",
                            color: activeTab === 'create' ? "white" : "#667eea",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        ✨ Create
                    </button>
                    <button
                        onClick={() => setActiveTab('view')}
                        style={{
                            padding: "1rem 2rem",
                            border: "none",
                            background: activeTab === 'view' ? "#667eea" : "transparent",
                            color: activeTab === 'view' ? "white" : "#667eea",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        👁️ View
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        style={{
                            padding: "1rem 2rem",
                            border: "none",
                            background: activeTab === 'search' ? "#667eea" : "transparent",
                            color: activeTab === 'search' ? "white" : "#667eea",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        🔍 Search
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div style={{
                minHeight: "400px",
                padding: "1.5rem",
                background: "rgba(102, 126, 234, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(102, 126, 234, 0.1)",
            }}>
                {activeTab === 'create' && (
                    <div>
                        <CreateProfile onSuccess={(id) => {
                            console.log('profile created', id);
                            setActiveTab('view'); // Profil oluşturulduktan sonra görüntüleme sekmesine geç
                        }} />
                    </div>
                )}

                {activeTab === 'view' && (
                    <div>
                        <h3 style={{ color: "#667eea", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>Profile Preview</h3>
                        <ViewProfile />
                    </div>
                )}

                {activeTab === 'search' && (
                    <div>
                        <h3 style={{ color: "#667eea", marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>Search Profile</h3>
                        <ProfileSearch />
                    </div>
                )}
            </div>
        </div>
    );
}
