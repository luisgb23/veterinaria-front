import { useMemo, useState } from 'react';
import { Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { especiesApi, mascotasApi, propietariosApi } from '../api/resources';
import { nombrePropietario } from '../utils/format';

/**
 * Select con búsqueda en la API (para listas que pueden ser largas, como propietarios o mascotas).
 *
 * @param selected opción ya elegida { value, label } para mostrarla aunque no esté en los resultados
 */
function RemoteSelect({ queryKey, buscar, aOpcion, selected: seleccionInicial, onChange, ...props }) {
  // Opción elegida: la que vino de afuera (al editar) o la última que eligió el usuario
  const [elegida, setElegida] = useState(seleccionInicial ?? null);
  const selected = elegida;
  const [busqueda, setBusqueda] = useState(seleccionInicial?.label ?? '');
  const [termino] = useDebouncedValue(busqueda, 300);

  // Si el texto del campo es la opción elegida, no se filtra por él (mostraría solo esa)
  const filtro = termino === selected?.label ? '' : termino;

  const { data, isFetching } = useQuery({
    queryKey: [queryKey, 'select', filtro],
    queryFn: () => buscar({ search: filtro, per_page: 20 }),
  });

  const opciones = useMemo(() => {
    const lista = (data?.data ?? []).map(aOpcion);
    if (selected?.value && !lista.some((o) => o.value === selected.value)) {
      lista.unshift(selected);
    }
    return lista;
  }, [data, aOpcion, selected]);

  return (
    <Select
      searchable
      searchValue={busqueda}
      onSearchChange={setBusqueda}
      data={opciones}
      filter={({ options }) => options}
      nothingFoundMessage={isFetching ? 'Buscando...' : 'Sin resultados'}
      onChange={(value) => {
        setElegida(opciones.find((o) => o.value === value) ?? null);
        onChange?.(value);
      }}
      {...props}
    />
  );
}

const propietarioAOpcion = (p) => ({ value: String(p.id), label: nombrePropietario(p.nombre, p.apellido) });

export function PropietarioSelect({ selected, ...props }) {
  return (
    <RemoteSelect
      queryKey="propietarios"
      buscar={propietariosApi.list}
      aOpcion={propietarioAOpcion}
      selected={selected}
      label="Propietario"
      placeholder="Buscar por nombre o apellido"
      {...props}
    />
  );
}

const mascotaAOpcion = (m) => ({
  value: String(m.id),
  label: m.propietario_apellido ? `${m.nombre} (${m.propietario_apellido})` : m.nombre,
});

export function MascotaSelect({ selected, ...props }) {
  return (
    <RemoteSelect
      queryKey="mascotas"
      buscar={mascotasApi.list}
      aOpcion={mascotaAOpcion}
      selected={selected}
      label="Mascota"
      placeholder="Buscar por mascota o propietario"
      {...props}
    />
  );
}

/** Las especies son pocas: se cargan todas. */
export function EspecieSelect(props) {
  const { data } = useQuery({ queryKey: ['especies', 'todas'], queryFn: () => especiesApi.list() });
  const opciones = (data?.data ?? []).map((e) => ({ value: String(e.id), label: e.nombre }));

  return <Select label="Especie" placeholder="Elegí una especie" data={opciones} searchable {...props} />;
}

/** Arma la opción { value, label } a partir de un registro que trae mascota_id y mascota_nombre. */
export function mascotaSeleccionada(item) {
  if (!item?.mascota_id) {
    return null;
  }
  return mascotaAOpcion({ id: item.mascota_id, nombre: item.mascota_nombre, propietario_apellido: item.propietario_apellido });
}

export function propietarioSeleccionado(item) {
  if (!item?.propietario_id) {
    return null;
  }
  return propietarioAOpcion({ id: item.propietario_id, nombre: item.propietario_nombre, apellido: item.propietario_apellido });
}
