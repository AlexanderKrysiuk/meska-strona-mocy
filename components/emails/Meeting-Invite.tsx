//Meeting-Invite.tsx
import React from "react";
import { Preview, Section, Text } from "@react-email/components";
import { Header, EmailLayout, Sign } from "./Components";
import { emailStyles } from "./Components";
import { formatedDate } from "@/utils/date";
import { Circle, City, Country, Meeting, User } from "@prisma/client";

interface MeetingInviteProps {
  participant: Pick<User, "name">
  circle: Pick<Circle, "name">
  city: Pick<City, "name">
  country: Pick<Country, "timeZone">
  meeting: Pick<Meeting, "startTime" | "endTime" | "street" | "price" | "currency">
  moderator: Pick<User, "name" | "image" | "title">
}

export function MeetingInvite({
  participant,
  circle,
  city,
  country,
  meeting,
  moderator,
}: MeetingInviteProps) {
  return (
    <EmailLayout 
        sign={<Sign
          name={moderator.name}
          avatarUrl={moderator.image}
          title={moderator.title}
        />}
    >
      <Preview>Zaproszenie na spotkanie kręgu {circle.name}</Preview>
      <Header title={`Zaproszenie na spotkanie kręgu ${circle.name}`} />

      <Section>
        <Text style={{ ...emailStyles.paragraph }}>
          Cześć {participant.name}, zapraszam Cię na nowe spotkanie kręgu <strong>{circle.name}</strong>!
        </Text>

        <Text style={{ ...emailStyles.paragraph }}>
          <strong>Data:</strong> {formatedDate(meeting.startTime, meeting.endTime, country.timeZone)}
        </Text>
        <Text style={{ ...emailStyles.paragraph }}>
          <strong>Miejsce:</strong> {meeting.street}, {city.name}
        </Text>
        <Text style={{ ...emailStyles.paragraph }}>
          <strong>Cena spotkania:</strong> {meeting.price.toFixed(2)} {meeting.currency}
        </Text>

        <Text style={{ ...emailStyles.paragraph }}>
          Jeśli nie możesz wziąć udziału, skontaktuj się z moderatorem spotkania.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default function MeetingInvitePreview () {
  return <MeetingInvite
    participant={{ name: "Joshamee Gibbs" }}
    circle={{ name: "Załoga Czarnej Perły" }}
    city={{ name: "Isla De Muerta" }}
    country={{ timeZone: "Europe/Warsaw" }}
    meeting={{
      startTime: new Date("2025-09-20T18:00:00Z"),
      endTime: new Date("2025-09-20T20:00:00Z"),
      street: "ul. Tortuga 21",
      price: 37,
      currency: "PLN",
    }}
    moderator={{
      name: "Jack Sparrow",
      image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
      title: "Kapitan",
    }}
  />
};