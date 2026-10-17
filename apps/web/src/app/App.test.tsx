import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import { crearQueryClient } from '../lib/queryClient'
import { App } from './App'
import { MODULOS } from './navigation'

const OK = {
  status: 'ok',
  version: '0.1.0',
  environment: 'local',
  database: { ok: true, latency_ms: 1.5 },
  server_time_utc: '2026-10-15T12:00:00+00:00',
}

function respuesta(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
}

function montar(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App queryClient={crearQueryClient()} />
    </MemoryRouter>,
  )
}

describe('navegación', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuesta(OK))
  })

  it('lista los 13 módulos del documento base más el estado del sistema', () => {
    expect(MODULOS).toHaveLength(14)
    montar()
    const menu = screen.getByRole('navigation', { name: 'Módulos' })
    expect(menu.querySelectorAll('a')).toHaveLength(14)
  })

  it.each(MODULOS.filter((m) => m.ruta !== '/'))('$etiqueta indica la fase en que se construye', ({ ruta, etiqueta, fase }) => {
    montar(ruta)
    expect(screen.getByRole('heading', { level: 1, name: etiqueta })).toBeInTheDocument()
    expect(screen.getByText(`fase ${fase}`)).toBeInTheDocument()
  })

  it('una dirección desconocida no rompe la aplicación', () => {
    montar('/inexistente')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('el menú móvil se abre y se cierra', async () => {
    montar()
    const boton = screen.getByRole('button', { name: 'Menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(boton)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('estado del sistema', () => {
  it('muestra la API y la base de datos conectadas', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuesta(OK))
    montar()
    expect(await screen.findByText('Todo en orden')).toBeInTheDocument()
    expect(screen.getByText('conectada, 1.5 ms')).toBeInTheDocument()
  })

  it('muestra "degradado" cuando la base no responde (503 con cuerpo válido)', async () => {
    const caida = { ...OK, status: 'degraded', database: { ok: false, latency_ms: null } }
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuesta(caida, 503))
    montar()
    expect(await screen.findByText(/Degradado/)).toBeInTheDocument()
    expect(screen.getByText('sin conexión')).toBeInTheDocument()
  })

  it('avisa con un mensaje claro cuando la API no responde', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fallo de red'))
    montar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar la API.')
  })

  it('muestra las cuatro etiquetas que distinguen observado, pendiente, experimental y oficial', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuesta(OK))
    montar()
    for (const t of ['Evento observado', 'Pendiente de validación', 'Estimación experimental', 'Comunicado oficial']) {
      expect(await screen.findByText(t)).toBeInTheDocument()
    }
  })
})
