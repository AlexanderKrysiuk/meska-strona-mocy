import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";

export default function WelcomeToCircleEmail({
  name,
  circleName,
}: {
  name?: string;
  circleName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Witaj w kręgu {circleName} – Męska Strona Mocy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ marginBottom: "32px" }}>
            <Text style={heading}>
              {name ? `Witaj, ${name}!` : "Witaj!"}
            </Text>
            <Text style={paragraph}>
              Zostałeś dodany do kręgu <strong>{circleName}</strong> w serwisie Męska Strona Mocy.
            </Text>
            <Text style={paragraph}>
              Cieszymy się, że do nas dołączyłeś! Możesz teraz dołączyć do spotkań, brać udział w dyskusjach i poznawać innych członków.
            </Text>
            {/* <Button href={circleUrl} style={button}>
              Przejdź do kręgu
            </Button> */}
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

// const button = {
//   backgroundColor: "#000",
//   color: "#fff",
//   padding: "12px 20px",
//   borderRadius: "4px",
//   textDecoration: "none",
//   fontWeight: "bold",
// } as const;
