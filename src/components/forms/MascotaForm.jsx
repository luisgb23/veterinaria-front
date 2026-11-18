import { SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EspecieSelect, PropietarioSelect, propietarioSeleccionado } from '../selects';
import { hoy } from '../../utils/format';
import FormActions from './FormActions';

/**
 * @param item mascota a editar, o datos iniciales al crear (ej: { propietario_id, propietario_nombre, ... })
 */
export default function MascotaForm({ item, onSubmit, onCancel, loading }) {
  const form = useForm({
    initialValues: {
      nombre: item?.nombre ?? '',
      especie_id: item?.especie_id ? String(item.especie_id) : null,
      propietario_id: item?.propietario_id ? String(item.propietario_id) : null,
      fecha_nacimiento: item?.fecha_nacimiento ?? '',
    },
    validate: {
      nombre: (v) => (v.trim() ? null : 'El nombre es obligatorio'),
      especie_id: (v) => (v ? null : 'Elegí la especie'),
      propietario_id: (v) => (v ? null : 'Elegí el propietario'),
      fecha_nacimiento: (v) => (v && v > hoy() ? 'No puede ser una fecha futura' : null),
    },
  });

  const enviar = (values) =>
    onSubmit({
      nombre: values.nombre,
      especie_id: Number(values.especie_id),
      propietario_id: Number(values.propietario_id),
      fecha_nacimiento: values.fecha_nacimiento || null,
    });

  return (
    <form onSubmit={form.onSubmit(enviar)}>
      <Stack>
        <TextInput label="Nombre" maxLength={100} withAsterisk data-autofocus {...form.getInputProps('nombre')} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <EspecieSelect withAsterisk {...form.getInputProps('especie_id')} />
          <TextInput label="Fecha de nacimiento" type="date" max={hoy()} {...form.getInputProps('fecha_nacimiento')} />
        </SimpleGrid>
        <PropietarioSelect withAsterisk selected={propietarioSeleccionado(item)} {...form.getInputProps('propietario_id')} />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
