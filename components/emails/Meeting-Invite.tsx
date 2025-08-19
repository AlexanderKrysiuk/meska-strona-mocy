import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Img } from "@react-email/components";

interface MeetingInviteProps {
  userName?: string | null;
  circleName: string;
  startTime: Date;
  endTime: Date;
  street: string;
  city: string;
  price: number;
  moderatorName?: string | null;
  moderatorAvatarUrl?: string | null;
}

export function MeetingInvite({
  userName = "Uczestniku",
  circleName,
  startTime,
  endTime,
  street,
  city,
  price,
  moderatorName,
  moderatorAvatarUrl
}: MeetingInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>Zaproszenie na spotkanie w grupie {circleName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.05)" }}>
          <Section>
            <Text style={{ fontSize: "16px" }}>
              Cześć {userName}, zapraszam Cię na nowe spotkanie w grupie <strong>{circleName}</strong>!
            </Text>

            <Text style={{ fontSize: "16px", marginTop: "15px" }}>
              Oto szczegóły spotkania:
            </Text>

            <Text style={{ fontSize: "16px", marginTop: "10px" }}>
              <strong>Data:</strong> {startTime.toLocaleString()} – {endTime.toLocaleString()}
            </Text>
            <Text style={{ fontSize: "16px" }}>
              <strong>Miejsce:</strong> {street}, {city}
            </Text>
            <Text style={{ fontSize: "16px" }}>
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
                <Text style={{ fontSize: "16px" }}>
                  Spotkanie prowadzi: <strong>{moderatorName}</strong>
                </Text>
              </Section>
            )}

            <Text style={{ fontSize: "14px", marginTop: "20px", color: "#555" }}>
              Jeśli nie możesz wziąć udziału, prosimy o informację moderatorowi.
            </Text>

            <Text style={{ fontSize: "14px", marginTop: "10px", color: "#888" }}>
              Do zobaczenia na spotkaniu!
            </Text>

            <Text style={{ fontSize: "16px", marginTop: "20px" }}>
              Pozdrawiamy,<br/>
              {moderatorName ?? "Twój zespół"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
