import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  style?: React.CSSProperties;
}

export function Button({ children, href, style }: ButtonProps) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "12px 20px",
        backgroundColor: "#0070f3",
        color: "#fff",
        borderRadius: "5px",
        textDecoration: "none",
        textAlign: "center",
        fontWeight: 500,
        fontFamily: "Arial, sans-serif",
        ...style,
      }}
    >
      {children}
    </a>
  );
}
