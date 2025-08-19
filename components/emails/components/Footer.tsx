import { Text, Section } from "@react-email/components";

interface FooterProps {
  text?: string;
}

export function Footer({ text }: FooterProps) {
  return (
    <Section style={{ marginTop: "20px", textAlign: "center" }}>
      <Text style={{ fontSize: "12px", color: "#888" }}>
        {text || "© 2025 Męska Strona Mocy. Wszystkie prawa zastrzeżone."}
      </Text>
    </Section>
  );
}
