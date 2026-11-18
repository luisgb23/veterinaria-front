import { useState } from 'react';
import { Alert, Anchor, Badge, Button, Card, Center, Group, Loader, SimpleGrid, Tabs, Text } from '@mantine/core';
import {
  IconArrowLeft,
  IconCash,
  IconPaperclip,
  IconPencil,
  IconPlus,
  IconStethoscope,
  IconTrash,
  IconVaccine,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { consultasApi, cuotasApi, mascotasApi, vacunasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, Dato, FormModal, PageHeader, PaginacionBar, RowActions, VencimientoBadge, confirmarEliminar } from '../components/common';
import ConsultaForm from '../components/forms/ConsultaForm';
import CuotaForm from '../components/forms/CuotaForm';
import MascotaForm from '../components/forms/MascotaForm';
import VacunaForm from '../components/forms/VacunaForm';
import { useDetalle, useEliminar, useGuardar, useListado } from '../hooks/useApi';
import { dinero, fecha, nombrePropietario } from '../utils/format';

const POR_PAGINA = 10;

/** Historia clínica: consultas de la mascota. */
function ConsultasTab({ mascota }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [nueva, setNueva] = useState(false);

  const listado = useListado('consultas', consultasApi.list, { mascota_id: mascota.id, page, per_page: POR_PAGINA });
  const guardar = useGuardar(consultasApi, {
    mensajeCreado: 'Consulta registrada. Ya podés adjuntar archivos.',
    // Al crearla se abre su página para adjuntar estudios
    onSuccess: (consulta) => navigate(`/consultas/${consulta.id}`),
  });

  return (
    <>
      <Group justify="flex-end" mb="sm">
        <Button size="xs" leftSection={<IconPlus size={16} />} onClick={() => setNueva(true)}>
          Nueva consulta
        </Button>
      </Group>
      <DataTable
        rows={listado.data?.data ?? []}
        loading={listado.isFetching}
        onRowClick={(c) => navigate(`/consultas/${c.id}`)}
        empty="Sin consultas registradas."
        columns={[
          { key: 'fecha', label: 'Fecha', width: 110, render: (c) => fecha(c.fecha) },
          { key: 'motivo', label: 'Motivo' },
          {
            key: 'diagnostico',
            label: 'Diagnóstico',
            render: (c) => (
              <Text size="sm" lineClamp={2}>
                {c.diagnostico || '—'}
              </Text>
            ),
          },
          {
            key: 'archivos',
            label: 'Adjuntos',
            width: 90,
            render: (c) =>
              c.archivos.length > 0 ? (
                <Badge variant="light" leftSection={<IconPaperclip size={12} />}>
                  {c.archivos.length}
                </Badge>
              ) : null,
          },
        ]}
      />
      <PaginacionBar meta={listado.data?.meta} page={page} onChange={setPage} />

      <FormModal opened={nueva} onClose={() => setNueva(false)} title={`Nueva consulta de ${mascota.nombre}`} size="lg">
        <ConsultaForm
          item={{ mascota_id: mascota.id }}
          ocultarMascota
          loading={guardar.isPending}
          onCancel={() => setNueva(false)}
          onSubmit={(values) => guardar.mutate({ values })}
        />
      </FormModal>
    </>
  );
}

function VacunasTab({ mascota }) {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [editando, setEditando] = useState(null);

  const listado = useListado('vacunas', vacunasApi.list, { mascota_id: mascota.id, page, per_page: POR_PAGINA });
  const guardar = useGuardar(vacunasApi, {
    mensajeCreado: 'Vacuna registrada.',
    mensajeActualizado: 'Vacuna actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(vacunasApi, { mensaje: 'Vacuna eliminada.' });

  return (
    <>
      <Group justify="flex-end" mb="sm">
        <Button size="xs" leftSection={<IconPlus size={16} />} onClick={() => setEditando({ mascota_id: mascota.id })}>
          Registrar vacuna
        </Button>
      </Group>
      <DataTable
        rows={listado.data?.data ?? []}
        loading={listado.isFetching}
        empty="Sin vacunas registradas."
        minWidth={450}
        columns={[
          { key: 'fecha_ingreso', label: 'Aplicada', render: (v) => fecha(v.fecha_ingreso) },
          { key: 'fecha_vencimiento', label: 'Vence', render: (v) => fecha(v.fecha_vencimiento) },
          { key: 'estado', label: 'Estado', render: (v) => <VencimientoBadge dias={v.dias_para_vencer} /> },
          {
            key: 'acciones',
            label: '',
            align: 'right',
            render: (v) => (
              <RowActions
                onEdit={() => setEditando(v)}
                onDelete={
                  isAdmin
                    ? () =>
                        confirmarEliminar({
                          titulo: 'Eliminar vacuna',
                          mensaje: `¿Eliminar la vacuna aplicada el ${fecha(v.fecha_ingreso)}?`,
                          onConfirm: () => eliminar.mutate(v.id),
                        })
                    : undefined
                }
              />
            ),
          },
        ]}
      />
      <PaginacionBar meta={listado.data?.meta} page={page} onChange={setPage} />

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar vacuna' : 'Registrar vacuna'}>
        <VacunaForm
          item={editando}
          ocultarMascota
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}

function CuotasTab({ mascota }) {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [editando, setEditando] = useState(null);

  const listado = useListado('cuotas', cuotasApi.list, { mascota_id: mascota.id, page, per_page: POR_PAGINA });
  const guardar = useGuardar(cuotasApi, {
    mensajeCreado: 'Cuota registrada.',
    mensajeActualizado: 'Cuota actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(cuotasApi, { mensaje: 'Cuota eliminada.' });

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Text size="sm" c="dimmed">
          Total pagado: <strong>{dinero(listado.data?.meta?.suma_valor ?? 0)}</strong>
        </Text>
        <Button size="xs" leftSection={<IconPlus size={16} />} onClick={() => setEditando({ mascota_id: mascota.id })}>
          Registrar cuota
        </Button>
      </Group>
      <DataTable
        rows={listado.data?.data ?? []}
        loading={listado.isFetching}
        empty="Sin cuotas registradas."
        minWidth={450}
        columns={[
          { key: 'fecha', label: 'Fecha', render: (c) => fecha(c.fecha) },
          { key: 'observacion', label: 'Observación' },
          { key: 'valor', label: 'Valor', align: 'right', render: (c) => dinero(c.valor) },
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
                          mensaje: `¿Eliminar la cuota del ${fecha(c.fecha)} por ${dinero(c.valor)}?`,
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

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar cuota' : 'Registrar cuota'}>
        <CuotaForm
          item={editando}
          ocultarMascota
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}

export default function MascotaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [editando, setEditando] = useState(false);

  const detalle = useDetalle('mascotas', mascotasApi.get, id);
  const guardar = useGuardar(mascotasApi, {
    mensajeActualizado: 'Mascota actualizada.',
    onSuccess: () => setEditando(false),
  });
  const eliminar = useEliminar(mascotasApi, {
    mensaje: 'Mascota eliminada.',
    onSuccess: () => navigate('/mascotas'),
  });

  if (detalle.isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (detalle.isError) {
    return (
      <Alert color="red" title="No se encontró la mascota">
        <Anchor component={Link} to="/mascotas">
          Volver a mascotas
        </Anchor>
      </Alert>
    );
  }

  const m = detalle.data;

  return (
    <>
      <Anchor component={Link} to="/mascotas" size="sm" mb="xs" display="inline-flex" style={{ alignItems: 'center', gap: 4 }}>
        <IconArrowLeft size={14} /> Mascotas
      </Anchor>

      <PageHeader
        title={m.nombre}
        description={[m.especie_nombre, m.edad_texto].filter(Boolean).join(' · ')}
        actions={
          <>
            <Button variant="default" leftSection={<IconPencil size={18} />} onClick={() => setEditando(true)}>
              Editar
            </Button>
            {isAdmin && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={18} />}
                onClick={() =>
                  confirmarEliminar({
                    titulo: 'Eliminar mascota',
                    mensaje: `¿Eliminar a ${m.nombre}?`,
                    onConfirm: () => eliminar.mutate(m.id),
                  })
                }
              >
                Eliminar
              </Button>
            )}
          </>
        }
      />

      <Card withBorder padding="lg" mb="lg">
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
          <Dato label="Propietario">
            <Anchor component={Link} to={`/propietarios/${m.propietario_id}`}>
              {nombrePropietario(m.propietario_nombre, m.propietario_apellido)}
            </Anchor>
          </Dato>
          <Dato label="Teléfono">
            {m.propietario_telefono && <Anchor href={`tel:${m.propietario_telefono}`}>{m.propietario_telefono}</Anchor>}
          </Dato>
          <Dato label="Fecha de nacimiento">{m.fecha_nacimiento ? fecha(m.fecha_nacimiento) : null}</Dato>
          <Dato label="Registrada">{fecha(m.creado_en)}</Dato>
        </SimpleGrid>
      </Card>

      <Card withBorder padding="lg">
        <Tabs defaultValue="consultas" keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="consultas" leftSection={<IconStethoscope size={16} />}>
              Consultas
            </Tabs.Tab>
            <Tabs.Tab value="vacunas" leftSection={<IconVaccine size={16} />}>
              Vacunas
            </Tabs.Tab>
            <Tabs.Tab value="cuotas" leftSection={<IconCash size={16} />}>
              Cuotas
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="consultas">
            <ConsultasTab mascota={m} />
          </Tabs.Panel>
          <Tabs.Panel value="vacunas">
            <VacunasTab mascota={m} />
          </Tabs.Panel>
          <Tabs.Panel value="cuotas">
            <CuotasTab mascota={m} />
          </Tabs.Panel>
        </Tabs>
      </Card>

      <FormModal opened={editando} onClose={() => setEditando(false)} title="Editar mascota">
        <MascotaForm
          item={m}
          loading={guardar.isPending}
          onCancel={() => setEditando(false)}
          onSubmit={(values) => guardar.mutate({ id: m.id, values })}
        />
      </FormModal>
    </>
  );
}
