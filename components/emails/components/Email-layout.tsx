import { Html, Head, Body, Container, Text } from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", margin: "20px auto", maxWidth: "600px" }}>
          {children}
          <Text style={{ fontSize: "12px", color: "#888", marginTop: "20px", textAlign: "center" }}>
            © 2025 Męska Strona Mocy
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
