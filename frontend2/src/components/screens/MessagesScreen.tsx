import { Suspense, lazy } from "react";

// Lazy load heavy components
const SealedMessagesView = lazy(() => import("../SealedMessagesView").then(module => ({ default: module.SealedMessagesView })));

function LoadingSpinner() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function MessagesScreen({ messageBoxId }: { messageBoxId: string | null }) {
    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            maxWidth: "700px",
            margin: "0 auto",
        }}>
            <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem", textAlign: "center" }}>💬 My Messages</h2>
            <Suspense fallback={<LoadingSpinner />}>
                <SealedMessagesView messageBoxId={messageBoxId || undefined} isOwner={true} />
            </Suspense>
        </div>
    );
}
