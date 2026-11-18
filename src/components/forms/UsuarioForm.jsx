import { PasswordInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormActions from './FormActions';

export default function UsuarioForm({ item, onSubmit, onCancel, loading }) {
  const editando = Boolean(item?.id);

  const form = useForm({
    initialValues: {
      nombre: item?.nombre ?? '',
      usuario: item?.usuario ?? '',
      password: '',
      rol: item?.rol ?? 'user',
    },
    validate: {
      nombre: (v) => (v.trim() ? null : 'El nombre es obligatorio'),
      usuario: (v) => (editando || /^[A-Za-z0-9._-]{3,100}$/.test(v.trim()) ? null : 'De 3 a 100 caracteres: letras, números, punto, guion o guion bajo'),
      password: (v) => {
        if (editando && !v) return null;
        return v.length >= 8 ? null : 'Mínimo 8 caracteres';
      },
    },
  });

  const enviar = (values) => {
    const datos = { nombre: values.nombre, rol: values.rol };
    if (!editando) datos.usuario = values.usuario;
    if (values.password) datos.password = values.password;
    onSubmit(datos);
  };

  return (
    <form onSubmit={form.onSubmit(enviar)}>
      <Stack>
        <TextInput label="Nombre completo" maxLength={100} withAsterisk data-autofocus {...form.getInputProps('nombre')} />
        <TextInput label="Usuario" disabled={editando} withAsterisk={!editando} autoComplete="off" {...form.getInputProps('usuario')} />
        <PasswordInput
          label={editando ? 'Contraseña nueva' : 'Contraseña'}
          description={editando ? 'Dejala vacía para no cambiarla' : undefined}
          withAsterisk={!editando}
          autoComplete="new-password"
          {...form.getInputProps('password')}
        />
        <Select
          label="Rol"
          data={[
            { value: 'user', label: 'Usuario (no puede eliminar)' },
            { value: 'admin', label: 'Administrador' },
          ]}
          allowDeselect={false}
          {...form.getInputProps('rol')}
        />
      </Stack>
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
