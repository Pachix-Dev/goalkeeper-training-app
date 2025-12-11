import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  name,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de Goalkeeper Training</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Restablece tu contraseña 🔐</Heading>
          <Text style={text}>Hola {name},</Text>
          <Text style={text}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en
            Goalkeeper Training.
          </Text>
          <Text style={text}>
            Haz clic en el siguiente botón para crear una nueva contraseña:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Restablecer contraseña
            </Button>
          </Section>
          <Text style={text}>
            O copia y pega este enlace en tu navegador:
          </Text>
          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>
          <Text style={warning}>
            <strong>Este enlace expirará en 1 hora.</strong>
          </Text>
          <Text style={footer}>
            Si no solicitaste restablecer tu contraseña, puedes ignorar este email
            de forma segura. Tu contraseña no será cambiada.
          </Text>
          <Text style={footer}>
            Saludos,
            <br />
            El equipo de Goalkeeper Training
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  padding: '0 40px',
};

const warning = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 40px',
};
