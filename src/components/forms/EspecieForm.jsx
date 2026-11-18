import { Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormActions from './FormActions';

export default function EspecieForm({ item, onSubmit, onCancel, loading }) {
  const form = useForm({
    initialValues: { nombre: item?.nombre ?? '' },
    validate: {
      nombre: (v) => (v.trim() ? null : 'El nombre es obligatorio'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput label="Nombre" placeholder="Ej: Canino" maxLength={100} data-autofocus {...form.getInputProps('nombre')} />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
