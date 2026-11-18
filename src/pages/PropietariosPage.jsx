import { useState } from 'react';
import { Anchor, Button, Card, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { propietariosApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, FormModal, PageHeader, PaginacionBar, RowActions, confirmarEliminar } from '../components/common';
import PropietarioForm from '../components/forms/PropietarioForm';
import { useEliminar, useGuardar, useListado } from '../hooks/useApi';
import { nombrePropietario } from '../utils/format';

export default function PropietariosPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [search] = useDebouncedValue(busqueda, 350);
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, objeto = editar

  const listado = useListado('propietarios', propietariosApi.list, { page, per_page: 15, search });

  const guardar = useGuardar(propietariosApi, {
    mensajeCreado: 'Propietario creado.',
    mensajeActualizado: 'Propietario actualizado.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(propietariosApi, { mensaje: 'Propietario eliminado.' });

  const pedirEliminar = (p) =>
    confirmarEliminar({
      titulo: 'Eliminar propietario',
      mensaje: `¿Eliminar a ${p.nombre} ${p.apellido}? Si tiene mascotas activas no se va a poder eliminar.`,
      onConfirm: () => eliminar.mutate(p.id),
    });

  return (
    <>
      <PageHeader
        title="Propietarios"
        description="Dueños de las mascotas y sus datos de contacto"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Nuevo propietario
          </Button>
        }
      />

      <Card withBorder padding="lg">
        <TextInput
          placeholder="Buscar por nombre, apellido, teléfono o email"
          leftSection={<IconSearch size={16} />}
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.currentTarget.value);
            setPage(1);
          }}
          mb="md"
          maw={420}
        />

        <DataTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          onRowClick={(p) => navigate(`/propietarios/${p.id}`)}
          empty={search ? 'No se encontraron propietarios.' : 'Todavía no hay propietarios.'}
          columns={[
            { key: 'nombre', label: 'Propietario', render: (p) => nombrePropietario(p.nombre, p.apellido) },
            {
              key: 'telefono',
              label: 'Teléfono',
              render: (p) =>
                p.telefono ? (
                  <Anchor href={`tel:${p.telefono}`} size="sm" onClick={(e) => e.stopPropagation()}>
                    {p.telefono}
                  </Anchor>
                ) : '—',
            },
            { key: 'email', label: 'Email' },
            { key: 'direccion', label: 'Dirección' },
            {
              key: 'acciones',
              label: '',
              align: 'right',
              render: (p) => (
                <RowActions onEdit={() => setEditando(p)} onDelete={isAdmin ? () => pedirEliminar(p) : undefined} />
              ),
            },
          ]}
        />

        <PaginacionBar meta={listado.data?.meta} page={page} onChange={setPage} />
      </Card>

      <FormModal
        opened={editando !== null}
        onClose={() => setEditando(null)}
        title={editando?.id ? 'Editar propietario' : 'Nuevo propietario'}
        size="lg"
      >
        <PropietarioForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
