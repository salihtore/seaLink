
export function FeatureCard({
    icon,
    title,
    description,
    color,
    onClick
}: {
    icon: string;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: "white",
                padding: "2rem",
                borderRadius: "16px",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                textAlign: "left",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
            }}
        >
            <div style={{
                background: color,
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1rem",
            }}>
                {icon}
            </div>
            <h3 style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#213547",
            }}>
                {title}
            </h3>
            <p style={{
                margin: 0,
                color: "#666",
                fontSize: "0.95rem",
                lineHeight: "1.5",
            }}>
                {description}
            </p>
        </div>
    );
}

export function QuickActionButton({
    icon,
    label,
    onClick
}: {
    icon: string;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}
