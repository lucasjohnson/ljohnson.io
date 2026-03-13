import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactConfirmEmailProps {
  name: string;
  message: string;
}

export default function ContactConfirmEmail({ name, message }: ContactConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thanks for reaching out, {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={logo}>ljohnson.io</Heading>
            <Hr style={hr} />
            <Heading as="h2" style={heading}>
              Message Received
            </Heading>
            <Text style={paragraph}>
              Hi {name}, thanks for getting in touch. I&apos;ve received your
              message and will get back to you as soon as I can.
            </Text>
            <Hr style={hr} />
            <Section style={fieldGroup}>
              <Text style={label}>Your message</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>
          <Text style={footer}>
            This is an automated confirmation from ljohnson.io
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#fafafa",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: 560,
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #eaeaea",
  borderRadius: 8,
  padding: "32px 40px",
};

const logo: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#000000",
  letterSpacing: "-0.02em",
  margin: "0 0 20px 0",
};

const heading: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: "#000000",
  letterSpacing: "-0.02em",
  margin: "20px 0 24px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#eaeaea",
  borderTop: "1px solid #eaeaea",
  margin: "0",
};

const paragraph: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "24px",
  color: "#333333",
  margin: "0 0 16px 0",
};

const fieldGroup: React.CSSProperties = {
  padding: "16px 0 0 0",
};

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

const messageText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "24px",
  color: "#333333",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer: React.CSSProperties = {
  fontSize: 12,
  color: "#999999",
  textAlign: "center" as const,
  margin: "24px 0 0 0",
};
