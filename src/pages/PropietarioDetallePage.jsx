import { useState } from 'react';
import { Alert, Anchor, Button, Card, Center, Group, Loader, SimpleGrid, Title } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mascotasApi, propietariosApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, Dato, FormModal, PageHeader, confirmarEliminar } from '../components/common';
import MascotaForm from '../components/forms/MascotaForm';
import PropietarioForm from '../components/forms/PropietarioForm';
import { useDetalle, useEliminar, useGuardar } from '../hooks/useApi';
import { fecha, fechaHora } from '../utils/format';

export default function PropietarioDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [editandoPropietario, setEditandoPropietario] = useState(false);
  const [nuevaMascota, setNuevaMascota] = useState(false);

  const detalle = useDetalle('propietarios', propietariosApi.get, id);
  const mascotas = useQuery({
    queryKey: ['mascotas', 'propietario', id],
    queryFn: () => propietariosApi.mascotas(id),
  });

  const guardarPropietario = useGuardar(propietariosApi, {
    mensajeActualizado: 'Propietario actualizado.',
    onSuccess: () => setEditandoPropietario(false),
  });
  const guardarMascota = useGuardar(mascotasApi, {
    mensajeCreado: 'Mascota creada.',
    onSuccess: () => setNuevaMascota(false),
  });
  const eliminar = useEliminar(propietariosApi, {
    mensaje: 'Propietario eliminado.',
    onSuccess: () => navigate('/propietarios'),
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
      <Alert color="red" title="No se encontró el propietario">
        <Anchor component={Link} to="/propietarios">
          Volver a propietarios
        </Anchor>
      </Alert>
    );
  }

  const p = detalle.data;

  return (
    <>
      <Anchor component={Link} to="/propietarios" size="sm" mb="xs" display="inline-flex" style={{ alignItems: 'center', gap: 4 }}>
        <IconArrowLeft size={14} /> Propietarios
      </Anchor>

      <PageHeader
        title={`${p.nombre} ${p.apellido}`}
        description={`Cliente desde ${fecha(p.creado_en)}`}
        actions={
          <>
            <Button variant="default" leftSection={<IconPencil size={18} />} onClick={() => setEditandoPropietario(true)}>
              Editar
            </Button>
            {isAdmin && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={18} />}
                onClick={() =>
                  confirmarEliminar({
                    titulo: 'Eliminar propietario',
                    mensaje: `¿Eliminar a ${p.nombre} ${p.apellido}?`,
                    onConfirm: () => eliminar.mutate(p.id),
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
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Dato label="Teléfono">{p.telefono && <Anchor href={`tel:${p.telefono}`}>{p.telefono}</Anchor>}</Dato>
          <Dato label="Email">{p.email && <Anchor href={`mailto:${p.email}`}>{p.email}</Anchor>}</Dato>
          <Dato label="Dirección">{p.direccion}</Dato>
          <Dato label="Última modificación">{p.modificado_en ? fechaHora(p.modificado_en) : null}</Dato>
        </SimpleGrid>
      </Card>

      <Card withBorder padding="lg">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Mascotas</Title>
          <Button size="xs" leftSection={<IconPlus size={16} />} onClick={() => setNuevaMascota(true)}>
            Nueva mascota
          </Button>
        </Group>
        <DataTable
          rows={mascotas.data ?? []}
          loading={mascotas.isLoading}
          onRowClick={(m) => navigate(`/mascotas/${m.id}`)}
          empty="Este propietario no tiene mascotas registradas."
          minWidth={400}
          columns={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'especie_nombre', label: 'Especie' },
            { key: 'edad_texto', label: 'Edad' },
            { key: 'fecha_nacimiento', label: 'Nacimiento', render: (m) => fecha(m.fecha_nacimiento) },
          ]}
        />
      </Card>

      <FormModal opened={editandoPropietario} onClose={() => setEditandoPropietario(false)} title="Editar propietario" size="lg">
        <PropietarioForm
          item={p}
          loading={guardarPropietario.isPending}
          onCancel={() => setEditandoPropietario(false)}
          onSubmit={(values) => guardarPropietario.mutate({ id: p.id, values })}
        />
      </FormModal>

      <FormModal opened={nuevaMascota} onClose={() => setNuevaMascota(false)} title={`Nueva mascota de ${p.nombre}`}>
        <MascotaForm
          item={{ propietario_id: p.id, propietario_nombre: p.nombre, propietario_apellido: p.apellido }}
          loading={guardarMascota.isPending}
          onCancel={() => setNuevaMascota(false)}
          onSubmit={(values) => guardarMascota.mutate({ values })}
        />
      </FormModal>
    </>
  );
}
