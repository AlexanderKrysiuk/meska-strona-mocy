import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout, Header, emailStyles, getTextColor } from "./Components";
import { formatedDate } from "@/utils/date";

interface MeetingUpdatedEmailProps {
  userName?: string | null;
  circleName: string;
  oldMeeting: {
    startTime: Date;
    endTime: Date;
    street: string;
    city: string;
    price: number;
    locale?: string;
  };
  newMeeting: {
    startTime: Date;
    endTime: Date;
    street: string;
    city: string;
    price: number;
    locale?: string;
  };
  moderatorName?: string | null;
  timeZone?: string;
}

export default function MeetingUpdatedEmail({
  userName,
  circleName,
  oldMeeting,
  newMeeting,
  moderatorName,
}: MeetingUpdatedEmailProps) {
  const textColor = getTextColor(emailStyles.container.backgroundColor);

  const oldDate = formatedDate(oldMeeting.startTime, oldMeeting.endTime, { locale: oldMeeting.locale });
  const newDate = formatedDate(newMeeting.startTime, newMeeting.endTime, { locale: newMeeting.locale });

  const oldStyle = { color: "#ff5555", textDecoration: "line-through", marginRight: "4px" };
  const newStyle = { color: "#55ff55", fontWeight: "bold" };

  return (
    <EmailLayout>
      <Preview>Zmiana spotkania w kręgu {circleName}</Preview>
      <Header title={`Zmiana spotkania w ${circleName}`} />

      <Section style={{ marginBottom: "32px" }}>
        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
          {userName ? `Cześć ${userName},` : "Cześć!"} Spotkanie w kręgu <strong>{circleName}</strong> zostało zmienione przez <strong>{moderatorName || "moderatora"}.</strong>
        </Text>

        <Text style={{ ...emailStyles.paragraph, color: textColor }}>
          <strong>Miasto:</strong>{" "}
          {oldMeeting.city !== newMeeting.city ? (
            <>
              <span style={oldStyle}>❌ {oldMeeting.city}</span>
              <span style={newStyle}>✅ {newMeeting.city}</span>
            </>
          ) : (
            <span>{newMeeting.city}</span>
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
              <span style={oldStyle}>❌ {oldMeeting.price.toFixed(2)} PLN</span>
              <span style={newStyle}>✅ {newMeeting.price.toFixed(2)} PLN</span>
            </>
          ) : (
            <span>{newMeeting.price.toFixed(2)} PLN</span>
          )}
        </Text>

        <Text style={{ fontSize: "12px", color: "#888", marginTop: "16px" }}>
          Ta wiadomość jest generowana automatycznie, prosimy na nią nie odpowiadać.
        </Text>
      </Section>
    </EmailLayout>
  );
}
