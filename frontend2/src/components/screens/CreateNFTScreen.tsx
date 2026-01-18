import { Suspense, lazy } from "react";

const CreateNFT = lazy(() => import("../CreateNFT").then(module => ({ default: module.CreateNFT })));

function LoadingSpinner() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function CreateNFTScreen() {
    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}>
            <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>✨ Create NFT</h2>
            <Suspense fallback={<LoadingSpinner />}>
                <CreateNFT />
            </Suspense>
        </div>
    );
}
