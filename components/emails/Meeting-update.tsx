//Meeting-Update.tsx
import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout, Header, Sign, emailStyles } from "./Components";
import { formatedDate } from "@/utils/date";
import { Circle, City, Country, Meeting, User } from "@prisma/client";

interface MeetingUpdatedEmailProps {
  participant: Pick<User, "name"> 
  oldMeeting: Pick<Meeting, "startTime" | "endTime" | "street" | "price" | "currency"> & { 
    city: Pick<City, "name">
    country:  Pick<Country, "timeZone">
  }
  newMeeting: Pick<Meeting, "startTime" | "endTime" | "street" | "price" | "currency"> & {
    city: Pick<City, "name"> 
    country: Pick<Country, "timeZone">
  }
  circle: Pick<Circle, "name">
  moderator: Pick<User, "name" | "image" | "title">
}

export function MeetingUpdatedEmail({
  participant,
  oldMeeting,
  newMeeting,
  circle,
  moderator
}: MeetingUpdatedEmailProps) {
  const oldDate = formatedDate(oldMeeting.startTime, oldMeeting.endTime, oldMeeting.country.timeZone);
  const newDate = formatedDate(newMeeting.startTime, newMeeting.endTime, newMeeting.country.timeZone);

  const oldStyle = { color: "#ff5555", textDecoration: "line-through", marginRight: "4px" };
  const newStyle = { color: "#55ff55", fontWeight: "bold" };

  return (
    <EmailLayout
      sign={<Sign
        name={moderator.name}
        avatarUrl={moderator.image}
        title={moderator.title}
      />}
    >
      <Preview>Zmiana spotkania w kręgu {circle.name}</Preview>
      <Header title={`Zmiana spotkania w ${circle.name}`} />

      <Section style={{ marginBottom: "32px" }}>
        <Text style={{ ...emailStyles.paragraph }}>
          {`Cześć${" " + participant.name},`} Spotkanie w kręgu <strong>{circle.name}</strong> zostało zmienione przez moderatora<strong>{" " + moderator.name}.</strong>
        </Text>

        <Text style={{ ...emailStyles.paragraph }}>
          <strong>Miasto:</strong>{" "}
          {oldMeeting.city.name !== newMeeting.city.name ? (
            <>
              <span style={oldStyle}>❌ {oldMeeting.city.name}</span>
              <span style={newStyle}>✅ {newMeeting.city.name}</span>
            </>
          ) : (
            <span>{newMeeting.city.name}</span>
          )}
          <br />

          <strong>Ulica:</strong>{" "}
          {oldMeeting.street !== newMeeting.street ? (
            <>
              <span style={oldStyle}>❌ {oldMeeting.street}</span>
              <span style={newStyle}>✅ {newMeeting.street}</span>
            </>
          ) : (
            <span>{newMeeting.street}</span>
          )}
          <br />

          <strong>Data:</strong>{" "}
          {oldDate !== newDate ? (
            <>
              <span style={oldStyle}>❌ {oldDate}</span>
              <span style={newStyle}>✅ {newDate}</span>
            </>
          ) : (
            <span>{newDate}</span>
          )}
          <br />

          <strong>Cena:</strong>{" "}
          {oldMeeting.price !== newMeeting.price ? (
            <>
              <span style={oldStyle}>❌ {oldMeeting.price.toFixed(2)} {oldMeeting.currency}</span>
              <span style={newStyle}>✅ {newMeeting.price.toFixed(2)} {newMeeting.currency}</span>
            </>
          ) : (
            <span>{newMeeting.price.toFixed(2)} PLN</span>
          )}
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default function MeetingUpdatedEmailPreview() {
  return (
    <MeetingUpdatedEmail
      participant={{ name: "Joshamee Gibbs" }}
      circle={{ name: "Załoga Czarnej Perły" }}
      oldMeeting={{
        startTime: new Date("2025-09-20T18:00:00Z"),
        endTime: new Date("2025-09-20T20:00:00Z"),
        street: "ul. Tortuga 21",
        price: 37,
        currency: "PLN",
        city: { name: "Isla De Muerta" },
        country: { timeZone: "Europe/Warsaw" },
      }}
      newMeeting={{
        startTime: new Date("2025-09-22T19:00:00Z"),
        endTime: new Date("2025-09-22T21:00:00Z"),
        street: "ul. Tortuga 23",
        price: 45,
        currency: "PLN",
        city: { name: "Port Royal" },
        country: { timeZone: "Europe/Warsaw" },
      }}
      moderator={{
        name: "Jack Sparrow",
        image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
        title: "Kapitan",
      }}
    />
  );
}