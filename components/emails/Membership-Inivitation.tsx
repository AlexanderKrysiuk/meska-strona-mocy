import { Preview, Section, Text } from "@react-email/components";
import { Header, EmailLayout, Sign, emailStyles } from "./Components";
import { Circle, User } from "@prisma/client";

export function MembershipInvitationEmail({
  member,
  circle,
  moderator,
  //loginUrl,
}: {
  member: Pick<User, "name">;
  circle: Pick<Circle, "name">;
  moderator: Pick<User, "name" | "image" | "title">;
  //loginUrl: string;
}) {
  return (
    <EmailLayout
      sign={<Sign
        name={moderator.name}
        avatarUrl={moderator.image}
        title={moderator.title}
      />}
    >
      <Preview>
        Zostałeś dodany do kręgu {circle.name}
        {moderator.name ? ` przez moderatora ${moderator.name}` : ""} – zaloguj
        się, by potwierdzić
      </Preview>

      <Header title={`Dołączenie do kręgu ${circle.name}`} />

      <Section>
        <Text style={emailStyles.paragraph}>Cześć {member.name},</Text>

        <Text style={emailStyles.paragraph}>
          Moderator{" "}
          {moderator.name ? <strong>{moderator.name}</strong> : "kręgu"} dodał
          Cię do kręgu <strong>{circle.name}</strong>. <br/>
          Aby dołączyć, musisz potwierdzić swoją decyzję.
        </Text>

        <Text style={emailStyles.paragraph}>
          Zaloguj się, aby potwierdzić lub odrzucić zaproszenie:
        </Text>

        {/* <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Button href={loginUrl} style={{ backgroundColor: "#2563eb" }}>
            Zaloguj się
          </Button>
        </div> */}
      </Section>
    </EmailLayout>
  );
}

// --- Podgląd ---
export default function MemberInvitationEmailPreview() {
  return (
    <MembershipInvitationEmail
      member={{ name: "Joshamee Gibbs" }}
      circle={{ name: "Załoga Czarnej Perły" }}
      moderator={{
        name: "Jack Sparrow",
        image: "https://64.media.tumblr.com/3672496ce48a790ce8f4c9e91aa7514e/1f95141d41c796f7-b4/s1280x1920/611b74e54c44c3b7f31b7bbbe0118ba4d0e7edf9.jpg",
        title: "Kapitan",
      }}
      //loginUrl="https://example.com/login"
    />
  );
}
