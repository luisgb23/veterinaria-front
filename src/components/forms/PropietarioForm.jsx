import { SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormActions from './FormActions';

export default function PropietarioForm({ item, onSubmit, onCancel, loading }) {
  const form = useForm({
    initialValues: {
      nombre: item?.nombre ?? '',
      apellido: item?.apellido ?? '',
      telefono: item?.telefono ?? '',
      email: item?.email ?? '',
      direccion: item?.direccion ?? '',
    },
    validate: {
      nombre: (v) => (v.trim() ? null : 'El nombre es obligatorio'),
      apellido: (v) => (v.trim() ? null : 'El apellido es obligatorio'),
      telefono: (v) => {
        const limpio = v.replace(/[\s-]/g, '');
        return !limpio || /^\+?\d{6,10}$/.test(limpio) ? null : 'Entre 6 y 10 dígitos';
      },
      email: (v) => (!v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()) ? null : 'Email inválido'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Nombre" maxLength={100} withAsterisk data-autofocus {...form.getInputProps('nombre')} />
          <TextInput label="Apellido" maxLength={100} withAsterisk {...form.getInputProps('apellido')} />
          <TextInput label="Teléfono" placeholder="09X XXX XXX" {...form.getInputProps('telefono')} />
          <TextInput label="Email" type="email" maxLength={100} {...form.getInputProps('email')} />
        </SimpleGrid>
        <TextInput label="Dirección" maxLength={255} {...form.getInputProps('direccion')} />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
