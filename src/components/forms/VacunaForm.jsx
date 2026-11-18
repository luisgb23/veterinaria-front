import { Button, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { MascotaSelect, mascotaSeleccionada } from '../selects';
import { hoy } from '../../utils/format';
import FormActions from './FormActions';

export default function VacunaForm({ item, onSubmit, onCancel, loading, ocultarMascota = false }) {
  const form = useForm({
    initialValues: {
      mascota_id: item?.mascota_id ? String(item.mascota_id) : null,
      fecha_ingreso: item?.fecha_ingreso ?? hoy(),
      fecha_vencimiento: item?.fecha_vencimiento ?? dayjs().add(1, 'year').format('YYYY-MM-DD'),
    },
    validate: {
      mascota_id: (v) => (v ? null : 'Elegí la mascota'),
      fecha_ingreso: (v) => (v ? null : 'La fecha es obligatoria'),
      fecha_vencimiento: (v, values) => {
        if (!v) return 'La fecha de vencimiento es obligatoria';
        return v < values.fecha_ingreso ? 'No puede ser anterior a la aplicación' : null;
      },
    },
  });

  // Atajos: vencimiento a N meses de la fecha de aplicación
  const sumarMeses = (meses) =>
    form.setFieldValue('fecha_vencimiento', dayjs(form.values.fecha_ingreso || hoy()).add(meses, 'month').format('YYYY-MM-DD'));

  const enviar = (values) => onSubmit({ ...values, mascota_id: Number(values.mascota_id) });

  return (
    <form onSubmit={form.onSubmit(enviar)}>
      <Stack>
        {!ocultarMascota && (
          <MascotaSelect withAsterisk selected={mascotaSeleccionada(item)} {...form.getInputProps('mascota_id')} />
        )}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Fecha de aplicación" type="date" withAsterisk {...form.getInputProps('fecha_ingreso')} />
          <TextInput label="Vence" type="date" withAsterisk {...form.getInputProps('fecha_vencimiento')} />
        </SimpleGrid>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Vence en:
          </Text>
          {[6, 12].map((meses) => (
            <Button key={meses} size="compact-xs" variant="light" onClick={() => sumarMeses(meses)}>
              {meses === 12 ? '1 año' : `${meses} meses`}
            </Button>
          ))}
        </Group>
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
