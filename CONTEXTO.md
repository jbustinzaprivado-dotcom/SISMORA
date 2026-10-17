# CONTEXTO — Sismora (Sistema de Monitoreo Sísmico, Análisis y Alertas)

> Fuente de verdad para decidir sin releer el documento base (`Plan_Desarrollo_Sistema_Monitoreo_Sismico_ML.pdf`, v1.0, 13/10/2026).
> Se actualiza al cierre de cada fase. Si algo aquí contradice al PDF, **manda este archivo** (ver §6).
> Última actualización: 2026-10-15 · Fase actual: 0 (código listo; falta verificar con PostgreSQL, CI y despliegue)

## 1. Objetivo empresarial

Plataforma de **monitoreo sísmico y alertas operativas internas**, con analítica histórica y un laboratorio experimental de ML.
Usuario tipo: organización con activos en zonas sísmicas (minería, aseguradora, construcción, municipalidad, infraestructura). Cobertura inicial: **Perú**.

Valor real:
1. Una sola fuente de verdad de eventos sísmicos, con procedencia (proveedor, URL, hora de consulta, hash).
2. Avisos **internos** por reglas (magnitud, zona, profundidad) con aprobación, deduplicación, acuse y registro de entrega.
3. Análisis histórico por zona para planificación y reportes.
4. Laboratorio de ML honesto: estimaciones **experimentales**, siempre etiquetadas.

**Meta del proyecto:** académica **y** real. Calidad empresarial + documentación apta para exponer (ver §7).

## 2. Límites no negociables (del PDF §1 y §3)

- NO se promete predecir fecha, lugar y magnitud de un sismo.
- NO se emite como "alerta oficial" nada sin fuente oficial confirmada. No sustituye a IGP / INDECI.
- Cuatro categorías siempre distinguibles en datos **y** en interfaz: **observado**, **pendiente de validación**, **estimación experimental**, **comunicado oficial**.
- Toda estimación lleva modelo, versión, incertidumbre, fecha y advertencia. Nunca se envía automáticamente como alerta.
- Sin colores/escalas que sugieran peligro oficial sin escala validada.

## 3. Stack

React + TypeScript + Vite (Tailwind, Recharts, Leaflet) · Python + FastAPI + Pydantic + SQLAlchemy + Alembic · pandas, NumPy, scikit-learn, joblib · PostgreSQL (UUID, UTC, CHECK, migraciones) · Docker · CI en GitHub Actions · pytest, Vitest.
Monorepo: `apps/web`, `services/{api,ingestion,ml}`, `database/{migrations,seeds,diagrams}`, `tests`, `infra`, `docs`.
Despliegue costo cero (D8): Vercel (web) + Render (API) + PostgreSQL gratuito.

## 4. Roles

Administrador · Analista · Operador de alertas · Auditor · Solo lectura. Autorización en el backend por endpoint; la UI solo mejora la experiencia. Matriz rol × endpoint probada automáticamente.

## 5. Módulos (13)

Dashboard · Eventos · Mapa · Análisis estadístico · Preparación de datos · Modelos ML · Estimaciones experimentales · Reglas de alertas · Centro de alertas · Fuentes de datos · Reportes · Usuarios y roles · Auditoría y configuración.
Campos, tablas y endpoints: ver PDF §6–§8 (se detallan en `DOCUMENTACION.md` conforme se construyen).

## 6. Decisiones críticas (cerradas el 2026-10-15)

