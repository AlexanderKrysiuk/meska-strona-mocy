import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface MeetingUpdatedEmailProps {
  userName?: string | null;
  circleName: string;
  oldMeeting: {
    startTime: Date;
    endTime: Date;
    street: string;
    city: string;
    price: number;
    locale: string;
  };
  newMeeting: {
    startTime: Date;
    endTime: Date;
    street: string;
    city: string;
    price: number;
    locale: string;
  };
  moderatorName?: string | null;
}

const formatMeetingDate = (start: Date, end: Date, locale: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
    ) {
      return `${startDate.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} ` +
             `${startDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} - ` +
             `${endDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
    }
  
    return `${startDate.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })} - ` +
           `${endDate.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })}`;
  };
  

const oldStyle = { color: "#888", textDecoration: "line-through", marginRight: "4px" };
const newStyle = { color: "#0f0", fontWeight: "bold" };

export default function MeetingUpdatedEmail({
  userName,
  circleName,
  oldMeeting,
  newMeeting,
  moderatorName,
}: MeetingUpdatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Zmiana spotkania w kręgu {circleName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Header title={`Zmiana spotkania w ${circleName}`} />

          <Section style={{ marginBottom: "32px" }}>
            <Text style={paragraph}>
              {userName ? `Cześć ${userName},` : "Cześć!"} Spotkanie w kręgu <strong>{circleName}</strong> zostało zmienione przez {moderatorName || "moderatora"}.
            </Text>

            <Text style={paragraph}>
  <strong>Miasto:</strong> {oldMeeting.city !== newMeeting.city ? (
    <>
      <span style={oldStyle}>❌ {oldMeeting.city} </span>
      <span style={newStyle}>✅ {newMeeting.city}</span>
    </>
  ) : (
    <span>{newMeeting.city}</span>
  )}<br />

  <strong>Ulica:</strong> {oldMeeting.street !== newMeeting.street ? (
    <>
      <span style={oldStyle}>❌ {oldMeeting.street} </span>
      <span style={newStyle}>✅ {newMeeting.street}</span>
    </>
  ) : (
    <span>{newMeeting.street}</span>
  )}<br />

  <strong>Data:</strong> {formatMeetingDate(oldMeeting.startTime, oldMeeting.endTime, oldMeeting.locale) !== formatMeetingDate(newMeeting.startTime, newMeeting.endTime, newMeeting.locale) ? (
    <>
      <span style={oldStyle}>❌ {formatMeetingDate(oldMeeting.startTime, oldMeeting.endTime, oldMeeting.locale)} </span>
      <span style={newStyle}>✅ {formatMeetingDate(newMeeting.startTime, newMeeting.endTime, newMeeting.locale)}</span>
    </>
  ) : (
    <span>{formatMeetingDate(newMeeting.startTime, newMeeting.endTime, newMeeting.locale)}</span>
  )}<br />

  <strong>Cena:</strong> {oldMeeting.price !== newMeeting.price ? (
    <>
      <span style={oldStyle}>❌ {oldMeeting.price.toFixed(2)} PLN </span>
      <span style={newStyle}>✅ {newMeeting.price.toFixed(2)} PLN</span>
    </>
  ) : (
    <span>{newMeeting.price.toFixed(2)} PLN</span>
  )}
</Text>


            <Text style={{ ...paragraph, fontSize: "12px", color: "#888" }}>
              Ta wiadomość jest generowana automatycznie, prosimy na nią nie odpowiadać.
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
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "20px",
} as const;
