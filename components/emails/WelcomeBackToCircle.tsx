import { Section, Text } from "@react-email/components";
import { EmailLayout, Header, Button, Footer, emailStyles } from "./Components";
import { CircleMeeting, City, Country, Region } from "@prisma/client";
import { formatedDate } from "@/utils/date";

type MeetingWithCity = CircleMeeting & { city: City & { region: Region & { country: Country }} }

interface WelcomeBackToCircleEmailProps {
  name?: string | null;
  circleName: string;
  circleUrl?: string;
  meetings?: MeetingWithCity[];
}

export default function WelcomeBackToCircleEmail({
  name,
  circleName,
  circleUrl,
  meetings = [],
}: WelcomeBackToCircleEmailProps) {
  return (
    <EmailLayout>
      <Header title={`Witaj w kręgu ${circleName}`} />

      <Section style={{ marginBottom: "32px" }}>
        <Text style={emailStyles.paragraph}>
          {name ? `Cześć ${name},` : "Cześć!"} Zostałeś dodany do kręgu <strong>{circleName}</strong> w serwisie Męska Strona Mocy.
        </Text>

        <Text style={emailStyles.paragraph}>
          Cieszymy się, że do nas dołączyłeś! Możesz teraz brać udział w spotkaniach, dyskusjach i poznawać innych członków.
        </Text>

        {circleUrl && (
          <Button href={circleUrl} style={{ marginBottom: "20px" }}>
            Przejdź do kręgu
          </Button>
        )}

        {meetings.length > 0 && (
          <Section style={{ marginTop: "32px" }}>
            <Text style={{ ...emailStyles.paragraph, fontWeight: "bold" }}>
              Najbliższe spotkania:
            </Text>

            {meetings.map((m) => (
              <Text key={m.id} style={{ fontSize: "14px", lineHeight: "20px", marginBottom: "12px" }}>
                📅 {formatedDate(m.startTime, m.endTime, m.city.region.country.timeZone, "withDay", m.city.region.country.locale)}
                <br />
                📍 {m.city.name}, {m.street}
              </Text>
            ))}
          </Section>
        )}
      </Section>
    </EmailLayout>
  );
}
