//Meeting-Update.tsx
//import { Preview, Section, Text } from "@react-email/components";
//import { EmailLayout, Header, Sign, emailStyles } from "./Components";
//import { formatedDate, getGMTOffset } from "@/utils/date";
//import { Circle, City, Meeting, User } from "@prisma/client";

// interface MeetingUpdatedEmailProps {
//   // participant: Pick<User, "name"> 
//   // oldMeeting: Pick<Meeting, "startTime" | "endTime" >
//   // newMeeting: Pick<Meeting, "startTime" | "endTime" >
//   // circle: Pick<Circle, "name" | "street" | "price" | "currency">
//   // city?: Pick<City, "name"> | null
//   // timeZone: string
//   // moderator: Pick<User, "name" | "image" | "title">
// }

export function MeetingUpdatedEmail(
 // {
  // participant,
  // oldMeeting,
  // newMeeting,
  // circle,
  // city,
  // timeZone,
  // moderator
//}: MeetingUpdatedEmailProps
) {
  // const oldDate = formatedDate(oldMeeting.startTime, oldMeeting.endTime, timeZone);
  // const newDate = formatedDate(newMeeting.startTime, newMeeting.endTime, timeZone);

  // const address = (() => {
  //   if (!city?.name) return `spotykamy się online 🌐 (${getGMTOffset(timeZone)})`;
  //   if (!circle.street) return `ulica nie została jeszcze ustalona, ${city.name}`;
  //   return `${circle.street}, ${city.name}`;
  // })();
  
  // const price = (() => {
  //   if (!circle.price || !circle.currency) return "bezpłatne";
  //   return `${circle.price} ${circle.currency}`;
  // })();

  // const oldStyle = { color: "#ff5555", textDecoration: "line-through", marginRight: "4px" };
  // const newStyle = { color: "#55ff55", fontWeight: "bold" };

  // return (
  //   <EmailLayout
  //     sign={<Sign
  //       name={moderator.name}
  //       avatarUrl={moderator.image}
  //       title={moderator.title}
  //     />}
  //   >
  //     <Preview>Zmiana spotkania w kręgu {circle.name}</Preview>
  //     <Header title={`Zmiana spotkania w ${circle.name}`} />

  //     <Section style={{ marginBottom: "32px" }}>
  //       <Text style={{ ...emailStyles.paragraph }}>
  //         Cześć<strong>{" " + participant.name}</strong>, Spotkanie w kręgu <strong>{circle.name}</strong> zostało zmienione przez moderatora<strong>{" " + moderator.name}.</strong>
  //       </Text>
        
  //       <Text style={{ ...emailStyles.paragraph }}>
  //         <strong>📅 Data: </strong>
  //         {oldDate !== newDate ? 
  //           <>
  //             <br/><span style={oldStyle}>❌ {oldDate}</span>
  //             <br/><span style={newStyle}>✅ {newDate}</span>
  //           </>
  //           :
  //           <span>{oldDate}</span>  
  //         } 
  //       </Text>

  //       <Text style={{ ...emailStyles.paragraph }}>
  //         <strong>🏠 Adres: {address}</strong>
  //       </Text>

  //       <Text style={{ ...emailStyles.paragraph }}>
  //         <strong>🎫 Wkład energetyczny: {price}</strong>
  //       </Text>
  //     </Section>
  //   </EmailLayout>
  // );
}

export default function MeetingUpdatedEmailPreview() {
  // return (
  //   <MeetingUpdatedEmail
  //     participant={{ name: "Joshamee Gibbs" }}
  //     circle={{ 
  //       name: "Załoga Czarnej Perły", 
  //       street: "ul. Tortuga 21", 
  //       price: 37, 
  //       currency: "PLN" 
  //     }}
  //     city={{ name: "Isla De Muerta" }}
  //     timeZone="Europe/Warsaw"
  //     oldMeeting={{
  //       startTime: new Date("2025-09-20T18:00:00Z"),
  //       endTime: new Date("2025-09-20T20:00:00Z"),
  //     }}
  //     newMeeting={{
  //       startTime: new Date("2025-09-22T19:00:00Z"),
  //       endTime: new Date("2025-09-22T21:00:00Z"),
  //     }}
  //     moderator={{
  //       name: "Jack Sparrow",
  //       image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
  //       title: "Kapitan",
  //     }}
  //   />
  // );
}
