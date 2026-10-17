import pytest
from pydantic import ValidationError

from app.core.config import Settings

BASE = {"database_url": "postgresql+psycopg://u:p@localhost/db", "_env_file": None}
SECRET_OK = "k9Xv2QmT7rLp4WzB8nJd5HcY1sFg6AeU"


def make(**kw):
    return Settings(**{**BASE, **kw})


def test_local_acepta_configuracion_de_desarrollo():
    s = make(secret_key="corta", environment="local")
    assert not s.is_production


@pytest.mark.parametrize("prefix", ["postgres://", "postgresql://"])
def test_url_de_proveedor_se_convierte_a_psycopg(prefix):
    s = make(secret_key="x", database_url=prefix + "u:p@host/db")
    assert s.database_url.startswith("postgresql+psycopg://")


def test_cors_no_acepta_comodin():
    with pytest.raises(ValidationError):
        make(secret_key="x", cors_origins="*")


def test_produccion_valida_exige_clave_cookie_y_https():
    s = make(secret_key=SECRET_OK, environment="production", cookie_secure=True, cors_origins="https://app.example.org")
    assert s.is_production


@pytest.mark.parametrize(
    "kw",
    [
        {"secret_key": "corta"},
        {"secret_key": "cambia_esta_clave_por_una_larga_de_32_caracteres"},
        {"secret_key": "a" * 40},
        {"secret_key": SECRET_OK, "cookie_secure": False},
        {"secret_key": SECRET_OK, "cookie_secure": True, "cors_origins": "http://sitio.org"},
    ],
)
def test_produccion_rechaza_configuracion_insegura(kw):
    base = {"environment": "production", "cookie_secure": True, "cors_origins": "https://app.example.org"}
    with pytest.raises(ValidationError):
        make(**{**base, **kw})
