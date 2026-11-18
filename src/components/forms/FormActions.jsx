import { Button, Group } from '@mantine/core';

/** Botones Cancelar / Guardar al pie de los formularios. */
export default function FormActions({ onCancel, loading, label = 'Guardar' }) {
  return (
    <Group justify="flex-end" mt="md">
      {onCancel && (
        <Button variant="default" onClick={onCancel}>
          Cancelar
        </Button>
      )}
      <Button type="submit" loading={loading}>
        {label}
      </Button>
    </Group>
  );
}
