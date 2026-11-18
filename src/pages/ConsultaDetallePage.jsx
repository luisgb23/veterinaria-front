import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Card,
  Center,
  FileButton,
  Grid,
  Group,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDots,
  IconDownload,
  IconEye,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { consultasApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { PageHeader, confirmarEliminar } from '../components/common';
import ConsultaForm from '../components/forms/ConsultaForm';
import { useDetalle, useEliminar, useGuardar } from '../hooks/useApi';
import { abrirArchivo } from '../utils/files';
import { fecha, fechaHora, nombrePropietario } from '../utils/format';
import { notificarError, notificarExito } from '../utils/notify';

const ACEPTADOS = 'application/pdf,image/jpeg,image/png,image/webp,image/gif';
const MAX_MB = 10;

function iconoArchivo(nombre) {
  return /\.pdf$/i.test(nombre) ? IconFileTypePdf : /\.(jpe?g|png|webp|gif)$/i.test(nombre) ? IconPhoto : IconFile;
}

/** Uno de los 3 lugares para adjuntar estudios, fotos o análisis. */
function ArchivoSlot({ consultaId, numero, archivo }) {
  const queryClient = useQueryClient();

  const subir = useMutation({
    mutationFn: (file) => consultasApi.subirArchivo(consultaId, numero, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      notificarExito('Archivo guardado.');
    },
    onError: (error) => notificarError(error, 'No se pudo subir el archivo'),
  });

  const quitar = useMutation({
    mutationFn: () => consultasApi.eliminarArchivo(consultaId, numero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      notificarExito('Archivo quitado.');
    },
    onError: (error) => notificarError(error, 'No se pudo quitar el archivo'),
  });

  const elegir = (file) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      notifications.show({ color: 'red', title: 'Archivo demasiado grande', message: `El máximo es ${MAX_MB} MB.` });
      return;
    }
    subir.mutate(file);
  };

  const Icono = archivo ? iconoArchivo(archivo.nombre) : IconUpload;
  const cargando = subir.isPending || quitar.isPending;

  return (
    <Paper withBorder p="sm" radius="md">
      <Group wrap="nowrap" justify="space-between">
        <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
          <ThemeIcon variant="light" color={archivo ? 'teal' : 'gray'} size="lg">
            <Icono size={20} />
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed">
              Archivo {numero}
            </Text>
            <Text size="sm" truncate maw={220} title={archivo?.nombre}>
              {archivo ? archivo.nombre : 'Vacío'}
            </Text>
          </div>
        </Group>

        {cargando ? (
          <Loader size="sm" />
        ) : archivo ? (
          <Group gap={4} wrap="nowrap">
            <Tooltip label="Ver">
              <ActionIcon
                variant="subtle"
                onClick={() => abrirArchivo(() => consultasApi.archivo(consultaId, numero), archivo.nombre)}
                aria-label="Ver archivo"
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
            {/* Fuera del menú: si el menú se cierra, el input del archivo desaparece antes de elegirlo */}
            <FileButton onChange={elegir} accept={ACEPTADOS}>
              {(props) => (
                <Tooltip label="Reemplazar">
                  <ActionIcon variant="subtle" color="gray" aria-label="Reemplazar archivo" {...props}>
                    <IconUpload size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
            </FileButton>
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="Más opciones">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconDownload size={16} />}
                  onClick={() => abrirArchivo(() => consultasApi.archivo(consultaId, numero), archivo.nombre, true)}
                >
                  Descargar
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() =>
                    confirmarEliminar({
                      titulo: 'Quitar archivo',
                      mensaje: `¿Quitar "${archivo.nombre}" de la consulta?`,
                      onConfirm: () => quitar.mutate(),
                    })
                  }
                >
                  Quitar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ) : (
          <FileButton onChange={elegir} accept={ACEPTADOS}>
            {(props) => (
              <Button size="xs" variant="light" leftSection={<IconUpload size={14} />} {...props}>
                Subir
              </Button>
            )}
          </FileButton>
        )}
      </Group>
    </Paper>
  );
}

