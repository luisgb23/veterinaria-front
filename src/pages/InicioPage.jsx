import { Anchor, Card, Group, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconCalendarEvent, IconPaw, IconStethoscope, IconUsers } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { consultasApi, mascotasApi, propietariosApi, vacunasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { DataTable, PageHeader } from '../components/common';
import VencimientosTable from '../components/VencimientosTable';
import { fecha, nombrePropietario } from '../utils/format';

function Indicador({ titulo, valor, icono: Icono, color, to }) {
  return (
    <Card withBorder padding="lg" component={Link} to={to} style={{ textDecoration: 'none' }}>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {titulo}
          </Text>
          <Text fw={700} fz={28} mt={4}>
            {valor ?? '—'}
          </Text>
        </div>
        <ThemeIcon color={color} variant="light" size={48} radius="md">
          <Icono size={26} stroke={1.6} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

function Seccion({ titulo, link, children, ...props }) {
  return (
    <Card withBorder padding="lg" {...props}>
      <Group justify="space-between" mb="sm">
        <Title order={4}>{titulo}</Title>
        {link && (
          <Anchor component={Link} to={link.to} size="sm">
            {link.label}
          </Anchor>
        )}
      </Group>
      {children}
    </Card>
  );
}

/** Usa per_page=1 para obtener solo el total de un listado. */
const total = (respuesta) => respuesta?.meta?.pagination?.total;

export default function InicioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inicioMes = dayjs().startOf('month').format('YYYY-MM-DD');

  const mascotas = useQuery({ queryKey: ['mascotas', 'total'], queryFn: () => mascotasApi.list({ per_page: 1 }) });
  const propietarios = useQuery({ queryKey: ['propietarios', 'total'], queryFn: () => propietariosApi.list({ per_page: 1 }) });
  const consultasMes = useQuery({
    queryKey: ['consultas', 'mes', inicioMes],
    queryFn: () => consultasApi.list({ desde: inicioMes, per_page: 1 }),
  });
  const vencidas = useQuery({
    queryKey: ['vacunas', 'inicio', 'vencidas'],
    queryFn: () => vacunasApi.vencimientos({ filtro: 'vencidas', per_page: 8 }),
  });
  const proximas = useQuery({
    queryKey: ['vacunas', 'inicio', 'proximas'],
    queryFn: () => vacunasApi.vencimientos({ filtro: 'proximas', dias: 30, per_page: 8 }),
  });
  const ultimas = useQuery({ queryKey: ['consultas', 'ultimas'], queryFn: () => consultasApi.list({ per_page: 6 }) });

  const nombre = user?.nombre?.split(' ')[0] ?? '';

  return (
    <>
      <PageHeader title={`Hola${nombre ? `, ${nombre}` : ''}`} description={dayjs().format('dddd D [de] MMMM [de] YYYY')} />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="lg">
        <Indicador titulo="Mascotas" valor={total(mascotas.data)} icono={IconPaw} color="teal" to="/mascotas" />
        <Indicador titulo="Propietarios" valor={total(propietarios.data)} icono={IconUsers} color="blue" to="/propietarios" />
        <Indicador titulo="Consultas este mes" valor={total(consultasMes.data)} icono={IconStethoscope} color="grape" to="/consultas" />
        <Indicador titulo="Vacunas vencidas" valor={total(vencidas.data)} icono={IconAlertTriangle} color="red" to="/vacunas" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Seccion titulo="Vacunas vencidas" link={{ to: '/vacunas', label: 'Ver todas' }}>
          <VencimientosTable
            rows={vencidas.data?.data ?? []}
            loading={vencidas.isLoading}
            empty="No hay vacunas vencidas."
          />
        </Seccion>

        <Seccion titulo="Vencen en los próximos 30 días" link={{ to: '/vacunas', label: 'Ver todas' }}>
          <VencimientosTable
            rows={proximas.data?.data ?? []}
            loading={proximas.isLoading}
            empty="No hay vacunas por vencer este mes."
          />
        </Seccion>
      </SimpleGrid>

      <Seccion mt="lg" titulo="Últimas consultas" link={{ to: '/consultas', label: 'Ver historial' }}>
        <DataTable
          rows={ultimas.data?.data ?? []}
          loading={ultimas.isLoading}
          onRowClick={(c) => navigate(`/consultas/${c.id}`)}
          empty="Todavía no hay consultas."
          columns={[
            { key: 'fecha', label: 'Fecha', width: 110, render: (c) => fecha(c.fecha) },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'propietario', label: 'Propietario', render: (c) => nombrePropietario(c.propietario_nombre, c.propietario_apellido) },
            { key: 'motivo', label: 'Motivo' },
          ]}
        />
      </Seccion>

      <Group mt="lg" gap="xs" c="dimmed">
        <IconCalendarEvent size={16} />
        <Text size="xs">Los vencimientos muestran la última vacuna registrada de cada mascota.</Text>
      </Group>
    </>
  );
}
