import { useState } from 'react';
import { Badge, Button, Card, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { usuariosApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, FormModal, PageHeader, RowActions, confirmarEliminar } from '../components/common';
import UsuarioForm from '../components/forms/UsuarioForm';
import { useEliminar, useGuardar } from '../hooks/useApi';
import { fecha } from '../utils/format';

/** Gestión de usuarios del sistema (solo admin). */
export default function UsuariosPage() {
  const { user } = useAuth();
  const [editando, setEditando] = useState(null);

  const listado = useQuery({ queryKey: ['usuarios'], queryFn: () => usuariosApi.list() });
  // La API devuelve también los dados de baja: se muestran solo los activos
  const activos = (listado.data?.data ?? []).filter((u) => u.activo);

  const guardar = useGuardar(usuariosApi, {
    mensajeCreado: 'Usuario creado.',
    mensajeActualizado: 'Usuario actualizado.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(usuariosApi, { mensaje: 'Usuario dado de baja.' });

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Personas que pueden ingresar al sistema"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Nuevo usuario
          </Button>
        }
      />

      <Card withBorder padding="lg" maw={900}>
        <DataTable
          rows={activos}
          loading={listado.isFetching}
          empty="No hay usuarios."
          minWidth={500}
          columns={[
            {
              key: 'nombre',
              label: 'Nombre',
              render: (u) => (
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {u.nombre}
                  </Text>
                  {u.id === user?.id && (
                    <Badge size="xs" variant="outline">
                      vos
                    </Badge>
                  )}
                </Group>
              ),
            },
            { key: 'usuario', label: 'Usuario' },
            {
              key: 'rol',
              label: 'Rol',
              render: (u) => (
                <Badge variant="light" color={u.rol === 'admin' ? 'teal' : 'gray'}>
                  {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              ),
            },
            { key: 'creado_en', label: 'Alta', render: (u) => fecha(u.creado_en) },
            {
              key: 'acciones',
              label: '',
              align: 'right',
              render: (u) => (
                <RowActions
                  onEdit={() => setEditando(u)}
                  onDelete={
                    u.id === user?.id
                      ? undefined
                      : () =>
                          confirmarEliminar({
                            titulo: 'Dar de baja usuario',
                            mensaje: `¿Dar de baja a ${u.nombre}? Ya no va a poder ingresar al sistema.`,
                            onConfirm: () => eliminar.mutate(u.id),
                          })
                  }
                />
              ),
            },
          ]}
        />
      </Card>

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar usuario' : 'Nuevo usuario'}>
        <UsuarioForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
