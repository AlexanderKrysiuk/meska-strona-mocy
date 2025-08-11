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

export default function WelcomeEmail({ 
  token,
  name,
}: {
  token: VerificationToken;
  name?: string;
}) {
//export default function WelcomeEmail({ token, name }: VerificationEmailProps) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${domain}/auth/verification?token=${token?.id || ""}`;

  return (
    <Html>
      <Head />
      <Preview>Potwierdź swoje konto – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ marginBottom: "32px" }}>
            <Text style={heading}>
              {name ? `Witaj, ${name}!` : "Witaj!"}
            </Text>
            <Text style={paragraph}>
              Dziękujemy za dołączenie do Męskiej Strony Mocy. Aby w pełni
              korzystać z serwisu, potwierdź swoje konto klikając w przycisk
              poniżej:
            </Text>
            <Button
              href={verificationUrl}
              style={button}
            >
              Potwierdź konto
            </Button>
            <Text style={paragraph}>
              Jeśli nie rejestrowałeś się na naszej stronie, zignoruj tę
              wiadomość.
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
