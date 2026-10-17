import { useLocation } from 'react-router-dom'

import { MODULOS } from '../../app/navigation'

/** Marcador de los módulos que aún no se construyen: dice en qué fase llegan, sin inventar contenido. */
export function ModuloPendiente() {
  const { pathname } = useLocation()
  const modulo = MODULOS.find((m) => m.ruta === pathname)
  return (
    <section aria-labelledby="titulo-modulo" className="max-w-2xl">
      <h1 id="titulo-modulo" className="text-xl font-semibold">
        {modulo?.etiqueta ?? 'Página no encontrada'}
      </h1>
      {modulo ? (
        <>
          <p className="mt-1 text-sm text-texto-suave">{modulo.descripcion}</p>
          <p className="mt-4 rounded-lg border border-dashed border-borde bg-superficie p-4 text-sm">
            Este módulo se construye en la <strong>fase {modulo.fase}</strong> del plan.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-texto-suave">La dirección no corresponde a ningún módulo.</p>
      )}
    </section>
  )
}
