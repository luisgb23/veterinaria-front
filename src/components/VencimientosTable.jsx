import { Anchor, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { fecha, nombrePropietario } from '../utils/format';
import { DataTable, RowActions, VencimientoBadge } from './common';

/** Tabla de vacunas con su estado de vencimiento (inicio y pantalla de vacunas). */
export default function VencimientosTable({ rows, loading, onEdit, onDelete, empty }) {
  const columnas = [
    {
      key: 'mascota',
      label: 'Mascota',
      render: (v) => (
        <Anchor component={Link} to={`/mascotas/${v.mascota_id}`} fw={500}>
          {v.mascota_nombre}
        </Anchor>
      ),
    },
    { key: 'propietario', label: 'Propietario', render: (v) => nombrePropietario(v.propietario_nombre, v.propietario_apellido) },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (v) =>
        v.propietario_telefono ? (
          <Anchor href={`tel:${v.propietario_telefono}`} size="sm">
            {v.propietario_telefono}
          </Anchor>
        ) : (
          <Text c="dimmed" size="sm">—</Text>
        ),
    },
    { key: 'fecha_ingreso', label: 'Aplicada', render: (v) => fecha(v.fecha_ingreso) },
    { key: 'fecha_vencimiento', label: 'Vence', render: (v) => fecha(v.fecha_vencimiento) },
    { key: 'estado', label: 'Estado', render: (v) => <VencimientoBadge dias={v.dias_para_vencer} /> },
  ];

  if (onEdit || onDelete) {
    columnas.push({
      key: 'acciones',
      label: '',
      align: 'right',
      render: (v) => <RowActions onEdit={onEdit ? () => onEdit(v) : undefined} onDelete={onDelete ? () => onDelete(v) : undefined} />,
    });
  }

  return <DataTable columns={columnas} rows={rows} loading={loading} empty={empty} minWidth={750} />;
}
