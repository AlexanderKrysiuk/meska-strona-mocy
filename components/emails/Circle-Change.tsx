import { Circle, City, User } from "@prisma/client";
import { EmailLayout, Header, Sign, emailStyles } from "./Components";
import { Preview, Section, Text } from "@react-email/components";

export function CircleChangeEmail({
    oldCircle,
    newCircle,
    moderator,
    member,
} : {
    oldCircle: Pick<Circle, "name" | "street" | "price" | "currency"> & {
        city: Pick<City, "name"> | null
    }
    newCircle: Pick<Circle, "name" | "street" | "price" | "currency"> & {
        city: Pick<City, "name"> | null
    }
    moderator: Pick<User, "name" | "image" | "title">
    member: Pick<User, "name">
}) {
    const oldStyle = { color: "#ff5555", textDecoration: "line-through" };
    const newStyle = { color: "#55ff55" };
    
    const formatAddress = (street?: string | null, cityName?: string | null) => {
        if (!cityName) return "spotykamy się online 🌐";
        if (!street) return `ulica nie została jeszcze ustalona, ${cityName}`;
        return `${street}, ${cityName}`;
    };
    
    const formatPrice = (price?: number | null, currency?: string | null) => {
        if (price == null || !currency) return "bezpłatne";
        return `${price} ${currency}`;
    };

    const oldAddress = formatAddress(oldCircle.street, oldCircle.city?.name);
    const newAddress = formatAddress(newCircle.street, newCircle.city?.name);

    const oldPrice = formatPrice(oldCircle.price, oldCircle.currency)
    const newPrice = formatPrice(newCircle.price, newCircle.currency)
  
    return <EmailLayout
        sign={<Sign 
            name={moderator.name}
            avatarUrl={moderator.image}
            title={moderator.title}
        />}
    >
        <Preview>Zmiany w kręgu {oldCircle.name}</Preview>
        <Header title={`Zmiany w kręgu ${oldCircle.name}`}/>

        <Section>
            <Text style={{ ...emailStyles.paragraph }}>
                {`Cześć${" " + member.name}, Od dzisiaj dane kręgu ${oldCircle.name} zostały zaktualizowane:`}
            </Text>

            <Text style={{ ...emailStyles.paragraph }}>
                <strong>🔖 Nazwa: </strong>
                {oldCircle.name !== newCircle.name ? 
                    <>
                        <br/><span style={oldStyle}>❌ {oldCircle.name}</span>
                        <br/><span style={newStyle}>✅ {newCircle.name}</span>
                    </> 
                    : 
                    <span>{oldCircle.name}</span>
                } 
            </Text>

            <Text style={{ ...emailStyles.paragraph }}>
                <strong>🏠 Adres:</strong>
                {oldAddress !== newAddress ?
                    <>
                        <br/><span style={oldStyle}>❌ {oldAddress}</span>
                        <br/><span style={newStyle}>✅ {newAddress}</span>
                    </>
                    :
                    <span>{oldAddress}</span>
                }
            </Text>
            
            <Text style={{ ...emailStyles.paragraph }}>
                <strong>🎫 Cena:</strong>
                {oldPrice !== newPrice ?
                    <>
                        <br/><span style={oldStyle}>❌ {oldPrice}</span>
                        <br/><span style={newStyle}>✅ {newPrice}</span>
                    </>
                    :
                    <span>{oldPrice}</span>
                }
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
            city: { name: "Isla De Muerta"}
        }}
        newCircle={{
            name: "Latający Holender",
            street: "Tortuga 420",
            price: 150,
            currency: "PLN",
            city: { name: "Port Royal"}
        }}
        moderator={{
            name: "Jack Sparrow",
            image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
            title: "Kapitan",
        }}
        member={{
            name: "Joshamee Gibbs"
        }}
    />
}