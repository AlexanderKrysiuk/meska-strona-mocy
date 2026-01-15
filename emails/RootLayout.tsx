import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

interface EmailSignature {
  name?: string;
  image?: string;
  title?: string;
}

interface RootLayoutProps {
  logoUrl?: string;
  signature?: EmailSignature;
  previewText?: string;
  children: React.ReactNode;
}

const defaultLogoUrl = "https://twojastrona.pl/logo.png";

export const RootLayout = ({
  signature,
  previewText,
  children,
  logoUrl = defaultLogoUrl,
}: RootLayoutProps) => {
  // W emailach **inline style jest najbezpieczniejszy**
  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff", // jasny tryb
    color: "#000000",
    fontFamily: "Arial, sans-serif",
  };

  const sectionStyle = { marginBottom: "32px" };

  const footerStyle = {
    fontSize: "12px",
    color: "#888888",
    fontStyle: "italic",
    textAlign: "center" as const,
    marginTop: "16px",
  };

  const autoTextStyle = {
    fontSize: "12px",
    color: "#888888",
    textAlign: "center" as const,
    marginBottom: "8px",
  };

  const dividerStyle = { borderTop: "1px solid #cccccc", margin: "16px 0" };

  return (
    <Html>
      <Head>
        <Preview>{previewText ?? "Masz nową wiadomość"}</Preview>
      </Head>

      <Body style={{ margin: 0, padding: 0, backgroundColor: "#ffffff", color: "#000000" }}>
        <Container style={containerStyle}>

          {/* Logo */}
          {logoUrl && (
            <Section style={{ textAlign: "center", marginBottom: "24px" }}>
              <Img
                src={logoUrl}
                alt="Logo"
                width={150}
                height={150} // opcjonalnie, żeby zachować proporcje
                style={{
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Section>
)}


          {/* Treść */}
          <Section style={sectionStyle}>{children}</Section>

          {/* Podpis */}
          {signature?.name || signature?.image || signature?.title ? (
            <Section style={{ marginBottom: "16px" }}>
              <table>
                <tr>
                  {signature.image && (
                    <td style={{ paddingRight: "12px" }}>
                      <Img
                        src={signature.image}
                        alt={signature.name ?? "Avatar"}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                      />
                    </td>
                  )}
                  <td>
                    {signature.name && <Text style={{ margin: 0, fontWeight: "bold" }}>{signature.name}</Text>}
                    {signature.title && <Text style={{ margin: 0 }}>{signature.title}</Text>}
                  </td>
                </tr>
              </table>
            </Section>
          ) : null}

          {/* Separator */}
          <Section>
            <hr style={dividerStyle} />
          </Section>

          {/* Informacja o automatycznej wysyłce */}
          <Section>
            <Text style={autoTextStyle}>
              ⚠️ Ten mail został wysłany automatycznie. Prosimy nie odpowiadać.
            </Text>
          </Section>

          {/* Footer */}
          <Section>
            <Text style={footerStyle}>Męska Strona Mocy</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
  const baseStyle = {
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    backgroundColor: "#1a1a1a", // ciemnoszary zamiast czarnego
    color: "#ffffff",
    border: "2px solid #1a1a1a",
    fontFamily: "Arial, sans-serif",
    display: "inline-block",
  };


  return (
    <Button href={href} style={baseStyle}>
      {children}
    </Button>
  );
};
