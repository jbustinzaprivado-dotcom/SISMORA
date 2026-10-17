import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Routes } from 'react-router-dom'

import { crearQueryClient } from '../lib/queryClient'
import { EstadoPage } from '../modules/estado/EstadoPage'
import { ModuloPendiente } from '../modules/pendiente/ModuloPendiente'
import { AppLayout } from './layout/AppLayout'
import { MODULOS } from './navigation'

export function App({ queryClient = crearQueryClient() }: { queryClient?: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<EstadoPage />} />
          {MODULOS.filter((m) => m.ruta !== '/').map((m) => (
            <Route key={m.ruta} path={m.ruta} element={<ModuloPendiente />} />
          ))}
          <Route path="*" element={<ModuloPendiente />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}
