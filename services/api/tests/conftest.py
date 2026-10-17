import os
from pathlib import Path

# Valores minimos para poder importar la app sin un .env (p. ej. en una maquina sin base de datos).
# Una variable de entorno pesa mas que el .env, asi que el valor de reserva solo se usa si el .env no la define.
_env_file = Path(__file__).resolve().parents[3] / ".env"
_env_text = _env_file.read_text(encoding="utf-8") if _env_file.exists() else ""


def _reserva(nombre: str, valor: str) -> None:
    if not any(line.startswith(f"{nombre}=") for line in _env_text.splitlines()):
        os.environ.setdefault(nombre, valor)


_reserva("DATABASE_URL", "postgresql+psycopg://sismora:sismora@localhost:5432/sismora")
_reserva("SECRET_KEY", "clave-solo-para-pruebas-0123456789abcdef")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def _database_reachable() -> bool:
    engine = create_engine(settings.database_url, connect_args={"connect_timeout": 3})
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
    finally:
        engine.dispose()


@pytest.fixture(scope="session")
def require_db():
    """Las pruebas con base de datos se omiten si no hay PostgreSQL alcanzable (se avisa, no se oculta)."""
    if not _database_reachable():
        pytest.skip("PostgreSQL no disponible: define DATABASE_URL en el .env de la raiz para ejecutar estas pruebas")
