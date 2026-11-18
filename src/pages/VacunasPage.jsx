import { useState } from 'react';
import { Button, Card, Group, NumberInput, SegmentedControl, Switch } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { vacunasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { FormModal, PageHeader, PaginacionBar, confirmarEliminar } from '../components/common';
import VacunaForm from '../components/forms/VacunaForm';
import VencimientosTable from '../components/VencimientosTable';
import { useEliminar, useGuardar, useListado } from '../hooks/useApi';
import { fecha } from '../utils/format';

/** Reemplaza a vencimientos.php: vacunas vencidas, próximas a vencer o todas. */
export default function VacunasPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('vencidas');
  const [dias, setDias] = useState(30);
  const [historico, setHistorico] = useState(false);
  const [editando, setEditando] = useState(null);

  const params = { page, per_page: 20, filtro, historico: historico ? 1 : undefined };
  if (filtro === 'proximas') {
    params.dias = dias || 0;
  }
  const listado = useListado('vacunas', vacunasApi.vencimientos, params);

  const guardar = useGuardar(vacunasApi, {
    mensajeCreado: 'Vacuna registrada.',
    mensajeActualizado: 'Vacuna actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(vacunasApi, { mensaje: 'Vacuna eliminada.' });

  return (
    <>
      <PageHeader
        title="Vacunas"
        description="Vencimientos de vacunas de las mascotas activas"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Registrar vacuna
          </Button>
        }
      />

      <Card withBorder padding="lg">
        <Group mb="md" align="center" gap="lg">
          <SegmentedControl
            value={filtro}
            onChange={(v) => {
              setFiltro(v);
              setPage(1);
            }}
            data={[
              { value: 'vencidas', label: 'Vencidas' },
              { value: 'proximas', label: 'Por vencer' },
              { value: 'todas', label: 'Todas' },
            ]}
          />
          {filtro === 'proximas' && (
            <NumberInput
              value={dias}
              onChange={(v) => {
                setDias(Number(v) || 0);
                setPage(1);
              }}
              min={0}
              max={3650}
              allowDecimal={false}
              suffix=" días"
              w={130}
              aria-label="Días"
            />
          )}
          <Switch
            checked={historico}
            onChange={(e) => {
              setHistorico(e.currentTarget.checked);
              setPage(1);
            }}
            label="Incluir vacunas anteriores (histórico)"
          />
        </Group>

        <VencimientosTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          empty={
            filtro === 'vencidas'
              ? 'No hay vacunas vencidas.'
              : filtro === 'proximas'
                ? `No hay vacunas que venzan en los próximos ${dias} días.`
                : 'No hay vacunas registradas.'
          }
          onEdit={(v) => setEditando(v)}
          onDelete={
            isAdmin
              ? (v) =>
                  confirmarEliminar({
                    titulo: 'Eliminar vacuna',
                    mensaje: `¿Eliminar la vacuna de ${v.mascota_nombre} aplicada el ${fecha(v.fecha_ingreso)}?`,
                    onConfirm: () => eliminar.mutate(v.id),
                  })
              : undefined
          }
        />

        <PaginacionBar meta={listado.data?.meta} page={page} onChange={setPage} />
      </Card>

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar vacuna' : 'Registrar vacuna'}>
        <VacunaForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
