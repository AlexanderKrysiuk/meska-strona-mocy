import { VerificationToken } from "@prisma/client";
import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout, Header, Button, emailStyles } from "./Components";

interface WelcomeEmailProps {
  token: VerificationToken;
  name?: string | null;
}

export default function WelcomeEmail({ token, name }: WelcomeEmailProps) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${domain}/auth/verification?token=${token?.id || ""}`;

  return (
    <EmailLayout>
      <Preview>Potwierdź swoje konto – Męska Strona Mocy</Preview>
      <Header title="Potwierdź swoje konto" />

      <Section style={{ marginBottom: "32px" }}>
        <Text style={emailStyles.paragraph}>
          {name ? `Cześć ${name},` : "Cześć!"} Dziękujemy za dołączenie do
          Męskiej Strony Mocy. Aby w pełni korzystać z serwisu, potwierdź swoje
          konto klikając w przycisk poniżej:
        </Text>

        <Button href={verificationUrl} style={{ marginBottom: "20px" }}>
          Potwierdź konto
        </Button>

        <Text style={emailStyles.paragraph}>
          Po potwierdzeniu zostaniesz przekierowany do ustawienia hasła do
          konta.
        </Text>
        <Text style={emailStyles.paragraph}>
          Jeśli nie rejestrowałeś się na naszej stronie, zignoruj tę wiadomość.
        </Text>
      </Section>
    </EmailLayout>
  );
}
