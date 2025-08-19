import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";

export default function DeleteUserFromCircleEmail({
  name,
  circleName,
  moderatorName,
  reason,
}: {
  name: string | null;
  circleName: string;
  moderatorName?: string | null;
  reason?: string | null;
}) {
  return (
    <Html>
      <Head />
      <Preview>Zostałeś usunięty z kręgu {circleName} – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ marginBottom: "32px" }}>
            <Text style={heading}>
              {name ? `Cześć, ${name}` : "Cześć"}
            </Text>
            <Text style={paragraph}>
              Informujemy, że zostałeś usunięty z kręgu <strong>{circleName}</strong>.
            </Text>
            {moderatorName && (
              <Text style={paragraph}>
                Decyzję podjął moderator: <strong>{moderatorName}</strong>.
              </Text>
            )}
            {reason && (
              <Text style={paragraph}>
                <em>Powód usunięcia:</em> {reason}
              </Text>
            )}
            <Text style={{ ...paragraph, fontSize: "12px", color: "#888" }}>
              Ta wiadomość jest generowana automatycznie, prosimy na nią nie odpowiadać.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#121212",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  padding: "40px 0",
} as const;

const container = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "32px",
  maxWidth: "500px",
  margin: "0 auto",
} as const;

const heading = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "16px",
} as const;

const paragraph = {
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "20px",
} as const;
