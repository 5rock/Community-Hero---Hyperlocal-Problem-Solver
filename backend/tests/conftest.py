import os
import secrets

import pytest
from fastapi.testclient import TestClient

if not os.getenv("TEST_DATABASE_URL"):
    pytest.skip(
        "TEST_DATABASE_URL is required for PostgreSQL integration tests",
        allow_module_level=True,
    )
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ.setdefault("JWT_SECRET", secrets.token_urlsafe(48))
os.environ.setdefault("AES_KEY", os.getenv("TEST_AES_KEY") or secrets.token_urlsafe(32))
os.environ.setdefault(
    "HMAC_SECRET", os.getenv("TEST_HMAC_SECRET") or secrets.token_urlsafe(32)
)
os.environ.setdefault("COOKIE_SECURE", "false")

from app.main import app  # noqa: E402
from app.api.auth import limiter as auth_limiter  # noqa: E402


@pytest.fixture
def client():
    app.state.limiter.enabled = False
    auth_limiter.enabled = False
    with TestClient(app) as test_client:
        yield test_client
