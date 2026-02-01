//emails/Reset-Password-Email.tsx
import { Email, styles } from "./Components"
import { Button, Text } from "@react-email/components"

export const ResetPasswordEmail = ({
  name,
  resetURL,
}: {
  name?: string
  resetURL: string
}) => {
  const greeting = name ? `Cześć ${name},` : "Cześć,"

  return (
    <Email previewText="Reset hasła – Męska Strona Mocy">
      <Text style={styles.paragraph}>
        <strong>{greeting}</strong>
      </Text>

      <Text style={styles.paragraph}>
        Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.
        Aby ustawić nowe hasło, kliknij w przycisk poniżej.
      </Text>

      <Button
        style={styles.button}
        href={resetURL}
      >
        Zresetuj hasło
      </Button>

      <Text style={styles.paragraph}>
        Jeśli to nie Ty wysłałeś tę prośbę, po prostu zignoruj tę wiadomość —
        Twoje hasło pozostanie bez zmian.
      </Text>
    </Email>
  )
}

/* 🔍 PREVIEW */
const ResetPasswordEmailPreview = () => {
  return (
    <ResetPasswordEmail
      name="Jack"
      resetURL="https://meskastronamocy.pl/auth/reset?token=example-token-123"
    />
  )
}

export default ResetPasswordEmailPreview