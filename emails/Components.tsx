import { User } from "@/generated/prisma/client"
import { Body, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"

export const styles = {
    button: {
        display: "inline-block",
        border: "2px solid #000",
        borderRadius: 6,
        padding: "12px 20px",
        color: "#fff",
        backgroundColor: "#000",
        fontWeight: "bold"
    },

    title: {
        fontSize: 20,
        fontWeight: "bold"
    },

    paragraph: {
        textAlign: "left" as const
    }
}

export const Email = ({
    previewText,
    children,
    signature
} : {
    children: React.ReactNode
    previewText: string
    signature?: Pick<User, "name" | "image">
}) => {
    return <Html>
        <Head>
            <Preview>{previewText ?? "Masz nową wiadomość"}</Preview>
        </Head>
        <Body
            style={{
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
                textAlign: "center"
            }}
        >
            {/* Logo */}
            <Section>
                
            </Section>
            {/* Body */}
            <Section
                style={{
                    padding: "0 20px"
                }}
            >
                {children}
            </Section>
            {/* Footer */}
            <Hr/>
            <Section>
                <Text>
                    To jest wiadomość wysłana automatycznie, prosimy na nią nie odpowiadać
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                    Męska Strona Mocy
                </Text>
            </Section>
        </Body>
    </Html>
}

