# PROCESO — Sismora: fases de desarrollo

> Tabla viva. Cada fase se cierra con su criterio de "terminada" verificado, y se detiene para el **commit y push manual** del usuario.
> Estados: ⬜ pendiente · 🔄 en curso · ✅ hecha (verificada por el usuario) · 🟡 hecha sin verificar en entorno real
> Última actualización: 2026-10-15

## Resumen

| Fase | Nombre | PDF | Estado |
|---|---|---|---|
| 0 | Decisiones, repo, esqueleto y despliegue vacío | F0 + F1 | 🔄 Código y pruebas locales verificados; faltan CI y despliegue (ver checklist) |
| 1 | Identidad, roles y auditoría | F2 | ⬜ |
| 2 | Ingesta y catálogo de eventos (USGS) | F3 | ⬜ |
| 3 | Eventos, mapa y dashboard | F4 | ⬜ |
| 4 | Análisis estadístico, calidad de datos y datasets | F4 + F5 | ⬜ |
| 5 | Reglas y centro de alertas | F7 | ⬜ |
| 6 | Laboratorio ML y estimaciones experimentales | F6 | ⬜ |
| 7 | Reportes y administración | F8 | ⬜ |
| 8 | Endurecimiento, pruebas, backup y manuales | F9 | ⬜ |

Cambios frente al PDF: despliegue temprano (F0); Fases 4 y 5 del PDF se unen (análisis + calidad de datos); alertas antes que ML (D3).

## Protocolo de cada fase

1. **Inicio:** verificación cruzada de requisitos del PDF y de `CONTEXTO.md` contra los entregables; se anota qué entra y qué no.
2. **Desarrollo** con pruebas (backend contra PostgreSQL real; frontend con Vitest).
3. **Cierre:** correr toda la suite, `alembic check`, build del frontend; actualizar `CONTEXTO.md`, `PROCESO.md` y `DOCUMENTACION.md`.
4. **Exposición:** anotar en `EXPOSICION.md` las preguntas probables que surgieron en la fase.
5. **Alto:** resumen para el usuario (qué cambió, qué revisar, qué no se verificó). El usuario revisa, hace commit y push, y confirma.
6. Rama por fase (`fase-N-nombre`), PR hacia `main` (propuesta; confirmar).

## Detalle por fase

### Fase 0 — Decisiones, repo, esqueleto y despliegue vacío
- **Entregables:** decisiones D1–D9 cerradas (hecho); monorepo con `apps/web`, `services/api`, `services/ingestion`, `services/ml`, `database`, `infra`, `docs`; React+Vite+TS y FastAPI "hola mundo" con `/health`; PostgreSQL con Docker y primera migración; `.env.example`; CI básico; **despliegue en Vercel + Render funcionando**.
- **Terminada cuando:** el frontend desplegado muestra el estado de `/health` de la API desplegada, la API consulta la base, y el CI pasa en GitHub.
- **Riesgo:** Render gratuito duerme; documentar el arranque en frío.

### Fase 1 — Identidad, roles y auditoría
- **Entregables:** login con cookie HttpOnly + anti-CSRF; 5 roles; `require_roles`; matriz de permisos probada; auditoría de solo inserción (trigger); gestión básica de usuarios; manejo de errores uniforme; límite de intentos de login.
- **Terminada cuando:** la matriz de permisos pasa para todos los endpoints, un endpoint sin fila en la matriz hace fallar la suite, y `audit_logs` rechaza UPDATE/DELETE.

### Fase 2 — Ingesta y catálogo de eventos
- **Entregables:** adaptador USGS; normalización; deduplicación (`source_id + external_id`); sincronización incremental e idempotente; validación lat/lon; `ingestion_runs`; módulo Fuentes con sync manual autorizada; endpoint protegido para cron externo; zonas iniciales de Perú.
- **Terminada cuando:** repetir la ingesta no duplica registros, cada ejecución y error queda registrado, y hay datos reales cargados con procedencia.

### Fase 3 — Eventos, mapa y dashboard
- **Entregables:** tabla paginada con filtros; detalle con procedencia; mapa con agrupación y leyenda por magnitud; dashboard (KPIs, serie temporal, distribución, estado de fuentes); exportación básica CSV.
- **Terminada cuando:** dashboard, mapa y gráficas coinciden con las consultas de la API bajo los mismos filtros, y cada gráfica muestra unidad, periodo, filtros, tamaño de muestra, fuente y hora de actualización.

