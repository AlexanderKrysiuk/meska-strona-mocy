import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Img } from "@react-email/components";
import { Header, Footer } from "./Components";
import { emailStyles } from "./Components";
import { formatDate } from "@/utils/date";

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
  return (
    <Html>
      <Head />
      <Preview>Zaproszenie na spotkanie kręgu {circleName}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Header title={`Zaproszenie na spotkanie kręgu ${circleName}`} />

          <Section>
            <Text style={emailStyles.paragraph}>
              Cześć {userName}, zapraszam Cię na nowe spotkanie kręgu <strong>{circleName}</strong>!
            </Text>

            <Text style={emailStyles.paragraph}>
              <strong>Data:</strong> {formatDate(startTime, endTime, locale)}
            </Text>
            <Text style={emailStyles.paragraph}>
              <strong>Miejsce:</strong> {street}, {city}
            </Text>
            <Text style={emailStyles.paragraph}>
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
                <Text style={emailStyles.paragraph}>
                  Spotkanie prowadzi: <strong>{moderatorName}</strong>
                </Text>
              </Section>
            )}

            <Text style={{ ...emailStyles.paragraph, fontSize: "14px", color: "#aaa" }}>
              Jeśli nie możesz wziąć udziału, skontaktuj się z moderatorem spotkania.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}



// import React from "react";
// import { Html, Head, Preview, Body, Container, Section, Text, Img } from "@react-email/components";
// import { Header } from "./components/Header";
// import { Footer } from "./components/Footer";

// interface MeetingInviteProps {
//   userName?: string | null;
//   circleName: string;
//   startTime: Date;
//   endTime: Date;
//   street: string;
//   city: string;
//   locale: string; // np. "pl-PL", "de-DE"
//   price: number;
//   moderatorName?: string | null;
//   moderatorAvatarUrl?: string | null;
// }

// const formatMeetingDate = (start: Date, end: Date, locale: string) => {
//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   // jeśli spotkanie kończy się tego samego dnia, pokazujemy tylko godziny
//   if (
//     startDate.getFullYear() === endDate.getFullYear() &&
//     startDate.getMonth() === endDate.getMonth() &&
//     startDate.getDate() === endDate.getDate()
//   ) {
//     return `${startDate.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })} - ${endDate.toLocaleTimeString(locale, { timeStyle: "short" })}`;
//   }

//   // jeśli kończy się innego dnia, pokazujemy pełną datę i godzinę
//   return `${startDate.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })} - ${endDate.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })}`;
// };

// export function MeetingInvite({
//   userName,
//   circleName,
//   startTime,
//   endTime,
//   street,
//   city,
//   locale,
//   price,
//   moderatorName,
//   moderatorAvatarUrl
// }: MeetingInviteProps) {
//   return (
//     <Html>
//       <Head />
//       <Preview>Zaproszenie na spotkanie kręgu {circleName}</Preview>
//       <Body style={main}>
//         <Container style={container}>
//           <Header title={`Zaproszenie na spotkanie kręgu ${circleName}`} />

//           <Section>
//             <Text style={paragraph}>
//               Cześć {userName}, zapraszam Cię na nowe spotkanie kręgu <strong>{circleName}</strong>!
//             </Text>

//             <Text style={paragraph}>
//               <strong>Data:</strong> {formatMeetingDate(startTime, endTime, locale)}
//             </Text>
//             <Text style={paragraph}>
//               <strong>Miejsce:</strong> {street}, {city}
//             </Text>
//             <Text style={paragraph}>
//               <strong>Cena spotkania:</strong> {price.toFixed(2)} PLN
//             </Text>

//             {moderatorName && (
//               <Section style={{ marginTop: "15px", display: "flex", alignItems: "center" }}>
//                 {moderatorAvatarUrl && (
//                   <Img
//                     src={moderatorAvatarUrl}
//                     alt={moderatorName}
//                     width={40}
//                     height={40}
//                     style={{ borderRadius: "50%", marginRight: "10px" }}
//                   />
//                 )}
//                 <Text style={paragraph}>
//                   Spotkanie prowadzi: <strong>{moderatorName}</strong>
//                 </Text>
//               </Section>
//             )}

//             <Text style={{ ...paragraph, fontSize: "14px", color: "#555" }}>
//               Jeśli nie możesz wziąć udziału, skontaktuj się z moderatorem spotkania.
//             </Text>
//           </Section>

//           <Footer />
//         </Container>
//       </Body>
//     </Html>
//   );
// }

// const main = {
//   backgroundColor: "#121212",
//   color: "#fff",
//   fontFamily: "Arial, sans-serif",
//   padding: "40px 0",
// } as const;

// const container = {
//   backgroundColor: "#1e1e1e",
//   borderRadius: "8px",
//   padding: "32px",
//   maxWidth: "500px",
//   margin: "0 auto",
// } as const;

// const paragraph = {
//   fontSize: "16px",
//   lineHeight: "22px",
//   marginBottom: "16px",
// } as const;
