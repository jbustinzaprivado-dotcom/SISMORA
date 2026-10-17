# Sismora

Plataforma web de **monitoreo sísmico, análisis histórico y alertas operativas internas**, con un laboratorio experimental de Machine Learning.

> Sismora **no predice terremotos** ni emite alertas oficiales. Distingue siempre entre evento observado, pendiente de validación, estimación experimental y comunicado oficial.

**Estado:** Fase 0 (esqueleto). Ver [PROCESO.md](PROCESO.md).

| Documento | Para qué sirve |
|---|---|
| [CONTEXTO.md](CONTEXTO.md) | Resumen del documento base y decisiones: léelo antes de decidir algo |
| [PROCESO.md](PROCESO.md) | Fases, criterios de "terminada" y bitácora de cierres |
| [DOCUMENTACION.md](DOCUMENTACION.md) | Registro técnico de todo lo desarrollado |
| [EXPOSICION.md](EXPOSICION.md) | Guía de la exposición académica (se completa al final) |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | Despliegue en Vercel + Render + PostgreSQL |

## Estructura

```
apps/web/            React + TypeScript + Vite
services/api/        FastAPI (API de negocio)
services/ingestion/  conectores de fuentes (Fase 2)
services/ml/         laboratorio de ML (Fase 6)
database/            migraciones (Alembic), seeds y diagramas
infra/               docker-compose y operación
```

## Requisitos

- Python 3.13, Node.js 24 y PostgreSQL 16 o superior (instalado, o con Docker).

## Puesta en marcha (PowerShell)

```powershell
# 1. Variables de entorno (en la raíz del repositorio)
copy .env.example .env
# edita .env: pon la clave real de tu PostgreSQL en DATABASE_URL y genera SECRET_KEY

# 2. Base de datos: crea la base vacía
psql -U postgres -c "CREATE DATABASE sismora;"

# 3. API
cd services\api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload        # http://localhost:8000/docs

# 4. Web (otra terminal)
cd apps\web
npm install
npm run dev                          # http://localhost:5173
```

Con Docker, la base se levanta con: `docker compose -f infra/docker-compose.yml --env-file .env up -d db`.

## Pruebas

```powershell
cd services\api; python -m pytest    # las pruebas con base de datos se omiten si no hay PostgreSQL alcanzable
cd apps\web; npm run lint; npm test; npm run build
```

Las pruebas de migraciones crean y destruyen su propia base `<nombre>_test`; la base de desarrollo no se toca. El usuario de la base necesita permiso `CREATEDB`.

## Seguridad en desarrollo

- `.env` está en `.gitignore`; solo se versiona `.env.example`.
- Con `ENVIRONMENT=production` la API no arranca si `SECRET_KEY` es débil o de ejemplo, si `COOKIE_SECURE` no es `true` o si `CORS_ORIGINS` usa `http://`.
