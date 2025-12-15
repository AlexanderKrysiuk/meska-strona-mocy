import { Circle, City, Currency, Meeting, User } from "@prisma/client";
import { EmailLayout, Header, Sign, emailStyles } from "./Components";
import { Preview, Section, Text } from "@react-email/components";
import { WeekDayPL } from "@/utils/weekdays";

export function CircleChangeEmail({
    oldCircle,
    newCircle,
    moderator,
    member,
    meetings = []
} : {
    oldCircle: Pick<Circle, "name" | "street" | "price" | "currency" | "startHour" | "endHour" | "plannedWeekday" | "frequencyWeeks" | "timeZone"> & { city: Pick<City, "name"> | null },
    newCircle: Pick<Circle, "name" | "street" | "price" | "currency" | "startHour" | "endHour" | "plannedWeekday" | "frequencyWeeks" | "timeZone"> & { city: Pick<City, "name"> | null },
    moderator: Pick<User, "name" | "image" | "title">
    member: Pick<User, "name">
    meetings?: Pick<Meeting, "id" | "date">[]
}) {
    const oldStyle = { color: "#ff5555", textDecoration: "line-through" };
    const newStyle = { color: "#55ff55" };
    

    const formatAddress = (street?: string | null, cityName?: string | null) => {
        if (!cityName) return "spotkania odbywają się online 🌐";
        if (!street) return `miasto: ${cityName} (dokładny adres wkrótce)`;
        return `${street}, ${cityName}`;
    };
    
    const formatPrice = (price: number | null, currency: Currency) => {
        if (!price) return "spotkanie bezpłatne";
        return `${price} ${currency}`;
    };    

    const formatTime = (
        startHour: string,
        endHour: string,
        weekday: string | null,
        frequencyWeeks: number | null,
        timeZone: string | null
      ) => {
        const weekdayPL = weekday ? (WeekDayPL[weekday] || weekday) : "termin do ustalenia";
        const every = frequencyWeeks ? (frequencyWeeks === 1 ? "co tydzień" : `co ${frequencyWeeks} tygodnie`) : "";
      
        return `${weekdayPL}${every ? ", " + every : ""}, ${startHour}–${endHour}${timeZone ? ` (${timeZone})` : ""}`;
      };

    // Porównania
    const nameChanged = oldCircle.name !== newCircle.name;
    const addressChanged =
        oldCircle.street !== newCircle.street ||
        oldCircle.city?.name !== newCircle.city?.name;
    const priceChanged =
        oldCircle.price !== newCircle.price ||
        oldCircle.currency !== newCircle.currency;
    const timeChanged =
        oldCircle.startHour !== newCircle.startHour ||
        oldCircle.endHour !== newCircle.endHour ||
        oldCircle.plannedWeekday !== newCircle.plannedWeekday ||
        oldCircle.frequencyWeeks !== newCircle.frequencyWeeks ||
        oldCircle.timeZone !== newCircle.timeZone;  

    function formatDateOnly(date: Date): string {
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // miesiące od 0
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    }
    

    return <EmailLayout
        sign={<Sign 
            name={moderator.name}
            avatarUrl={moderator.image}
            title={moderator.title}
        />}
    >
        <Preview>Aktualizacja informacji o kręgu {newCircle.name}</Preview>
        <Header title={`Zmiany w kręgu ${newCircle.name}`} />

        <Section>
            <Text style={{ ...emailStyles.paragraph }}>
                Cześć <strong>{member.name}</strong>, dane kręgu {oldCircle.name} zostały zaktualizowane:
            </Text>

            {/* Nazwa */}
            <Text style={emailStyles.paragraph}>
                <strong>🔖 Nazwa: </strong>
                {nameChanged ? (
                    <>
                        <br /><span style={oldStyle}>❌ {oldCircle.name}</span>
                        <br /><span style={newStyle}>✅ {newCircle.name}</span>
                    </>
                ) : (
                    <span> {oldCircle.name}</span>
                )}
            </Text>

            {/* Adres / online */}
            <Text style={emailStyles.paragraph}>
                <strong>🏠 Forma i miejsce spotkań:</strong>
                {addressChanged ? (
                    <>
                        <br /><span style={oldStyle}>❌ {formatAddress(oldCircle.street, oldCircle.city?.name)}</span>
                        <br /><span style={newStyle}>✅ {formatAddress(newCircle.street, newCircle.city?.name)}</span>
                    </>
                ) : (
                    <span> {formatAddress(oldCircle.street, oldCircle.city?.name)}</span>
                )}
            </Text>

            {/* Czas spotkań */}
            <Text style={emailStyles.paragraph}>
                <strong>⏰ Czas spotkań:</strong>
                {timeChanged ? (
                    <>
                        <br /><span style={oldStyle}>❌ {formatTime(oldCircle.startHour, oldCircle.endHour, oldCircle.plannedWeekday, oldCircle.frequencyWeeks, oldCircle.timeZone)}</span>
                        <br /><span style={newStyle}>✅ {formatTime(newCircle.startHour, newCircle.endHour, newCircle.plannedWeekday, newCircle.frequencyWeeks, newCircle.timeZone)}</span>
                    </>
                ) : (
                    <span> {formatTime(oldCircle.startHour, oldCircle.endHour, oldCircle.plannedWeekday, oldCircle.frequencyWeeks, oldCircle.timeZone)}</span>
                )}
            </Text>

            {/* Cena */}
            <Text style={emailStyles.paragraph}>
                <strong>🎫 Wkład energetyczny:</strong>
                {priceChanged ? (
                    <>
                        <br /><span style={oldStyle}>❌ {formatPrice(oldCircle.price, oldCircle.currency)}</span>
                        <br /><span style={newStyle}>✅ {formatPrice(newCircle.price, newCircle.currency)}</span>
                    </>
                ) : (
                    <span> {formatPrice(oldCircle.price, oldCircle.currency)}</span>
                )}
            </Text>

            {/* Najbliższe spotkania */}
            <Text style={{ ...emailStyles.paragraph }}>
                <strong>🗓 Najbliższe terminy spotkań:</strong>
                {meetings.length > 0 ? (meetings.map(m => (
                    <span key={m.id} style={{ display: "block" }}>
                        {formatDateOnly(new Date(m.date))}
                    </span>))
                ) : (
                    <span>Brak zaplanowanych spotkań</span>
                )}
            </Text>

        </Section>
    </EmailLayout>
}

export default function CircleChangeEmailPreview() {
    return <CircleChangeEmail
        oldCircle={{
            name: "Załoga Czarnej Perły",
            street: "Tortuga 21/37",
            price: 150,
            currency: "PLN",
            plannedWeekday: "Monday",
            frequencyWeeks: 1,
            startHour: "18:00",
            endHour: "20:00",
            timeZone: null,
            city: { name: "Isla De Muerta" }
        }}
        newCircle={{
            name: "Latający Holender",
            street: null,
            price: 0,
            currency: "EUR",
            plannedWeekday: "Tuesday",
            frequencyWeeks: 2,
            startHour: "19:00",
            endHour: "21:00",
            timeZone: "Europe/Warsaw",
            city: null
        }}
        moderator={{
            name: "Jack Sparrow",
            image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
            title: "Kapitan",
        }}
        member={{
            name: "Joshamee Gibbs"
        }}
        meetings={[
            { id: "1", date: new Date("2025-12-20T18:00:00Z") },
            { id: "2", date: new Date("2025-12-27T18:00:00Z") }
        ]}        
    />
}