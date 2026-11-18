import { useState } from 'react';
import { Button, Card, Group, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { mascotasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, FormModal, PageHeader, PaginacionBar, RowActions, confirmarEliminar } from '../components/common';
import MascotaForm from '../components/forms/MascotaForm';
import { EspecieSelect } from '../components/selects';
import { useEliminar, useGuardar, useListado } from '../hooks/useApi';
import { nombrePropietario } from '../utils/format';

export default function MascotasPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [search] = useDebouncedValue(busqueda, 350);
  const [especieId, setEspecieId] = useState(null);
  const [editando, setEditando] = useState(null);

  const listado = useListado('mascotas', mascotasApi.list, { page, per_page: 15, search, especie_id: especieId });

  const guardar = useGuardar(mascotasApi, {
    mensajeCreado: 'Mascota creada.',
    mensajeActualizado: 'Mascota actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(mascotasApi, { mensaje: 'Mascota eliminada.' });

  return (
    <>
      <PageHeader
        title="Mascotas"
        description="Pacientes de la veterinaria"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Nueva mascota
          </Button>
        }
      />

      <Card withBorder padding="lg">
        <Group mb="md" align="flex-end">
          <TextInput
            placeholder="Buscar por mascota o propietario"
            leftSection={<IconSearch size={16} />}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            style={{ flex: 1, maxWidth: 420 }}
          />
          <EspecieSelect
            label={null}
            placeholder="Todas las especies"
            clearable
            value={especieId}
            onChange={(v) => {
              setEspecieId(v);
              setPage(1);
            }}
            w={220}
          />
        </Group>

        <DataTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          onRowClick={(m) => navigate(`/mascotas/${m.id}`)}
          empty={search || especieId ? 'No se encontraron mascotas.' : 'Todavía no hay mascotas.'}
          columns={[
            { key: 'nombre', label: 'Nombre', render: (m) => <strong>{m.nombre}</strong> },
            { key: 'especie_nombre', label: 'Especie' },
            { key: 'edad_texto', label: 'Edad' },
            { key: 'propietario', label: 'Propietario', render: (m) => nombrePropietario(m.propietario_nombre, m.propietario_apellido) },
            { key: 'propietario_telefono', label: 'Teléfono' },
            {
              key: 'acciones',
              label: '',
              align: 'right',
              render: (m) => (
                <RowActions
                  onEdit={() => setEditando(m)}
                  onDelete={
                    isAdmin
                      ? () =>
                          confirmarEliminar({
                            titulo: 'Eliminar mascota',
                            mensaje: `¿Eliminar a ${m.nombre}? Su historia clínica se conserva en la base, pero deja de verse.`,
                            onConfirm: () => eliminar.mutate(m.id),
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

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar mascota' : 'Nueva mascota'}>
        <MascotaForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
