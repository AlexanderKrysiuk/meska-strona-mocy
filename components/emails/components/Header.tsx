import { Text, Img, Section } from "@react-email/components";

interface HeaderProps {
  title?: string;
  logoUrl?: string;
}

export function Header({ title = "Męska Strona Mocy", logoUrl }: HeaderProps) {
  return (
    <Section style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      {logoUrl && <Img src={logoUrl} width={50} height={50} alt="Logo" style={{ marginRight: "10px" }} />}
      <Text style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</Text>
    </Section>
  );
}
