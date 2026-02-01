import { Email, styles } from "./Components"
import { Button, Text } from "@react-email/components"

export const WelcomeEmail = ({
  name,
  verifyURL,
} : {
  name: string,
  verifyURL: string,
}) => {
  const greeting = name ? `Cześć ${name},` : "Cześć" 

  return <Email previewText="Witamy na Męskiej Stronie Mocy">
    <Text style={styles.paragraph}>
      <strong>{greeting}</strong>,
    </Text>
    <Text style={styles.paragraph}>
      Witamy na naszej stronie! Cieszymy się, że do nas dołączyłeś. Aby zakończyć rejestrację, kliknij w przycisk poniżej.
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