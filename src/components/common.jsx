import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPencil, IconTrash } from '@tabler/icons-react';

/** Título de página con descripción y botones a la derecha. */
export function PageHeader({ title, description, actions }) {
  return (
    <Group justify="space-between" align="flex-start" mb="lg" gap="sm">
      <div>
        <Title order={2}>{title}</Title>
        {description && (
          <Text c="dimmed" size="sm" mt={4}>
            {description}
          </Text>
        )}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}

/**
 * Tabla simple.
 * columns: [{ key, label, render?: (fila) => node, width?, align? }]
 */
export function DataTable({ columns, rows = [], loading = false, onRowClick, empty = 'No hay registros.', minWidth = 600 }) {
  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading && rows.length > 0} zIndex={10} overlayProps={{ blur: 1 }} />
      <Table.ScrollContainer minWidth={minWidth}>
        <Table striped highlightOnHover={Boolean(onRowClick)} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key} w={col.width} style={{ textAlign: col.align ?? 'left' }}>
                  {col.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <Table.Td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {loading && rows.length === 0 && (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      )}
      {!loading && rows.length === 0 && (
        <Text c="dimmed" ta="center" py="xl" size="sm">
          {empty}
        </Text>
      )}
    </Box>
  );
}

/** Paginación con el total de resultados. meta = respuesta.meta de la API. */
export function PaginacionBar({ meta, page, onChange }) {
  const pagination = meta?.pagination;
  if (!pagination) {
    return null;
  }

  return (
    <Group justify="space-between" mt="md">
      <Text size="sm" c="dimmed">
        {pagination.total} {pagination.total === 1 ? 'resultado' : 'resultados'}
      </Text>
      {pagination.total_pages > 1 && (
        <Pagination total={pagination.total_pages} value={page} onChange={onChange} size="sm" />
      )}
    </Group>
  );
}

/** Botones de editar y eliminar de una fila (no disparan el click de la fila). */
export function RowActions({ onEdit, onDelete }) {
  return (
    <Group gap={4} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
      {onEdit && (
        <Tooltip label="Editar">
          <ActionIcon variant="subtle" color="gray" onClick={onEdit} aria-label="Editar">
            <IconPencil size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip label="Eliminar">
          <ActionIcon variant="subtle" color="red" onClick={onDelete} aria-label="Eliminar">
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

/** Pide confirmación antes de eliminar. */
export function confirmarEliminar({ titulo, mensaje, onConfirm }) {
  modals.openConfirmModal({
    title: titulo,
    centered: true,
    children: <Text size="sm">{mensaje}</Text>,
    labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
    confirmProps: { color: 'red' },
    onConfirm,
  });
}

/** Modal para los formularios de alta y edición. */
export function FormModal({ opened, onClose, title, children, size = 'md' }) {
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>{title}</Text>} size={size} centered>
      {children}
    </Modal>
  );
}

/** Estado de una vacuna según los días que faltan para que venza. */
export function VencimientoBadge({ dias }) {
  if (dias === null || dias === undefined) {
    return <Badge color="gray" variant="light">Sin fecha</Badge>;
  }
  if (dias < 0) {
    const hace = Math.abs(dias);
    return (
      <Badge color="red" variant="light">
        Vencida hace {hace} {hace === 1 ? 'día' : 'días'}
      </Badge>
    );
  }
  if (dias === 0) {
    return <Badge color="orange" variant="light">Vence hoy</Badge>;
  }
  if (dias <= 30) {
    return (
      <Badge color="yellow" variant="light">
        Vence en {dias} {dias === 1 ? 'día' : 'días'}
      </Badge>
    );
  }
  return <Badge color="teal" variant="light">Vigente</Badge>;
}

/** Bloque de datos "Etiqueta: valor" para las fichas. */
export function Dato({ label, children }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="sm">{children || '—'}</Text>
    </Stack>
  );
}
