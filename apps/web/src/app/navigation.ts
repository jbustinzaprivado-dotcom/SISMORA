/** Los 13 módulos del documento base (§6) más el estado del sistema. `fase` indica cuándo se construye (PROCESO.md). */
export interface ModuloNav {
  ruta: string
  etiqueta: string
  fase: number
  descripcion: string
}

export const MODULOS: ModuloNav[] = [
  { ruta: '/', etiqueta: 'Estado del sistema', fase: 0, descripcion: 'Estado de la API y de la base de datos.' },
  { ruta: '/dashboard', etiqueta: 'Dashboard', fase: 3, descripcion: 'KPIs, serie temporal, distribución por magnitud y estado de fuentes.' },
  { ruta: '/eventos', etiqueta: 'Eventos sísmicos', fase: 3, descripcion: 'Tabla paginada con filtros y ficha con procedencia.' },
  { ruta: '/mapa', etiqueta: 'Mapa sísmico', fase: 3, descripcion: 'Exploración espacial con agrupación de puntos y leyenda.' },
  { ruta: '/analisis', etiqueta: 'Análisis estadístico', fase: 4, descripcion: 'Series, histogramas, dispersión y conteo por región.' },
  { ruta: '/datos', etiqueta: 'Preparación de datos', fase: 4, descripcion: 'Calidad de datos y datasets versionados.' },
  { ruta: '/fuentes', etiqueta: 'Fuentes de datos', fase: 2, descripcion: 'Conectores, ejecuciones de ingesta y sincronización.' },
  { ruta: '/reglas', etiqueta: 'Reglas de alertas', fase: 5, descripcion: 'Constructor de reglas con simulación retrospectiva.' },
  { ruta: '/alertas', etiqueta: 'Centro de alertas', fase: 5, descripcion: 'Bandeja de alertas, aprobación, entrega y acuse.' },
  { ruta: '/modelos', etiqueta: 'Modelos de ML', fase: 6, descripcion: 'Experimentos, métricas y ficha de cada modelo.' },
  { ruta: '/estimaciones', etiqueta: 'Estimaciones experimentales', fase: 6, descripcion: 'Resultados exploratorios, siempre con incertidumbre.' },
  { ruta: '/reportes', etiqueta: 'Reportes', fase: 7, descripcion: 'Informes de eventos, calidad, modelos y alertas.' },
  { ruta: '/usuarios', etiqueta: 'Usuarios y roles', fase: 1, descripcion: 'Acceso por función con cinco roles.' },
  { ruta: '/auditoria', etiqueta: 'Auditoría y configuración', fase: 1, descripcion: 'Historial protegido y parámetros del sistema.' },
]
