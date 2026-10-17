import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { MODULOS } from '../navigation'

export function AppLayout() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <header className="flex items-center justify-between bg-marino-900 px-4 py-3 text-white lg:hidden">
        <span className="font-semibold">Sismora</span>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((v) => !v)}
          className="rounded border border-white/40 px-3 py-1 text-sm"
        >
          {abierto ? 'Cerrar menú' : 'Menú'}
        </button>
      </header>

      <nav
        id="menu-principal"
        aria-label="Módulos"
        className={`${abierto ? 'block' : 'hidden'} overflow-y-auto bg-marino-900 px-3 py-4 text-white lg:block lg:w-64 lg:shrink-0`}
      >
        <p className="mb-4 hidden px-2 text-lg font-semibold lg:block">Sismora</p>
        <ul className="space-y-1">
          {MODULOS.map((m) => (
            <li key={m.ruta}>
              <NavLink
                to={m.ruta}
                end
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-marino-700 ${isActive ? 'bg-marino-700 font-medium' : ''}`
                }
              >
                <span>{m.etiqueta}</span>
                {m.fase > 0 && <span className="text-xs text-white/60">F{m.fase}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