| # | Decisión | Elegido | Motivo |
|---|---|---|---|
| D1 | Fuente principal | **USGS** (feed GeoJSON público, sin clave). IGP como 2.ª fuente, a verificar términos | Datos reales desde el día 1; conector por adaptador |
| D2 | Target de ML | **Regresión del conteo semanal de eventos M≥4.5 por zona**, contra baseline (media histórica). Más una regresión lineal didáctica | Medible y defendible; no clasifica registros ya conocidos. Si no supera el baseline, se reporta así |
| D3 | Orden | **Alertas antes que ML** | Más valor empresarial; ML es lo más incierto |
| D4 | Canales | **En la app + correo**; el resto detrás de una interfaz de canal | Costo cero; nada externo sin aprobación y simulación |
| D5 | Tareas asíncronas | **Sin Redis**: proceso de ingesta + cron externo que llama un endpoint protegido | Render gratuito duerme el servicio |
| D6 | PostGIS | **No al inicio**: índices tiempo/magnitud/coordenadas + caja y haversine | Menos fricción; se añade si hace falta polígono real |
| D7 | Autenticación | **Identidad propia**: JWT en cookie HttpOnly + cabecera anti-CSRF (patrón de SalesIA); MFA como mejora | Probado en SalesIA |
| D8 | Despliegue | **Vercel + Render + PostgreSQL gratuito**, esqueleto desplegado desde la Fase 0 | Evita la lección de SalesIA (despliegue sin verificar) |
| D10 | Nombre | **Sismora** (repo sugerido: `sismora`) | Corto, descriptivo, sin promesa predictiva |
| D9 | Meta | **Académica y real** | Doc. de exposición + calidad de producto |

Decisiones menores (librería de mapa Leaflet, paleta, formatos de reporte, rutas): se deciden en el camino y se registran en `DOCUMENTACION.md`.

## 7. Reglas de trabajo

- **Fases cerradas**, cada una con criterio de "terminada" verificable (ver `PROCESO.md`). Sin subniveles que se alarguen.
- **Commit y push manuales** del usuario al cierre de cada fase (o de un hito que requiera su revisión). No se avanza sin su confirmación.
- Antes de cada fase: verificación cruzada de requisitos del PDF contra entregables (en SalesIA se olvidó el Dashboard).
- Lo que no se ha verificado en un entorno real se declara como tal; no se marca "hecho" sin comprobarlo.
- Se pueden añadir funciones que no están en el PDF si son **empresariales reales** (§8) y se registran aquí.
- `CONTEXTO.md` es corto y de formato fijo; el histórico va en `DOCUMENTACION.md`.
- `EXPOSICION.md` es la guía de la exposición académica: se anotan preguntas probables durante el desarrollo y se completa al cerrar la Fase 8.

## 8. Agregados empresariales (fuera del PDF, aprobados en principio)

1. **Simulación retrospectiva de reglas**: cuántas alertas habría disparado una regla en los últimos 90 días, antes de activarla.
2. **Acuse y escalamiento**: alerta sin acuse en N minutos pasa al siguiente grupo.
3. **Monitor de frescura de la fuente**: sin datos por X minutos → alerta *operativa* (separada de las sísmicas).
4. **Ficha del modelo** con limitaciones visibles; solo modelos aprobados llegan a "estimaciones".
5. **Resumen ejecutivo periódico** (PDF/CSV).
6. **Procedimiento de incidente** por severidad, enlazado desde cada alerta.

## 9. Lecciones heredadas de SalesIA (repo `jbustinzaprivado-dotcom/salesia-enterprise`)

Reutilizar: capas `api → services → repositories`; matriz de permisos probada; auditoría de solo inserción con trigger y misma transacción; pruebas contra PostgreSQL real; registro de decisiones (Problema → Alternativas → Decisión → Por qué → Costo); cookie HttpOnly + CSRF; idempotencia.
Evitar: documentos desactualizados, conteos de pruebas contradictorios, funcionalidades olvidadas, despliegue sin verificar, decisiones por omisión, convención de ramas abierta.
Trampas técnicas conocidas: `EmailStr` rechaza dominios `.local`; bcrypt falla con >72 bytes; Alembic no autogenera CHECK ni triggers; jsdom sin `matchMedia`/`ResizeObserver`; Vite lee `.env` de la raíz (solo `VITE_*`).

## 10. Pendientes abiertos

- Convención de ramas: **GitHub Flow, una rama por fase** (propuesta; confirmar al crear el repo).
- Zonas iniciales (polígonos/regiones de Perú) y umbral de M mínima de ingesta: se definen en la Fase 2.
- Términos de uso y acceso del IGP: verificar antes de usarlo como 2.ª fuente.
- Proveedor de correo para alertas (SMTP gratuito): se elige en la Fase 5.
