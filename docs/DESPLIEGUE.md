# Despliegue (costo cero): Vercel + Render + PostgreSQL

> **NO VERIFICADO.** Esta guía y sus archivos (`render.yaml`, `apps/web/vercel.json`) están escritos pero no se han probado en un despliegue real. La Fase 0 no se cierra hasta hacerlo.

```
Navegador ──▶ Vercel (web estática) ──/api/*──▶ Render (FastAPI) ──▶ PostgreSQL
```

El navegador solo habla con el dominio de Vercel; Vercel reenvía `/api` a Render (`rewrites` en `apps/web/vercel.json`). Así la cookie de sesión es del mismo sitio y no se bloquea como cookie de terceros.

## Pasos

1. **Base de datos.** Crea un PostgreSQL gratuito (Render o Supabase) y copia su URL.
2. **API en Render.** *New → Blueprint* sobre el repo (usa `render.yaml`). Define `DATABASE_URL` y `CORS_ORIGINS=https://<tu-proyecto>.vercel.app`. `SECRET_KEY` se genera sola. Las migraciones corren al arrancar.
3. **Web en Vercel.** Importa el repo con *Root Directory* `apps/web`. Antes, cambia en `apps/web/vercel.json` el destino `REEMPLAZAR-POR-TU-API.onrender.com` por la URL real de Render.
4. **Comprobar.** La pantalla *Estado del sistema* debe mostrar la API y la base de datos conectadas.

## Advertencias del plan gratuito

- Render **duerme** el servicio tras unos 15 minutos sin tráfico: la primera petición tarda. Despertarlo antes de una demostración.
- Por eso la ingesta (Fase 2) no puede depender de un proceso interno: usará un cron externo que llame a un endpoint protegido.
- Las bases gratuitas pueden tener límites de tamaño, conexiones y caducidad: revisar las condiciones vigentes del proveedor al elegirlo.
