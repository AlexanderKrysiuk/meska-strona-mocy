import React from "react";
import { Preview, Section, Text, Img } from "@react-email/components";
import { Header, getTextColor, EmailLayout } from "./Components";
import { emailStyles } from "./Components";
import { formatedDate } from "@/utils/date";

interface MeetingInviteProps {
  userName?: string | null;
  circleName: string;
  startTime: Date;
  endTime: Date;
  street: string;
  city: string;
  locale: string;
  price: number;
  moderatorName?: string | null;
  moderatorAvatarUrl?: string | null;
}

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
  moderatorAvatarUrl,
}: MeetingInviteProps) {
  const textColor = getTextColor(emailStyles.container.backgroundColor);

  return (
    <EmailLayout>
      <Preview>Zaproszenie na spotkanie kręgu {circleName}</Preview>
      <Header title={`Zaproszenie na spotkanie kręgu ${circleName}`} />

      <Section>
        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
          Cześć {userName}, zapraszam Cię na nowe spotkanie kręgu <strong>{circleName}</strong>!
        </Text>

        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
          <strong>Data:</strong> {formatedDate(startTime, endTime, { locale })}
        </Text>
        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
          <strong>Miejsce:</strong> {street}, {city}
        </Text>
        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
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
            <Text style={{ ...emailStyles.paragraph, color: textColor }}>
              Spotkanie prowadzi: <strong>{moderatorName}</strong>
            </Text>
          </Section>
        )}

        <Text style={{ ...emailStyles.paragraph, fontSize: "14px", color: "#aaa" }}>
          Jeśli nie możesz wziąć udziału, skontaktuj się z moderatorem spotkania.
        </Text>
      </Section>
    </EmailLayout>
  );
}