//components/emails/Membership-Acceptance

import { Circle, City, Country, Currency, Meeting, User } from "@prisma/client";
import { EmailLayout, Header, Sign, emailStyles } from "./Components";
import { Preview, Section, Text } from "@react-email/components";
import { formatedDate } from "@/utils/date";

export function MembershipAcceptanceEmail({
    member,
    circle,
    moderator,
    meetings
} : {
    member: Pick<User, "name">
    circle: Pick<Circle, "name">
    moderator: Pick<User, "name" | "image" | "title">
    meetings: (Pick<Meeting, "id" | "startTime" | "endTime" | "street" | "price" | "currency"> & {
        city: Pick<City, "name"> & {
            region: {
                country: Pick<Country, "timeZone">
            }
        }
    })[]
})  {
    return <EmailLayout
        sign={<Sign
            name={moderator.name}
            avatarUrl={moderator.image}
            title={moderator.title}
        />}
    >
        <Preview>
            Witaj w kręgu {circle.name}! Twoje dołączenie zostało potwierdzone 🎉
        </Preview>

        <Header title={`Witamy w kręgu ${circle.name}!`} />

        <Section>
            <Text style={emailStyles.paragraph}>
                Cześć {member.name},
            </Text>

            <Text style={emailStyles.paragraph}>
                Cieszymy się, że dołączyłeś do kręgu: <strong>{circle.name}</strong>. 
                Od teraz jesteś częścią naszej społeczności i możesz uczestniczyć w spotkaniach oraz wspólnych aktywnościach.
            </Text>

            {meetings.length > 0 ? (
                    <>
                        <Text style={emailStyles.paragraph}>
                            Oto spotkania, do których zostałeś przypisany:
                        </Text>
                        <ul>
                            {meetings.map((meeting) => (
                                <li key={meeting.id} style={emailStyles.paragraph}>
                                    <div>
                                        <strong>📅 Data:</strong>{" "}
                                        {formatedDate(meeting.startTime, meeting.endTime, meeting.city.region.country.timeZone)}
                                    </div>
                                    <div>
                                        <strong>📍 Miejsce:</strong>{" "}
                                        {meeting.street}, {meeting.city.name}
                                    </div>

                                    {meeting.price > 0 && 
                                        <div>
                                            <strong>🎫 Cena:</strong>{" "}
                                            {meeting.price} {meeting.currency}
                                        </div>
                                    }
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <Text style={emailStyles.paragraph}>
                        Obecnie nie masz przypisanych spotkań, ale wkrótce mogą się pojawić nowe okazje do udziału.
                    </Text>
                )}

                <Text style={emailStyles.paragraph}>
                    Do zobaczenia na spotkaniach i w rozmowach – nie możemy się doczekać wspólnych inspirujących chwil!
                </Text>
            </Section>
    </EmailLayout>
}

export default function PreviewMembershipAcceptanceEmail() {
    return (
        <MembershipAcceptanceEmail
            member={{ name: "Joshameee Gibbs" }}
            circle={{ name: "Załoga Czarnej Perły" }}
            moderator={{
                name: "Jack Sparrow",
                image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
                title: "Kapitan",
            }}
            meetings={[
                {
                    id: "m1",
                    startTime: new Date("2025-11-01T18:00:00Z"),
                    endTime: new Date("2025-11-01T23:00:00Z"),
                    street: "Zatoka Martwych Ludzi 7",
                    price: 0,
                    currency: "Dublony" as Currency,
                    city: { 
                        name: "Tortuga",
                        region: {
                            country: {
                                timeZone: "America/Jamaica"
                            }
                        }
                    },
                },
                {
                    id: "m2",
                    startTime: new Date("2025-11-15T20:00:00Z"),
                    endTime: new Date("2025-11-16T02:00:00Z"),
                    street: "Port Krwawych Mgieł 13",
                    price: 100,
                    currency: "Dublony" as Currency,
                    city: { 
                        name: "Port Royal",
                        region: {
                            country: {
                                timeZone: "America/Jamaica"
                            }
                        }
                    },
                },
            {
                id: "m3",
                startTime: new Date("2025-12-05T17:00:00Z"),
                endTime: new Date("2025-12-05T22:00:00Z"),
                street: "Wyspa Skarbów 1",
                price: 250,
                currency: "Dublony" as Currency,
                city: { 
                    name: "Isla de Muerta", 
                    region: {
                        country: {
                            timeZone: "America/Jamaica"
                        }
                    }
                },
            },
        ]}
      />
    );
  }