### Fase 4 — Análisis estadístico, calidad de datos y datasets
- **Entregables:** serie temporal, histograma, dispersión magnitud-profundidad, conteo por región; informe de calidad (nulos, duplicados, rangos); datasets versionados e inmutables; reglas de limpieza trazables; monitor de frescura de la fuente.
- **Terminada cuando:** un dataset publicado es reproducible (misma consulta y versión → mismo resultado) y el informe de calidad se genera.

### Fase 5 — Reglas y centro de alertas
- **Entregables:** constructor de reglas validado; **simulación retrospectiva**; aprobación humana; centro de alertas (pendiente/enviada/fallida/cancelada); deduplicación por evento+regla+canal; reintentos con backoff e idempotentes; canales app + correo; **acuse y escalamiento**; procedimiento de incidente enlazado; separación de alertas operativas y sísmicas.
- **Terminada cuando:** una regla de prueba dispara una alerta que se aprueba, se entrega, se acusa y queda en auditoría; reintentar no duplica.

### Fase 6 — Laboratorio ML y estimaciones experimentales
- **Entregables:** preparación de datos; target D2 (conteo semanal M≥4.5 por zona); baseline; regresión lineal simple/múltiple y un modelo adicional; partición temporal sin fuga de datos; registro de experimentos (semilla, versiones, métricas MAE/RMSE/R²); ficha del modelo; aprobación; estimaciones etiquetadas como experimentales con incertidumbre.
- **Terminada cuando:** los experimentos son reproducibles, se comparan contra el baseline en la misma partición, y ninguna estimación puede enviarse como alerta oficial.

### Fase 7 — Reportes y administración
- **Entregables:** reportes de eventos, calidad, modelos y alertas (CSV/XLSX/PDF según permisos); fecha de corte, filtros, fuente y solicitante; resumen ejecutivo periódico; configuración; retención.
- **Terminada cuando:** un reporte es reproducible y su descarga está autorizada por rol.

### Fase 8 — Endurecimiento, pruebas, backup y manuales
- **Entregables:** pruebas unitarias/integración/E2E; aceptación por rol; carga; accesibilidad; revisión de seguridad; **backup y restauración probados**; monitoreo; manual técnico y de operación; procedimiento de incidente; checklist de aceptación del MVP (PDF §14).
- **Entregable adicional:** `EXPOSICION.md` completo (caso de negocio, roles, guion, preguntas, lista "antes de exponer"), solo con cifras medidas.
- **Terminada cuando:** se cumplen los criterios de aceptación del MVP del PDF §14, verificados en el despliegue real.

## Checklist de la Fase 0 (estado al 2026-10-15)

| Criterio | Estado |
|---|---|
| Decisiones D1–D10 cerradas | ✅ |
| Monorepo con la estructura del PDF §5 | ✅ |
| API FastAPI con `/health` y `/health/ready`, errores uniformes, correlation ID, validación de configuración de producción | ✅ verificado: 16 pruebas pasan con PostgreSQL 18 real; `/health/ready` responde 200 con la base conectada |
| Migración 0001 (`system_settings`) y pruebas de subir/bajar/`alembic check` | ✅ verificado en el equipo: sube, baja, `alembic check` sin diferencias y migración aplicada a la base `sismora` |
| Web React+Vite+TS: layout, 14 rutas, estado del sistema, etiquetas de las 4 categorías | ✅ lint, 20 pruebas y build pasan |
| `.env.example`, `docker-compose`, `Dockerfile` | 🟡 escritos, **no ejecutados** (sin Docker en el equipo) |
| CI en GitHub Actions | 🟡 escrito, **no ejecutado** (se verifica al primer push) |
| `render.yaml` y `vercel.json` | 🟡 escritos, **no desplegados** |
| **Terminada cuando:** la web desplegada muestra el estado de la API desplegada, la API consulta la base y el CI pasa | ⬜ |

## Bitácora de cierres

| Fase | Fecha de cierre | Pruebas (back / front) | Verificado por el usuario | Commit |
|---|---|---|---|---|
| — | — | — | — | — |
