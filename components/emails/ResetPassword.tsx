import { VerificationToken } from "@prisma/client";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

export default function ResetPasswordEmail({
  token,
}: {
  token: VerificationToken;
}) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${domain}/auth/reset-password?token=${token?.id || ""}`;

  return (
    <Html>
      <Head />
      <Preview>Resetuj swoje hasło – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ marginBottom: "32px" }}>
            <Text style={heading}>
              Resetowanie hasła
            </Text>
            <Text style={paragraph}>
              Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.
              Kliknij przycisk poniżej, aby ustawić nowe hasło:
            </Text>
            <Button
              href={resetUrl}
              style={button}
            >
              Ustaw nowe hasło
            </Button>
            <Text style={paragraph}>
              Jeśli nie prosiłeś o zmianę hasła, zignoruj tę wiadomość.
            </Text>
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

const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold",
} as const;
