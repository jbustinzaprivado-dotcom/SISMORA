from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env vive en la raiz del repositorio (cuatro niveles sobre este archivo)
ENV_FILE = Path(__file__).resolve().parents[4] / ".env"

MIN_SECRET_LENGTH = 32
PRODUCTION_NAMES = {"production", "produccion", "prod"}
# Fragmentos tipicos de claves copiadas de un ejemplo o de documentacion
WEAK_SECRET_WORDS = ("genera_una_clave", "cambia", "change", "changeme", "secret", "password", "example", "ejemplo", "default", "test")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    database_url: str
    # Los planes gratuitos admiten pocas conexiones: 5 + 5 de desborde = 10 como maximo por proceso.
    db_pool_size: int = 5
    db_max_overflow: int = 5
    secret_key: str
    cors_origins: str = "http://localhost:5173"
    environment: str = "local"
    cookie_secure: bool = False
    # Los datos se guardan en UTC; esta zona solo se usa para mostrarlos.
    display_timezone: str = "America/Lima"

    @field_validator("database_url")
    @classmethod
    def _driver_psycopg(cls, value: str) -> str:
        """Los proveedores entregan `postgres://` o `postgresql://`; SQLAlchemy necesita nombrar el driver (psycopg 3)."""
        value = value.strip()
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix):]
        return value

    @model_validator(mode="after")
    def _cors_without_wildcard(self) -> "Settings":
        if "*" in self.cors_origins_list:
            raise ValueError("CORS_ORIGINS no puede ser «*»: la sesion viaja en una cookie, lista los origenes uno a uno")
        return self

    @model_validator(mode="after")
    def _production_requires_safe_config(self) -> "Settings":
        """En produccion el sistema se niega a arrancar con una configuracion insegura."""
        if not self.is_production:
            return self
        problems: list[str] = []
        key = self.secret_key.strip()
        if len(key) < MIN_SECRET_LENGTH:
            problems.append(f"SECRET_KEY debe tener al menos {MIN_SECRET_LENGTH} caracteres")
        if any(word in key.lower() for word in WEAK_SECRET_WORDS):
            problems.append("SECRET_KEY parece un valor de ejemplo: genera uno con `openssl rand -hex 32`")
        if len(set(key)) < 10:
            problems.append("SECRET_KEY es demasiado repetitiva")
        if not self.cookie_secure:
            problems.append("COOKIE_SECURE debe ser true (la cookie de sesion solo debe viajar por HTTPS)")
        if any(o.startswith("http://") for o in self.cors_origins_list):
            problems.append("CORS_ORIGINS debe usar solo origenes https")
        if problems:
            raise ValueError("Configuracion insegura para produccion: " + "; ".join(problems))
        return self

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() in PRODUCTION_NAMES

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
