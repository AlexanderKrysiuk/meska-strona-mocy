// WelcomeToCircleEmail.tsx
import React from "react";
import { Html, Head, Preview, Section, Text } from "@react-email/components";
import { EmailLayout, Header, emailStyles, Sign } from "./Components";
import { formatedDate } from "@/utils/date";

interface WelcomeToCircleEmailProps {
  member: {
    name: string | null;
  };
  moderator: {
    name: string | null;
    avatarUrl: string | null;
    title: string | null;
  };
  circle: {
    name: string;
  };
  meetings?: {
    id: string;
    startTime: Date;
    endTime: Date;
    locale: string;
    timeZone: string;
    street: string;
    city: string;
  }[];
}

export default function WelcomeToCircleEmail({
  member,
  moderator,
  circle,
  meetings = [],
}: WelcomeToCircleEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Witaj w kręgu {circle.name} – Męska Strona Mocy</Preview>
      <EmailLayout
        sign={
          <Sign
            name={moderator?.name}
            avatarUrl={moderator?.avatarUrl}
            title={moderator?.title}
          />
        }
      >
        <Header title={`Witaj w kręgu ${circle.name}`} />

        <Section style={{ marginBottom: "32px" }}>
          <Text style={emailStyles.paragraph}>
            {member?.name ? `Cześć ${member.name},` : "Cześć!"} Zostałeś
            dodany do kręgu <strong>{circle.name}</strong> w serwisie Męska
            Strona Mocy.
          </Text>
          <Text style={emailStyles.paragraph}>
            Cieszymy się, że do nas dołączyłeś! Możesz teraz brać udział w
            spotkaniach, dyskusjach i poznawać innych członków.
          </Text>

          {/* {circle.url && (
            <Button href={circle.url} style={{ marginBottom: "20px" }}>
              Przejdź do kręgu
            </Button>
          )} */}

          {meetings.length > 0 && (
            <Section style={{ marginTop: "32px" }}>
              <Text style={emailStyles.headings.h2}>
                Najbliższe spotkania:
              </Text>
              {meetings.map((m) => (
                <Text
                  key={m.id}
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    marginBottom: "12px",
                  }}
                >
                  📅{" "}
                  {formatedDate(m.startTime, m.endTime, m.timeZone, "withDay", m.locale)}
                  <br />
                  📍 {m.city}, {m.street}
                </Text>
              ))}
            </Section>
          )}
        </Section>
      </EmailLayout>
    </Html>
  );
}
