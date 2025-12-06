import { Preview, Section, Text } from "@react-email/components";
import { Header } from "./components/Header";
import { Circle, User } from "@prisma/client";
import { EmailLayout, Sign, emailStyles } from "./Components";

export function RemoveMembershipEmail({
  member,
  circle,
  moderator,
  reason,
} : {
  member: Pick<User, "name">;
  circle: Pick<Circle, "name">;
  moderator: Pick<User, "name" | "image" | "title">;
  reason?: string | null;
}) {
  return (
    <EmailLayout
      sign={<Sign
        name={moderator.name}
        avatarUrl={moderator.image}
        title={moderator.title}
      />}
    >
      <Preview>Zostałeś usunięty z kręgu {circle.name} – Męska Strona Mocy</Preview>
      <Header title={`Zostałeś usunięty z kręgu ${circle.name}`} />

      <Section>
        <Text style={emailStyles.paragraph}>
          {member.name ? `Cześć, ${member.name}` : "Cześć"}!
        </Text>

        <Text style={emailStyles.paragraph}>
          Informujemy, że zostałeś usunięty z kręgu <strong>{circle.name}</strong>.
        </Text>

        {reason && (
          <Text style={emailStyles.paragraph}>
            <em>Powód usunięcia:</em> {reason}
          </Text>
        )}
      </Section>
    </EmailLayout>
  );
}

// --- Podgląd ---
export default function RemoveMembershipEmailPreview() {
  return (
    <RemoveMembershipEmail
      member={{ name: "Joshamee Gibbs" }}
      circle={{ name: "Załoga Czarnej Perły"}}
      moderator={{
        name: "Jack Sparrow",
        image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
        title: "Kapitan",
      }}
      reason="Namawianie załogi do buntu (Mutynia)"
    />
  );
}