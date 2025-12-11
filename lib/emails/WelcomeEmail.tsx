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

interface WelcomeEmailProps {
  name: string;
  email: string;
  verificationUrl: string;
}

export default function WelcomeEmail({
  name,
  email,
  verificationUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Goalkeeper Training - Verifica tu cuenta</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Bienvenido a Goalkeeper Training! 🥅</Heading>
          <Text style={text}>Hola {name},</Text>
          <Text style={text}>
            Gracias por registrarte en Goalkeeper Training, la plataforma profesional
            para entrenadores de porteros.
          </Text>
          <Text style={text}>
            Tu cuenta ha sido creada con el email: <strong>{email}</strong>
          </Text>
          <Text style={text}>
            Para comenzar a usar todas las funcionalidades, por favor verifica tu
            cuenta haciendo clic en el siguiente botón:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verificar mi cuenta
            </Button>
          </Section>
          <Text style={text}>
            O copia y pega este enlace en tu navegador:
          </Text>
          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>
          <Text style={footer}>
            Si no creaste esta cuenta, puedes ignorar este email de forma segura.
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

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 40px',
};
