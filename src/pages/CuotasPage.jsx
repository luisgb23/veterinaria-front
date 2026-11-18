import { useState } from 'react';
import { Anchor, Button, Card, Group, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { cuotasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, FormModal, PageHeader, PaginacionBar, RowActions, confirmarEliminar } from '../components/common';
import CuotaForm from '../components/forms/CuotaForm';
import { useEliminar, useGuardar, useListado } from '../hooks/useApi';
import { dinero, fecha, nombrePropietario } from '../utils/format';

export default function CuotasPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [search] = useDebouncedValue(busqueda, 350);
  // Por defecto, el mes en curso
  const [desde, setDesde] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [hasta, setHasta] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [editando, setEditando] = useState(null);

  const listado = useListado('cuotas', cuotasApi.list, { page, per_page: 20, search, desde, hasta });

  const guardar = useGuardar(cuotasApi, {
    mensajeCreado: 'Cuota registrada.',
    mensajeActualizado: 'Cuota actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(cuotasApi, { mensaje: 'Cuota eliminada.' });

  const filtrar = (setter) => (e) => {
    setter(e.currentTarget.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Cuotas"
        description="Pagos registrados por mascota"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Registrar cuota
          </Button>
        }
      />

      <Card withBorder padding="lg">
        <Group mb="md" align="flex-end" justify="space-between">
          <Group align="flex-end">
            <TextInput
              label="Buscar"
              placeholder="Mascota, apellido u observación"
              leftSection={<IconSearch size={16} />}
              value={busqueda}
              onChange={filtrar(setBusqueda)}
              w={280}
            />
            <TextInput label="Desde" type="date" value={desde} onChange={filtrar(setDesde)} />
            <TextInput label="Hasta" type="date" value={hasta} onChange={filtrar(setHasta)} />
          </Group>
          <Card withBorder padding="sm" bg="var(--mantine-primary-color-light)">
            <Text size="xs" c="dimmed">
              Total del período
            </Text>
            <Text fw={700} size="xl">
              {dinero(listado.data?.meta?.suma_valor ?? 0)}
            </Text>
          </Card>
        </Group>

        <DataTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          empty="No hay cuotas en este período."
          minWidth={700}
          columns={[
            { key: 'fecha', label: 'Fecha', width: 110, render: (c) => fecha(c.fecha) },
            {
              key: 'mascota',
              label: 'Mascota',
              render: (c) => (
                <Anchor component={Link} to={`/mascotas/${c.mascota_id}`} size="sm">
                  {c.mascota_nombre}
                </Anchor>
              ),
            },
            { key: 'propietario', label: 'Propietario', render: (c) => nombrePropietario(c.propietario_nombre, c.propietario_apellido) },
            { key: 'observacion', label: 'Observación' },
            { key: 'valor', label: 'Valor', align: 'right', render: (c) => <strong>{dinero(c.valor)}</strong> },
            {
              key: 'acciones',
              label: '',
              align: 'right',
              render: (c) => (
                <RowActions
                  onEdit={() => setEditando(c)}
                  onDelete={
                    isAdmin
                      ? () =>
                          confirmarEliminar({
                            titulo: 'Eliminar cuota',
                            mensaje: `¿Eliminar la cuota de ${c.mascota_nombre} del ${fecha(c.fecha)} por ${dinero(c.valor)}?`,
                            onConfirm: () => eliminar.mutate(c.id),
                          })
                      : undefined
                  }
                />
              ),
            },
          ]}
        />

        <PaginacionBar meta={listado.data?.meta} page={page} onChange={setPage} />
      </Card>

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar cuota' : 'Registrar cuota'}>
        <CuotaForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
