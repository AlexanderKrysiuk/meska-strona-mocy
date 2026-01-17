import { Email, styles } from "./Components"
import { Button, Text } from "@react-email/components"

export const WelcomeEmail = ({
  name,
  verifyURL,
} : {
  name: string,
  verifyURL: string,
}) => {
  return <Email previewText="Witamy na Męskiej Stronie Mocy">
    <Text style={styles.paragraph}>
      Cześć <strong>{name ?? "Użytkowniku"}</strong>,
    </Text>
    <Text style={styles.paragraph}>
      Witamy na naszej stronie! Cieszymy się, że do nas dołączyłeś. Aby zakończyć rejestrację i ustawić swoje hasło, kliknij w link poniżej.
    </Text>
    <Button
      style={styles.button}
      href={verifyURL}
    >
      Przejdź dalej
    </Button>
    <Text style={styles.paragraph}>
      Jeśli nie zakładałeś konta, zignoruj tego maila.
    </Text>
  </Email>
}

const WelcomeEmailPreview = () => {
  return <WelcomeEmail name="Jack Sparrow" verifyURL=""/>
}
export default WelcomeEmailPreview

// //emails
// import { EmailButton, RootLayout } from "./RootLayout";
// import { Text, Section } from "@react-email/components";

// export function WelcomeEmail (
//   name: string, 
//   token: string,
//   email: string 
// ) {
//   return (
//     <RootLayout
//       previewText="Witamy na stronie!" // stały tekst podglądu
//     >
//       <Section style={{ marginBottom: "16px" }}>
//         <Text style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>
//           Cześć {name ?? "Użytkowniku"},
//         </Text>
//       </Section>

//       <Section style={{ marginBottom: "16px" }}>
//         <Text style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>
//           Witamy na naszej stronie! Cieszymy się, że do nas dołączyłeś.
//           Aby zakończyć rejestrację i ustawić swoje hasło, kliknij w link poniżej.
//         </Text>
//       </Section>

//       {/* Button do ustawienia hasła */}
//       <Section style={{ textAlign: "center", margin: "24px 0" }}>
//         <EmailButton href={`${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}&identifier=${encodeURIComponent(email)}`}>
//           Ustaw hasło
//         </EmailButton>
//       </Section>


//       <Section>
//         <Text style={{ margin: 0, fontSize: "14px", lineHeight: "20px", color: "#666", alignContent: "center" }}>
//           Jeśli nie zakładałeś konta, zignoruj tego maila.
//         </Text>
//       </Section>
//     </RootLayout>
//   );
// };

// export default function EmailPreviewPage() {
//   return WelcomeEmail("Jack Sparrow", "2137", "jacksparrow@piratebay.co.uk")
// }