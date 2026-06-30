import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class ConfigurationError(RuntimeError):
    """Raised when required production configuration is invalid."""


def _required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ConfigurationError(
            f"{name} must be set in backend/.env or the process environment"
        )
    return value


def postgres_url() -> str:
    value = _required("DATABASE_URL")
    if value.startswith("postgres://"):
        value = "postgresql+psycopg2://" + value.removeprefix("postgres://")
    elif value.startswith("postgresql://"):
        value = "postgresql+psycopg2://" + value.removeprefix("postgresql://")
    if not value.startswith("postgresql+psycopg2://"):
        raise ConfigurationError(
            "DATABASE_URL must use PostgreSQL; SQLite is not supported"
        )
    return value

def secret(name: str, minimum_length: int = 32) -> str:
    value = _required(name)
    if len(value.encode("utf-8")) < minimum_length:
        raise ConfigurationError(f"{name} must be at least {minimum_length} bytes")
    return value


@lru_cache
def jwt_secret() -> str:
    return secret("JWT_SECRET", 32)

