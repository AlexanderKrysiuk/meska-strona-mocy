import { Section, Text } from "@react-email/components";
import { EmailLayout, Header, emailStyles } from "./Components";
import { Circle, CircleMeeting, CircleMeetingParticipant, User, City, Country, Region } from "@prisma/client";
import { formatedDate } from "@/utils/date";

interface RestoreParticipantEmailProps {
  user: Pick<User, "name">;
  circle: Pick<Circle, "name">;
  meeting: CircleMeeting & { city: City & { region: Region & { country: Country } } };
  participation: CircleMeetingParticipant;
}

export default function ReturnParticipantFromVacationEmail({
  user,
  circle,
  meeting,
}: RestoreParticipantEmailProps) {
    return (
        <EmailLayout>
            <Header title={`Twój powrót do kręgu ${circle.name}`} />

            <Section style={{ marginBottom: "32px" }}>
                <Text style={emailStyles.paragraph}>
                    {user.name ? `Cześć ${user.name},` : "Cześć!"} 
                    Zostałeś przywrócony z urlopu i możesz ponownie uczestniczyć w spotkaniach kręgu <strong>{circle.name}</strong>.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Spotkanie, z którego wróciłeś z urlopu, przypada na: <strong>{formatedDate(
                            meeting.startTime,
                            meeting.endTime,
                            meeting.city.region.country.timeZone,
                            "withDay",
                            meeting.city.region.country.locale
                        )}</strong>.
                </Text>

                <Text style={emailStyles.paragraph}>
                    Status Twojego uczestnictwa został zmieniony na <strong>Aktywny</strong>.
                </Text>
            </Section>
        </EmailLayout>
    );
}
