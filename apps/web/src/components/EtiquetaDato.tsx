/**
 * Las cuatro categorías que nunca deben confundirse (PDF §13, CONTEXTO.md §2).
 * Cada una lleva texto explícito, no solo color: el color por sí solo no distingue ni comunica peligro.
 */
export type TipoDato = 'observado' | 'pendiente' | 'experimental' | 'oficial'

const TEXTOS: Record<TipoDato, { texto: string; ayuda: string }> = {
  observado: { texto: 'Evento observado', ayuda: 'Reportado por una fuente, con procedencia.' },
  pendiente: { texto: 'Pendiente de validación', ayuda: 'Aún no revisado por una persona o fuente adicional.' },
  experimental: { texto: 'Estimación experimental', ayuda: 'Resultado estadístico o de ML; no es una alerta oficial.' },
  oficial: { texto: 'Comunicado oficial', ayuda: 'Mensaje de una fuente oficial verificada, con enlace.' },
}

const ESTILOS: Record<TipoDato, string> = {
  observado: 'border-marino-700 bg-white text-marino-800',
  pendiente: 'border-dashed border-texto-suave bg-white text-texto-suave',
  experimental: 'border-cian-600 bg-cian-500/10 text-cian-600',
  oficial: 'border-marino-900 bg-marino-900 text-white',
}

export function EtiquetaDato({ tipo }: { tipo: TipoDato }) {
  const { texto, ayuda } = TEXTOS[tipo]
  return (
    <span title={ayuda} className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${ESTILOS[tipo]}`}>
      {texto}
    </span>
  )
}
