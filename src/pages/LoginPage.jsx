import { useState } from 'react';
import { Alert, Button, Center, Image, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { mensajesDeError } from '../utils/notify';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const form = useForm({
    initialValues: { usuario: '', password: '' },
    validate: {
      usuario: (v) => (v.trim() ? null : 'Ingresá tu usuario'),
      password: (v) => (v ? null : 'Ingresá tu contraseña'),
    },
  });

  const destino = location.state?.from ?? '/';

  if (user) {
    return <Navigate to={destino} replace />;
  }

  const ingresar = async ({ usuario, password }) => {
    setError(null);
    setEnviando(true);
    try {
      await login(usuario.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError((await mensajesDeError(err)).join(' '));
      setEnviando(false);
    }
  };

  return (
    <Center mih="100vh" p="md" bg="var(--mantine-color-body)">
      <Paper withBorder shadow="sm" p="xl" radius="lg" w="100%" maw={400}>
        <Stack align="center" gap={4} mb="lg">
          <Image src="/logo.png" alt="Veterinaria Itapebí" h={64} w="auto" fit="contain" />
          <Title order={3} mt="sm">
            Veterinaria Itapebí
          </Title>
          <Text c="dimmed" size="sm">
            Ingresá para ver la historia clínica
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit(ingresar)}>
          <Stack>
            {error && (
              <Alert color="red" icon={<IconAlertCircle size={18} />} variant="light">
                {error}
              </Alert>
            )}
            <TextInput label="Usuario" autoComplete="username" autoFocus {...form.getInputProps('usuario')} />
            <PasswordInput label="Contraseña" autoComplete="current-password" {...form.getInputProps('password')} />
            <Button type="submit" fullWidth loading={enviando} mt="xs">
              Ingresar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
