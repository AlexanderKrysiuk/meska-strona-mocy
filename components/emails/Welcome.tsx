import { VerificationToken } from "@prisma/client";
import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Button } from "./components/Button";

interface WelcomeEmailProps {
  token: VerificationToken;
  name?: string;
}

export default function WelcomeEmail({ token, name }: WelcomeEmailProps) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${domain}/auth/verification?token=${token?.id || ""}`;

  return (
    <Html>
      <Head />
      <Preview>Potwierdź swoje konto – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Header title="Potwierdź swoje konto" />

          <Section style={{ marginBottom: "32px" }}>
            <Text style={paragraph}>
              {name ? `Cześć ${name},` : "Cześć!"} Dziękujemy za dołączenie do Męskiej Strony Mocy.
              Aby w pełni korzystać z serwisu, potwierdź swoje konto klikając w przycisk poniżej:
            </Text>

            <Button href={verificationUrl} style={{ marginBottom: "20px" }}>
              Potwierdź konto
            </Button>

            <Text style={paragraph}>
              Po potwierdzeniu zostaniesz przekierowany do ustawienia hasła do konta.
            </Text>
            <Text style={paragraph}>
              Jeśli nie rejestrowałeś się na naszej stronie, zignoruj tę wiadomość.
            </Text>

            <Text style={{ ...paragraph, fontSize: "12px", color: "#888" }}>
              Ta wiadomość jest generowana automatycznie, prosimy na nią nie odpowiadać.
            </Text>
          </Section>

          <Footer />
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

const paragraph = {
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "20px",
} as const;
