import { SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { MascotaSelect, mascotaSeleccionada } from '../selects';
import { hoy } from '../../utils/format';
import FormActions from './FormActions';

/**
 * @param item consulta a editar, o datos iniciales al crear (ej: { mascota_id, mascota_nombre })
 * @param ocultarMascota true cuando la mascota ya está definida (desde su ficha)
 */
export default function ConsultaForm({ item, onSubmit, onCancel, loading, ocultarMascota = false, submitLabel }) {
  const form = useForm({
    initialValues: {
      fecha: item?.fecha ?? hoy(),
      mascota_id: item?.mascota_id ? String(item.mascota_id) : null,
      motivo: item?.motivo ?? '',
      diagnostico: item?.diagnostico ?? '',
      tratamiento: item?.tratamiento ?? '',
    },
    validate: {
      fecha: (v) => (v ? null : 'La fecha es obligatoria'),
      mascota_id: (v) => (v ? null : 'Elegí la mascota'),
      motivo: (v) => (v.trim() ? null : 'El motivo es obligatorio'),
    },
  });

  const enviar = (values) => onSubmit({ ...values, mascota_id: Number(values.mascota_id) });

  return (
    <form onSubmit={form.onSubmit(enviar)}>
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: ocultarMascota ? 1 : 2 }}>
          <TextInput label="Fecha" type="date" withAsterisk {...form.getInputProps('fecha')} />
          {!ocultarMascota && (
            <MascotaSelect withAsterisk selected={mascotaSeleccionada(item)} {...form.getInputProps('mascota_id')} />
          )}
        </SimpleGrid>
        <TextInput label="Motivo de consulta" maxLength={255} withAsterisk {...form.getInputProps('motivo')} />
        <Textarea label="Diagnóstico" autosize minRows={3} maxRows={12} {...form.getInputProps('diagnostico')} />
        <Textarea label="Tratamiento" autosize minRows={3} maxRows={12} {...form.getInputProps('tratamiento')} />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} label={submitLabel} />
    </form>
  );
}
