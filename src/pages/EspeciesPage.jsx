import { useState } from 'react';
import { Button, Card } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { especiesApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, FormModal, PageHeader, RowActions, confirmarEliminar } from '../components/common';
import EspecieForm from '../components/forms/EspecieForm';
import { useEliminar, useGuardar } from '../hooks/useApi';
import { fecha } from '../utils/format';

export default function EspeciesPage() {
  const { isAdmin } = useAuth();
  const [editando, setEditando] = useState(null);

  // Misma clave que EspecieSelect: comparten el cache
  const listado = useQuery({ queryKey: ['especies', 'todas'], queryFn: () => especiesApi.list() });

  const guardar = useGuardar(especiesApi, {
    mensajeCreado: 'Especie creada.',
    mensajeActualizado: 'Especie actualizada.',
    onSuccess: () => setEditando(null),
  });
  const eliminar = useEliminar(especiesApi, { mensaje: 'Especie eliminada.' });

  return (
    <>
      <PageHeader
        title="Especies"
        description="Tipos de animales que atiende la veterinaria"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setEditando({})}>
            Nueva especie
          </Button>
        }
      />

      <Card withBorder padding="lg" maw={720}>
        <DataTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          empty="No hay especies cargadas."
          minWidth={360}
          columns={[
            { key: 'nombre', label: 'Nombre', render: (e) => <strong>{e.nombre}</strong> },
            { key: 'creado_en', label: 'Creada', render: (e) => fecha(e.creado_en) },
            {
              key: 'acciones',
              label: '',
              align: 'right',
              render: (e) => (
                <RowActions
                  onEdit={() => setEditando(e)}
                  onDelete={
                    isAdmin
                      ? () =>
                          confirmarEliminar({
                            titulo: 'Eliminar especie',
                            mensaje: `¿Eliminar "${e.nombre}"? Si hay mascotas de esta especie no se va a poder eliminar.`,
                            onConfirm: () => eliminar.mutate(e.id),
                          })
                      : undefined
                  }
                />
              ),
            },
          ]}
        />
      </Card>

      <FormModal opened={editando !== null} onClose={() => setEditando(null)} title={editando?.id ? 'Editar especie' : 'Nueva especie'} size="sm">
        <EspecieForm
          item={editando}
          loading={guardar.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={(values) => guardar.mutate({ id: editando?.id, values })}
        />
      </FormModal>
    </>
  );
}
