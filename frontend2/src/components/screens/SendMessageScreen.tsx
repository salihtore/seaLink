import { Suspense, lazy } from "react";

const SealedMessaging = lazy(() => import("../SealedMessaging").then(module => ({ default: module.SealedMessaging })));

function LoadingSpinner() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function SendMessageScreen({ messageBoxId }: { messageBoxId: string | null }) {
    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}>
            <h2 style={{ color: "#667eea", marginTop: 0, marginBottom: "2rem" }}>📤 Send Message</h2>
            <Suspense fallback={<LoadingSpinner />}>
                {/* In a real app this would likely come from a selected profile, but here we might default or need selection */}
                <SealedMessaging messageBoxId={messageBoxId || undefined} />
            </Suspense>
        </div>
    );
}
