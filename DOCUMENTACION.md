# DOCUMENTACIÓN — Sismora: registro del desarrollo

> Registro cronológico y técnico de todo lo desarrollado. Base del documento final y de la exposición.
> Aquí va el **histórico**; el estado actual vive en `CONTEXTO.md` y `PROCESO.md`.

## Cómo se usa este archivo

- Una entrada por hito o fase, con fecha, qué se hizo, por qué y qué se verificó.
- Las decisiones nuevas usan el formato: **Problema → Alternativas → Decisión → Por qué → Costo.**
- Los conteos de pruebas se anotan **solo** al cerrar una fase (evita cifras contradictorias).

## Índice

1. [Decisiones técnicas](#1-decisiones-técnicas)
2. [Bitácora por fase](#2-bitácora-por-fase)
3. [Lecciones aprendidas](#3-lecciones-aprendidas)
4. [Cómo ejecutar el proyecto](#4-cómo-ejecutar-el-proyecto) *(se completa en la Fase 0)*
5. [Modelo de datos y API](#5-modelo-de-datos-y-api) *(se completa por fase)*

## 1. Decisiones técnicas

### Decisiones críticas (2026-10-15)
Resumen en `CONTEXTO.md` §6 (D1–D9). Razonamiento ampliado:

#### D1. Fuente principal de eventos
- **Problema:** el PDF no elige fuente ("IGP u otra") y deja los términos de uso para la Fase 0.
- **Alternativas:** IGP primero; USGS primero; ambas desde el inicio.
- **Decisión:** USGS primero, IGP después, mediante un adaptador por conector.
- **Por qué:** el feed GeoJSON de USGS es público y no requiere clave, por lo que hay datos reales desde el día 1. El acceso y las condiciones del IGP deben verificarse.
- **Costo:** USGS no es la fuente local oficial peruana; para comunicaciones oficiales se conserva fuente y enlace, y no se presenta como aviso oficial.

#### D2. Objetivo del modelo de ML
- **Problema:** el PDF pide un target "medible" sin definirlo; clasificar rangos de magnitud de eventos ya reportados es casi trivial.
- **Alternativas:** clasificar rango de magnitud; conteo semanal M≥4.5 por zona; decidir después.
- **Decisión:** regresión del conteo semanal M≥4.5 por zona, contra un baseline de media histórica, más una regresión lineal didáctica.
- **Por qué:** es medible, respeta la partición temporal y no sugiere predecir un sismo concreto.
- **Costo:** los conteos son bajos y ruidosos; es probable que el modelo no supere el baseline. Eso se reporta tal cual.

#### D3. Alertas antes que ML
- **Decisión:** las fases de alertas (5) preceden al laboratorio de ML (6).
- **Por qué:** las alertas operativas dan valor empresarial inmediato y el ML es el componente más incierto.

#### D4. Canales de alerta
- **Decisión:** app + correo; otros canales tras una interfaz de canal con modo de prueba.
- **Por qué:** costo cero y sin dependencias de proveedores de SMS/WhatsApp. Nada externo sin aprobación y simulación.

#### D5–D8
- **D5:** sin Redis; proceso de ingesta + cron externo, porque el servicio gratuito de Render duerme.
- **D6:** sin PostGIS al inicio; índices y haversine.
- **D7:** autenticación propia (JWT en cookie HttpOnly + cabecera anti-CSRF).
- **D8:** Vercel + Render + PostgreSQL gratuito, con despliegue vacío desde la Fase 0.

#### D9. Meta
- **Decisión:** académica y real. Esta documentación está pensada para exponer el razonamiento, no solo el resultado.

### Diferencias respecto al PDF
| Tema | PDF | Este proyecto | Razón |
|---|---|---|---|
| Orden de fases | ML (F6) antes de alertas (F7) | Alertas (F5) antes de ML (F6) | D3 |
| Fases 0 y 1 | Separadas, despliegue en F9 | Unidas; despliegue en F0 | Evitar despliegue sin verificar |
| Fases 4 y 5 | Separadas | Unidas | Análisis y calidad de datos comparten datos |
| Celery/Redis | Opcional | Descartado al inicio | D5 |
| Funciones extra | — | Simulación de reglas, acuse y escalamiento, monitor de frescura, ficha del modelo, resumen ejecutivo, procedimiento de incidente | `CONTEXTO.md` §8 |

## 2. Bitácora por fase

### 2026-10-15 — Fase 0 (inicio)
- Análisis del PDF base (17 secciones, 13 módulos, 10 fases).
- Revisión del proyecto de referencia SalesIA: qué reutilizar y qué evitar (`CONTEXTO.md` §9).
- Decisiones D1–D9 cerradas con el usuario.
- Creados `CONTEXTO.md`, `PROCESO.md`, `DOCUMENTACION.md` y el esqueleto de `EXPOSICION.md` (guía académica, a completar al cierre).
- Nombre del proyecto: **Sismora** (D10).
- **Pendiente:** carpeta definitiva, repo (lo crea el usuario), esqueleto del monorepo y despliegue vacío.
- **No verificado:** nada ejecutado todavía.

### 2026-10-15 — Fase 0 (esqueleto)
- Monorepo creado según PDF §5 (`apps/web`, `services/{api,ingestion,ml}`, `database`, `infra`, `docs`, `tests`).
- **API:** FastAPI con `GET /api/v1/health` (liveness, sin base de datos; lo usa Render) y `GET /api/v1/health/ready` (comprueba PostgreSQL y mide latencia; 503 si falla). Formato de error único `{"error": {code, message, details}}`, cabecera `X-Request-ID` (correlation ID del PDF §8), cabeceras de seguridad básicas, CORS sin comodín, `/docs` apagado en producción y validación que impide arrancar en producción con configuración insegura (patrón de SalesIA).
- **Base de datos:** Alembic con `script_location` en `database/migrations`. Migración `0001` crea `system_settings` (módulo Configuración, PDF 6.13) con la zona horaria de visualización. Convención de nombres de restricciones fijada en `Base.metadata`.
- **Web:** React 19 + Vite + TypeScript + Tailwind v4 + React Router + TanStack Query. Layout con menú de los 13 módulos (cada uno indica la fase en que se construye), pantalla *Estado del sistema* y el componente `EtiquetaDato` con las cuatro categorías (observado, pendiente, experimental, oficial).
- **Operación:** CI (GitHub Actions), `render.yaml`, `apps/web/vercel.json`, `Dockerfile`, `docker-compose.yml`, guía `docs/DESPLIEGUE.md`.
- **Verificado en el equipo (PostgreSQL 18 real, 15-oct-2026):** `pytest` 16 pasan (incluye readiness y migraciones subir/bajar/`alembic check`), `alembic upgrade head` sobre la base `sismora`, `GET /health/ready` real con 200 y latencia, `npm run lint`, `npm test` (20 pasan) y `npm run build`.
- **No verificado:** pantalla en el navegador contra la API real, CI en GitHub, Docker y despliegue en Vercel/Render.

#### Decisiones menores de la Fase 0
- **Dos endpoints de salud.** *Problema:* Render necesita una comprobación barata y la interfaz necesita saber si la base responde. *Decisión:* `/health` no toca la base y `/health/ready` sí. *Costo:* dos rutas que mantener.
- **Primera migración con contenido real.** En lugar de una tabla de relleno, `system_settings` se usará en la Fase 7 (Configuración).
- **Docker no disponible en el equipo.** Se escriben `docker-compose.yml` y `Dockerfile` por el PDF §4 pero el desarrollo usa el PostgreSQL instalado; se marcan como no verificados.
- **Repo remoto.** El primer commit del remoto (`README.md` vacío) se hizo desde la carpeta de usuario por error; la rama de trabajo se alineó con `origin/main` para compartir historia.

## 3. Lecciones aprendidas

- **Las variables de entorno pesan más que el `.env`.** Un valor de reserva puesto con `os.environ.setdefault` en `conftest.py` tapaba al `.env` y las pruebas con base de datos se omitían sin avisar. Ahora el valor de reserva solo se usa si el `.env` no lo define, y las omisiones se muestran con `-rs`.

Heredadas de SalesIA (ver `CONTEXTO.md` §9). Las nuevas se anotan aquí con fecha.

## 4. Cómo ejecutar el proyecto

*(Se completa en la Fase 0.)*

## 5. Modelo de datos y API

*(Se completa por fase. Tablas y endpoints iniciales: PDF §7 y §8.)*
