import { useQuery } from '@tanstack/react-query'

import { EtiquetaDato } from '../../components/EtiquetaDato'
import { getReadiness } from '../../services/health'

function Fila({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-borde py-2 text-sm last:border-b-0">
      <dt className="text-texto-suave">{nombre}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  )
}

export function EstadoPage() {
  const { data, error, isPending, refetch, isFetching } = useQuery({
    queryKey: ['health', 'ready'],
    queryFn: ({ signal }) => getReadiness(signal),
    retry: false,
    refetchInterval: 30_000,
  })

  return (
    <section aria-labelledby="titulo-estado" className="max-w-2xl">
      <h1 id="titulo-estado" className="text-xl font-semibold">
        Estado del sistema
      </h1>
      <p className="mt-1 text-sm text-texto-suave">Comprueba que la interfaz, la API y la base de datos están conectadas.</p>

      <div className="mt-4 rounded-lg border border-borde bg-superficie p-4" aria-live="polite">
        {isPending && <p>Consultando la API…</p>}
        {error && (
          <div role="alert">
            <p className="font-medium">No se pudo consultar la API.</p>
            <p className="mt-1 text-sm text-texto-suave">
              {error.message} Si la API está en un plan gratuito, puede tardar en despertar: intenta de nuevo en un minuto.
            </p>
          </div>
        )}
        {data && (
          <>
            <p className="mb-2 font-medium">
              {data.status === 'ok' ? 'Todo en orden' : 'Degradado: la base de datos no responde'}
            </p>
            <dl>
              <Fila nombre="API" valor={`versión ${data.version} (${data.environment})`} />
              <Fila
                nombre="Base de datos"
                valor={data.database.ok ? `conectada, ${data.database.latency_ms} ms` : 'sin conexión'}
              />
              <Fila nombre="Hora del servidor (UTC)" valor={data.server_time_utc} />
            </dl>
          </>
        )}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-3 rounded bg-cian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cian-500 disabled:opacity-60"
        >
          {isFetching ? 'Consultando…' : 'Volver a consultar'}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-borde bg-superficie p-4">
        <h2 className="text-sm font-semibold">Cómo se distinguen los datos</h2>
        <p className="mt-1 text-sm text-texto-suave">
          Sismora nunca presenta una estimación como alerta oficial. Estas etiquetas acompañarán a cada dato:
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li><EtiquetaDato tipo="observado" /></li>
          <li><EtiquetaDato tipo="pendiente" /></li>
          <li><EtiquetaDato tipo="experimental" /></li>
          <li><EtiquetaDato tipo="oficial" /></li>
        </ul>
      </div>
    </section>
  )
}
