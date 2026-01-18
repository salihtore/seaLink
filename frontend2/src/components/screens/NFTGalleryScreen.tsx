import { Suspense, lazy } from "react";

const NFTGallery = lazy(() => import("../NFTGallery").then(module => ({ default: module.NFTGallery })));

function LoadingSpinner() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function NFTGalleryScreen() {
    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}>
            <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>🎨 My NFT Gallery</h2>
            <Suspense fallback={<LoadingSpinner />}>
                {/* TODO: Pass actual profileId */}
                <NFTGallery profileId="demo" isOwner={true} />
            </Suspense>
        </div>
    );
}
