//emails
import * as React from "react";
import { EmailButton, RootLayout } from "./RootLayout";
import { Text, Section } from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
  token: string; // token do weryfikacji
}

export function WelcomeEmail ({ name, token } : WelcomeEmailProps ) {
  return (
    <RootLayout
      previewText="Witamy na stronie!" // stały tekst podglądu
    >
      <Section style={{ marginBottom: "16px" }}>
        <Text style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>
          Cześć {name ?? "Użytkowniku"},
        </Text>
      </Section>

      <Section style={{ marginBottom: "16px" }}>
        <Text style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>
          Witamy na naszej stronie! Cieszymy się, że do nas dołączyłeś.
          Aby zakończyć rejestrację i ustawić swoje hasło, kliknij w link poniżej.
        </Text>
      </Section>

      {/* Button do ustawienia hasła */}
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={`${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`}>
          Ustaw hasło
        </EmailButton>
      </Section>


      <Section>
        <Text style={{ margin: 0, fontSize: "14px", lineHeight: "20px", color: "#666", alignContent: "center" }}>
          Jeśli nie zakładałeś konta, zignoruj tego maila.
        </Text>
      </Section>
    </RootLayout>
  );
};

export default function EmailPreviewPage() {
  return <WelcomeEmail name="Alexander" token="2137"/>;
}