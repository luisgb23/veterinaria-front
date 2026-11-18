import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Image,
  Menu,
  NavLink,
  ScrollArea,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCash,
  IconCategory,
  IconChevronRight,
  IconHome,
  IconKey,
  IconLogout,
  IconMoon,
  IconPaw,
  IconStethoscope,
  IconSun,
  IconUserShield,
  IconUsers,
  IconVaccine,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CambiarPasswordModal from './CambiarPasswordModal';

const LINKS = [
  { to: '/', label: 'Inicio', icon: IconHome },
  { to: '/propietarios', label: 'Propietarios', icon: IconUsers },
  { to: '/mascotas', label: 'Mascotas', icon: IconPaw },
  { to: '/consultas', label: 'Consultas', icon: IconStethoscope },
  { to: '/vacunas', label: 'Vacunas', icon: IconVaccine },
  { to: '/cuotas', label: 'Cuotas', icon: IconCash },
  { to: '/especies', label: 'Especies', icon: IconCategory },
  { to: '/usuarios', label: 'Usuarios', icon: IconUserShield, adminOnly: true },
];

function estaActivo(pathname, to) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Estructura de la app: menú lateral fijo a la izquierda y el contenido a la derecha.
 * En celulares el menú se oculta y se abre con el botón de hamburguesa.
 */
export default function Layout() {
  const [abierto, { toggle, close }] = useDisclosure(false);
  const [passwordAbierto, passwordModal] = useDisclosure(false);
  const { user, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const { setColorScheme } = useMantineColorScheme();
  const esquema = useComputedColorScheme('light');

  const iniciales = (user?.nombre ?? '?')
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppShell navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !abierto } }} padding="lg">
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group justify="space-between" mb="lg" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Image src="/logo.png" alt="" h={36} w="auto" fit="contain" />
              <div>
                <Text fw={700} size="sm" lh={1.2}>
                  Veterinaria Itapebí
                </Text>
                <Text size="xs" c="dimmed">
                  Historia clínica
                </Text>
              </div>
            </Group>
            <Burger opened={abierto} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Cerrar menú" />
          </Group>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          {LINKS.filter((link) => !link.adminOnly || isAdmin).map((link) => (
            <NavLink
              key={link.to}
              component={Link}
              to={link.to}
              label={link.label}
              leftSection={<link.icon size={20} stroke={1.6} />}
              active={estaActivo(pathname, link.to)}
              onClick={close}
              variant="light"
              mb={4}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed">
              Tema
            </Text>
            <Tooltip label={esquema === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                variant="default"
                onClick={() => setColorScheme(esquema === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar tema"
              >
                {esquema === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          <Menu position="top-start" width={220} withArrow>
            <Menu.Target>
              <UnstyledButton
                w="100%"
                p="xs"
                style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-default-border)' }}
              >
                <Group wrap="nowrap" gap="sm">
                  <Avatar color="teal" radius="xl" size="md">
                    {iniciales}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {user?.nombre}
                    </Text>
                    <Group gap={4}>
                      <Text size="xs" c="dimmed" truncate>
                        {user?.usuario}
                      </Text>
                      {isAdmin && (
                        <Badge size="xs" variant="light">
                          admin
                        </Badge>
                      )}
                    </Group>
                  </div>
                  <IconChevronRight size={16} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconKey size={16} />} onClick={passwordModal.open}>
                Cambiar contraseña
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={logout}>
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Solo en celulares: botón para abrir el menú lateral */}
        <Group hiddenFrom="sm" mb="md" gap="sm">
          <Burger opened={abierto} onClick={toggle} size="sm" aria-label="Abrir menú" />
          <Text fw={600}>Veterinaria Itapebí</Text>
        </Group>

        <Outlet />
      </AppShell.Main>

      <CambiarPasswordModal opened={passwordAbierto} onClose={passwordModal.close} />
    </AppShell>
  );
}
