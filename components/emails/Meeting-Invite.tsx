import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Img } from "@react-email/components";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface MeetingInviteProps {
  userName?: string | null;
  circleName: string;
  startTime: Date;
  endTime: Date;
  street: string;
  city: string;
  locale: string; // np. "pl-PL", "de-DE"
  price: number;
  moderatorName?: string | null;
  moderatorAvatarUrl?: string | null;
}

const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function MeetingInvite({
  userName,
  circleName,
  startTime,
  endTime,
  street,
  city,
  locale,
  price,
  moderatorName,
  moderatorAvatarUrl
}: MeetingInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>Zaproszenie na spotkanie w grupie {circleName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Header title={`Zaproszenie na spotkanie w ${circleName}`} />

          <Section>
            <Text style={paragraph}>
              Cześć {userName}, zapraszam Cię na nowe spotkanie w grupie <strong>{circleName}</strong>!
            </Text>

            <Text style={paragraph}>
              <strong>Data:</strong> {formatDate(startTime, locale)} – {formatDate(endTime, locale)}
            </Text>
            <Text style={paragraph}>
              <strong>Miejsce:</strong> {street}, {city}
            </Text>
            <Text style={paragraph}>
              <strong>Cena spotkania:</strong> {price.toFixed(2)} PLN
            </Text>

            {moderatorName && (
              <Section style={{ marginTop: "15px", display: "flex", alignItems: "center" }}>
                {moderatorAvatarUrl && (
                  <Img
                    src={moderatorAvatarUrl}
                    alt={moderatorName}
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%", marginRight: "10px" }}
                  />
                )}
                <Text style={paragraph}>
                  Spotkanie prowadzi: <strong>{moderatorName}</strong>
                </Text>
              </Section>
            )}

            <Text style={{ ...paragraph, fontSize: "14px", color: "#555" }}>
              Jeśli nie możesz wziąć udziału, prosimy o informację moderatorowi.
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
  fontSize: "16px",
  lineHeight: "22px",
  marginBottom: "16px",
} as const;
