// // MeetingVacationEmail.tsx
// import React from "react";
// import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
// import { formatedMeetingDate } from "@/utils/date"; 
// import { Sign, emailStyles } from "./Components";

// interface SendMemberToVacationEmailProps {
//   startTime: Date;
//   endTime: Date;
//   cityId: string;
//   circleName: string;
//   memberName?: string | null;
//   authorName?: string | null;
//   authorAvatar?: string | null;
//   authorTitle?: string | null;
//   amountRefunded?: number;
// }

// export const SendMemberToVacationEmail = async ({
//   startTime,
//   endTime,
//   cityId,
//   circleName,
//   memberName,
//   authorName,
//   authorAvatar,
//   authorTitle,
//   amountRefunded,
// }: SendMemberToVacationEmailProps) => {
//   const formattedDate = await formatedMeetingDate(startTime, endTime, cityId);

//   return (
//     <Html>
//       <Head />
//       <Preview>Przyznano Ci urlop na spotkanie {circleName}</Preview>
//       <Body style={emailStyles.main}>
//         <Container style={emailStyles.container}>
//           <Section>
//             <Text style={emailStyles.paragraph}>
//               Cześć {memberName ?? "Użytkowniku"}, przyznano Ci urlop na spotkanie kręgu{" "}
//               <strong>{circleName}</strong>.
//             </Text>

//             <Text style={emailStyles.paragraph}>
//               <strong>Termin:</strong> {formattedDate}
//             </Text>

//             {amountRefunded && amountRefunded > 0 && (
//               <Text style={emailStyles.paragraph}>
//                 Zwrot wpłaconych środków: <strong>{amountRefunded.toFixed(2)} PLN</strong> został dodany do Twojego konta.
//               </Text>
//             )}

//             <Text style={{ ...emailStyles.paragraph, fontSize: "14px", color: "#aaa" }}>
//               W razie pytań możesz napisać bezpośrednio do moderatora.
//             </Text>

//             {/* Stopka z podpisem */}
//             <Sign
//               name={authorName}
//               avatarUrl={authorAvatar}
//               title={authorTitle}
//             />
//           </Section>
//         </Container>
//       </Body>
//     </Html>
//   );
// };
