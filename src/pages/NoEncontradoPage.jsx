import { Button, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function NoEncontradoPage() {
  return (
    <Stack align="center" py={80} gap="sm">
      <Title order={1} c="dimmed">
        404
      </Title>
      <Text>Esta página no existe.</Text>
      <Button component={Link} to="/" variant="light">
        Volver al inicio
      </Button>
    </Stack>
  );
}
