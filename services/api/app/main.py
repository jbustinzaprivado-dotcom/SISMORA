import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.errors import register_error_handlers

app = FastAPI(
    title="Sismora API",
    version=__version__,
    description="Monitoreo sismico, analitica y alertas operativas internas. No emite alertas oficiales.",
    # En produccion se apaga la documentacion interactiva
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-Requested-With", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def correlation_id(request: Request, call_next):
    """Cada solicitud lleva un id que viaja en la respuesta y en los logs (se usara en la auditoria)."""
    cid = request.headers.get("X-Request-ID", "")[:64] or uuid.uuid4().hex
    request.state.correlation_id = cid
    response = await call_next(request)
    response.headers["X-Request-ID"] = cid
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


register_error_handlers(app)
app.include_router(api_router)