export default function ConsultaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const detalle = useDetalle('consultas', consultasApi.get, id);
  const guardar = useGuardar(consultasApi, { mensajeActualizado: 'Consulta actualizada.' });
  const eliminar = useEliminar(consultasApi, {
    mensaje: 'Consulta eliminada.',
    onSuccess: () => navigate(detalle.data ? `/mascotas/${detalle.data.mascota_id}` : '/consultas'),
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
      <Alert color="red" title="No se encontró la consulta">
        <Anchor component={Link} to="/consultas">
          Volver a consultas
        </Anchor>
      </Alert>
    );
  }

  const c = detalle.data;
  const nombrePdf = `consulta_${c.id}_${c.mascota_nombre}.pdf`;
  const porNumero = Object.fromEntries(c.archivos.map((a) => [a.numero, a]));

  return (
    <>
      <Anchor
        component={Link}
        to={`/mascotas/${c.mascota_id}`}
        size="sm"
        mb="xs"
        display="inline-flex"
        style={{ alignItems: 'center', gap: 4 }}
      >
        <IconArrowLeft size={14} /> {c.mascota_nombre}
      </Anchor>

      <PageHeader
        title={`Consulta del ${fecha(c.fecha)}`}
        description={
          <>
            {c.mascota_nombre}
            {c.especie_nombre ? ` (${c.especie_nombre})` : ''}
            {c.mascota_edad ? ` · ${c.mascota_edad}` : ''} · Propietario:{' '}
            <Anchor component={Link} to={`/propietarios/${c.propietario_id}`} size="sm">
              {nombrePropietario(c.propietario_nombre, c.propietario_apellido)}
            </Anchor>
          </>
        }
        actions={
          <>
            <Button.Group>
              <Button
                variant="default"
                leftSection={<IconFileTypePdf size={18} />}
                onClick={() => abrirArchivo(() => consultasApi.pdf(c.id), nombrePdf)}
              >
                Ver PDF
              </Button>
              <Button variant="default" px="xs" onClick={() => abrirArchivo(() => consultasApi.pdf(c.id), nombrePdf, true)} aria-label="Descargar PDF">
                <IconDownload size={18} />
              </Button>
            </Button.Group>
            {isAdmin && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={18} />}
                onClick={() =>
                  confirmarEliminar({
                    titulo: 'Eliminar consulta',
                    mensaje: `¿Eliminar la consulta del ${fecha(c.fecha)} de ${c.mascota_nombre}?`,
                    onConfirm: () => eliminar.mutate(c.id),
                  })
                }
              >
                Eliminar
              </Button>
            )}
          </>
        }
      />

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Datos de la consulta
            </Title>
            {/* key: si la consulta cambia (otra id o se guardó), el formulario se reinicia con los datos nuevos */}
            <ConsultaForm
              key={`${c.id}-${c.modificado_en}`}
              item={c}
              loading={guardar.isPending}
              onSubmit={(values) => guardar.mutate({ id: c.id, values })}
              submitLabel="Guardar cambios"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg">
            <Title order={4} mb={4}>
              Archivos adjuntos
            </Title>
            <Text size="xs" c="dimmed" mb="md">
              Estudios, análisis o fotos. PDF o imagen, hasta {MAX_MB} MB.
            </Text>
            <Stack gap="sm">
              {[1, 2, 3].map((numero) => (
                <ArchivoSlot key={numero} consultaId={c.id} numero={numero} archivo={porNumero[numero]} />
              ))}
            </Stack>
          </Card>

          <Text size="xs" c="dimmed" mt="sm">
            Creada el {fechaHora(c.creado_en)}
            {c.modificado_en ? ` · modificada el ${fechaHora(c.modificado_en)}` : ''}
          </Text>
        </Grid.Col>
      </Grid>
    </>
  );
}
