import { useState } from 'react';
import { Badge, Button, Card, Group, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPaperclip, IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { consultasApi } from '../api/resources';
import { DataTable, FormModal, PageHeader, PaginacionBar } from '../components/common';
import ConsultaForm from '../components/forms/ConsultaForm';
import { useGuardar, useListado } from '../hooks/useApi';
import { fecha, nombrePropietario } from '../utils/format';

export default function ConsultasPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [search] = useDebouncedValue(busqueda, 350);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [nueva, setNueva] = useState(false);

  const listado = useListado('consultas', consultasApi.list, { page, per_page: 15, search, desde, hasta });

  const guardar = useGuardar(consultasApi, {
    mensajeCreado: 'Consulta registrada. Ya podés adjuntar archivos.',
    onSuccess: (consulta) => navigate(`/consultas/${consulta.id}`),
  });

  const filtrar = (setter) => (e) => {
    setter(e.currentTarget.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Consultas"
        description="Historial clínico de todas las mascotas"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setNueva(true)}>
            Nueva consulta
          </Button>
        }
      />

      <Card withBorder padding="lg">
        <Group mb="md" align="flex-end">
          <TextInput
            label="Buscar"
            placeholder="Motivo, diagnóstico o mascota"
            leftSection={<IconSearch size={16} />}
            value={busqueda}
            onChange={filtrar(setBusqueda)}
            style={{ flex: 1, maxWidth: 380 }}
          />
          <TextInput label="Desde" type="date" value={desde} onChange={filtrar(setDesde)} />
          <TextInput label="Hasta" type="date" value={hasta} onChange={filtrar(setHasta)} />
          {(desde || hasta || busqueda) && (
            <Button
              variant="subtle"
              onClick={() => {
                setDesde('');
                setHasta('');
                setBusqueda('');
                setPage(1);
              }}
            >
              Limpiar
            </Button>
          )}
        </Group>

        <DataTable
          rows={listado.data?.data ?? []}
          loading={listado.isFetching}
          onRowClick={(c) => navigate(`/consultas/${c.id}`)}
          empty="No se encontraron consultas."
          minWidth={700}
          columns={[
            { key: 'fecha', label: 'Fecha', width: 110, render: (c) => fecha(c.fecha) },
            {
              key: 'mascota',
              label: 'Mascota',
              render: (c) => (
                <div>
                  <Text size="sm" fw={500}>
                    {c.mascota_nombre}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {c.especie_nombre}
                  </Text>
                </div>
              ),
            },
            { key: 'propietario', label: 'Propietario', render: (c) => nombrePropietario(c.propietario_nombre, c.propietario_apellido) },
            {
              key: 'motivo',
              label: 'Motivo',
              render: (c) => (
                <Text size="sm" lineClamp={2}>
                  {c.motivo}
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
      </Card>

      <FormModal opened={nueva} onClose={() => setNueva(false)} title="Nueva consulta" size="lg">
        <ConsultaForm
          loading={guardar.isPending}
          onCancel={() => setNueva(false)}
          onSubmit={(values) => guardar.mutate({ values })}
        />
      </FormModal>
    </>
  );
}
