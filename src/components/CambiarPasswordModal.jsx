import { Button, Group, Modal, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { tokenStore } from '../api/client';
import { authApi } from '../api/resources';
import { notificarError, notificarExito } from '../utils/notify';

export default function CambiarPasswordModal({ opened, onClose }) {
  const form = useForm({
    initialValues: { actual: '', nueva: '', confirmar: '' },
    validate: {
      actual: (v) => (v ? null : 'Ingresá tu contraseña actual'),
      nueva: (v) => (v.length >= 8 ? null : 'Mínimo 8 caracteres'),
      confirmar: (v, values) => (v === values.nueva ? null : 'Las contraseñas no coinciden'),
    },
  });

  const cambiar = useMutation({
    mutationFn: (values) => authApi.cambiarPassword(values.actual, values.nueva),
    onSuccess: (data) => {
      // La API cierra las otras sesiones y devuelve tokens nuevos para esta
      tokenStore.set(data.tokens);
      notificarExito('Contraseña actualizada.');
      cerrar();
    },
    onError: (error) => notificarError(error, 'No se pudo cambiar la contraseña'),
  });

  function cerrar() {
    form.reset();
    onClose();
  }

  return (
    <Modal opened={opened} onClose={cerrar} title="Cambiar contraseña" centered>
      <form onSubmit={form.onSubmit((values) => cambiar.mutate(values))}>
        <Stack>
          <PasswordInput label="Contraseña actual" autoComplete="current-password" {...form.getInputProps('actual')} />
          <PasswordInput label="Contraseña nueva" autoComplete="new-password" {...form.getInputProps('nueva')} />
          <PasswordInput label="Repetir contraseña nueva" autoComplete="new-password" {...form.getInputProps('confirmar')} />
          <Group justify="flex-end">
            <Button variant="default" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" loading={cambiar.isPending}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
