import { Img } from "@react-email/components";

export const Sign = (
  name?: string | null, 
  avatarUrl?: string | null, 
  title?: string | null
) => {
  return (
    <div
      style={{
        marginTop: "24px",
        paddingTop: "16px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
      }}
    >
      {avatarUrl && (
        <Img
          src={avatarUrl}
          width="40"
          height="40"
          alt={name ?? "Avatar"} // <-- fallback zamiast null
          style={{ borderRadius: "50%", marginRight: "12px" }}
        />
      )}
      <div>
        <p style={{ margin: 0, fontSize: "14px", color: "#111827" }}>
          {"Pozdrawiam,"}
        </p>
        {name && (
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
            {name}
          </p>
        )}
        {title && (
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            {title}
          </p>
        )}
      </div>
    </div>
  );
};
