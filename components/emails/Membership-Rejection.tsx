//components/emails/Membership-Rejection

import { Circle, User } from "@prisma/client";
import { EmailLayout, Header, Sign, emailStyles } from "./Components";
import { Preview, Section, Text } from "@react-email/components";

export function MembershipRejectionEmail({
    member,
    moderator,
    circle
} : {
    member: Pick<User, "name">,
    circle: Pick<Circle, "name">,
    moderator: Pick<User, "name" | "image" | "title">
}) {
    return (
        <EmailLayout
            sign={<Sign
                name={moderator.name}
                avatarUrl={moderator.image}
                title={moderator.title}
            />}
        >
            <Preview>Może spotkamy się w innym kręgu – gdy nadejdzie odpowiedni moment 💫</Preview>

            <Header title="Szkoda, że tym razem nie dołączasz" />

            <Section>
                <Text style={emailStyles.paragraph}>Cześć {member.name},</Text>

                <Text style={emailStyles.paragraph}>
                    Widziałem, że odrzuciłeś zaproszenie do kręgu <strong>{circle.name}</strong>.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Całkowicie to rozumiem — każdy ma swój czas i swoje miejsce. Może po prostu ten moment jeszcze nie nadszedł.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Jeśli kiedyś zechcesz wrócić albo po prostu porozmawiać, będę się cieszyć, mogąc Cię znów spotkać.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Wszystkiego dobrego i wielu inspirujących rozmów — gdziekolwiek je znajdziesz 🙏
                </Text>
            </Section>
        </EmailLayout>
    )
}

export default function MembershipRejectionEmailPreview() {
    return (
        <MembershipRejectionEmail
            member={{ name: "Joshameee Gibbs" }}
            circle={{ name: "Załoga Czarnej Perły" }}
            moderator={{
                name: "Jack Sparrow",
                image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
                title: "Kapitan",
            }}
        />
    )
}