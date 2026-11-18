import { NumberInput, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { MascotaSelect, mascotaSeleccionada } from '../selects';
import { cuotaDelMes, hoy } from '../../utils/format';
import FormActions from './FormActions';

export default function CuotaForm({ item, onSubmit, onCancel, loading, ocultarMascota = false }) {
  const form = useForm({
    initialValues: {
      mascota_id: item?.mascota_id ? String(item.mascota_id) : null,
      fecha: item?.fecha ?? hoy(),
      valor: item?.valor ?? '',
      observacion: item?.id ? (item.observacion ?? '') : cuotaDelMes(),
    },
    validate: {
      mascota_id: (v) => (v ? null : 'Elegí la mascota'),
      fecha: (v) => (v ? null : 'La fecha es obligatoria'),
      valor: (v) => (v === '' || v === null || Number(v) < 0 ? 'Ingresá un valor mayor o igual a 0' : null),
    },
  });

  const enviar = (values) => onSubmit({ ...values, mascota_id: Number(values.mascota_id), valor: Number(values.valor) });

  return (
    <form onSubmit={form.onSubmit(enviar)}>
      <Stack>
        {!ocultarMascota && (
          <MascotaSelect withAsterisk selected={mascotaSeleccionada(item)} {...form.getInputProps('mascota_id')} />
        )}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Fecha" type="date" withAsterisk {...form.getInputProps('fecha')} />
          <NumberInput
            label="Valor"
            prefix="$ "
            thousandSeparator="."
            decimalSeparator=","
            allowDecimal={false}
            allowNegative={false}
            withAsterisk
            {...form.getInputProps('valor')}
          />
        </SimpleGrid>
        <TextInput label="Observación" maxLength={255} {...form.getInputProps('observacion')} />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
