// components.tsx
import React from "react";
import { Html, Head, Body, Container, Section, Text, Img } from "@react-email/components";

export function getTextColor(bgColor: string | undefined) {
  if (!bgColor) return "#111"; // domyślnie ciemny tekst
  // prosta heurystyka jasności: jeśli tło ciemne → tekst jasny, jeśli tło jasne → tekst ciemny
  const c = bgColor.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#111" : "#fff";
}

// --- CENTRALNE STYLE ---
export const emailStyles = {
  main: {
    backgroundColor: "#121212",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "40px 0",
  } as const,

  container: {
    backgroundColor: "#1e1e1e",
    borderRadius: "8px",
    padding: "32px",
    maxWidth: "500px",
    margin: "0 auto",
  } as const,

  paragraph: {
    fontSize: "16px",
    lineHeight: "22px",
    marginBottom: "16px",
  } as const,

  button: {
    display: "inline-block",
    padding: "12px 20px",
    backgroundColor: "#0070f3",
    color: "#fff",
    borderRadius: "5px",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 500,
    fontFamily: "Arial, sans-serif",
  } as const,

  footerText: {
    fontSize: "12px",
    color: "#888",
    marginTop: "20px",
    textAlign: "center",
  } as const,
};

// --- COMPONENTS ---

export function Button({ children, href, style }: { children: React.ReactNode; href?: string; style?: React.CSSProperties }) {
  return <a href={href} style={{ ...emailStyles.button, ...style }}>{children}</a>;
}

export function EmailLayout({ children }: { children: React.ReactNode }) {
  const bg = emailStyles.container.backgroundColor; // #1e1e1e
  const color = getTextColor(bg);

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", margin: 0, padding: 0, color }}>
        <Container style={{ ...emailStyles.container, color }}>
          {children}
          <Text style={emailStyles.footerText}>© 2025 Męska Strona Mocy</Text>
        </Container>
      </Body>
    </Html>
  );
}


export function Header({ title = "Męska Strona Mocy", logoUrl }: { title?: string; logoUrl?: string }) {
  return (
    <Section style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      {logoUrl && <Img src={logoUrl} width={50} height={50} alt="Logo" style={{ marginRight: "10px" }} />}
      <Text style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</Text>
    </Section>
  );
}

export function Footer({ text }: { text?: string }) {
  return (
    <Section style={{ marginTop: "20px", textAlign: "center" }}>
      <Text style={{ fontSize: "12px", color: "#888" }}>{text || "© 2025 Męska Strona Mocy. Wszystkie prawa zastrzeżone."}</Text>
    </Section>
  );
}

export const Sign = ({
    name,
    avatarUrl,
    title
} : {
    name?: string | null,
    avatarUrl?: string | null,
    title?: string | null
}) => {
  return (
    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>
      {avatarUrl && <Img src={avatarUrl} width={40} height={40} alt={name ?? "Avatar"} style={{ borderRadius: "50%", marginRight: "12px" }} />}
      <div>
        <p style={{ margin: 0, fontSize: "14px", color: "#111827" }}>Pozdrawiam,</p>
        {name && <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>{name}</p>}
        {title && <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{title}</p>}
      </div>
    </div>
  );
};
