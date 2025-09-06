import { Section, Text } from "@react-email/components";
import { EmailLayout, Header, emailStyles } from "./Components";
import { Circle, CircleMeeting, CircleMeetingParticipant, User, City, Country, Region, Currency } from "@prisma/client";
import { formatedDate } from "@/utils/date";

interface ParticipantVacationEmailProps {
    user: Pick<User, "name">;
    circle: Pick<Circle, "name">
    meeting: CircleMeeting & { 
        city: City & { 
            region: Region & { 
                country: Country 
            }
        },
        currency: Currency 
    };
    participation: CircleMeetingParticipant
}

export default function SendParticipantToVacationEmail({
  user,
  circle,
  meeting,
  participation,
}: ParticipantVacationEmailProps) {

    return (
        <EmailLayout>
            <Header title={`Twój urlop w kręgu ${circle.name}`} />

            <Section style={{ marginBottom: "32px" }}>
                <Text style={emailStyles.paragraph}>
                    {user.name ? `Cześć ${user.name},` : "Cześć!"} Zostałeś wysłany na urlop z kręgu <strong>{circle.name}</strong>.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Za spotkanie, które przypadało w dniu: <strong>{formatedDate(meeting.startTime, meeting.endTime, meeting.city.region.country.timeZone, "withDay", meeting.city.region.country.locale)}</strong>, zwróciliśmy Ci kwotę <strong>{participation.amountPaid} {meeting.currency.code}</strong> na Twoje saldo.
                </Text>

            </Section>
        </EmailLayout>
    );
}
