import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Button } from "./components/Button";

interface WelcomeToCircleEmailProps {
  name?: string;
  circleName: string;
  circleUrl?: string;
}

export default function WelcomeToCircleEmail({ name, circleName, circleUrl }: WelcomeToCircleEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Witaj w kręgu {circleName} – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Header title={`Witaj w kręgu ${circleName}`} />

          <Section style={{ marginBottom: "32px" }}>
            <Text style={paragraph}>
              {name ? `Cześć ${name},` : "Cześć!"} Zostałeś dodany do kręgu <strong>{circleName}</strong> w serwisie Męska Strona Mocy.
            </Text>
            <Text style={paragraph}>
              Cieszymy się, że do nas dołączyłeś! Możesz teraz brać udział w spotkaniach, dyskusjach i poznawać innych członków.
            </Text>

            {circleUrl && (
              <Button href={circleUrl} style={{ marginBottom: "20px" }}>
                Przejdź do kręgu
              </Button>
            )}

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
