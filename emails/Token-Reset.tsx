import { Button, Text } from "@react-email/components"
import { Email, styles } from "./Components"


export const TokenResetEmail = ({
    resetURL
} : {
    resetURL: string
}) => {
    return <Email previewText="Zresetowano Token">
        <Text style={styles.title}>
            Token wygasł
        </Text>
        <Text>
            Poprzedni token stracił ważność, dlatego został automatycznie zresetowany.
        </Text>
        <Text>
            Aby kontynuować, skorzystaj z nowego linku poniżej:
        </Text>
        <Button
            style={styles.button}
            href={resetURL}
        >
            Przejdź dalej
        </Button>
        <Text>
            Jeżeli ta akcja nie została zainicjowana przez Ciebie, możesz zignorować tę wiadomość.        
        </Text>
    </Email>
}

const TokenResetEmailPreview = ({}) => {
    return <TokenResetEmail resetURL=""/>
}
export default TokenResetEmailPreview