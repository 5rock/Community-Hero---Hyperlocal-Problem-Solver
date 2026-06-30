from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def _register_and_login(client):
    email = f"citizen-{uuid4().hex}@example.com"
    password = "Correct-Horse-Battery-42!"
    registration = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": "Integration Citizen",
            "password": password,
            "privacy_mode": True,
        },
    )
    assert registration.status_code == 200, registration.text
    login = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    assert login.status_code == 200, login.text
    return email, login.json()["access_token"]


def test_signup_login_refresh_rotation_and_logout(client):
    email, old_access_token = _register_and_login(client)

    profile = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {old_access_token}"}
    )
    assert profile.status_code == 200
    assert profile.json()["email"] == email
    assert profile.json()["role"] == "Citizen"

    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200, refreshed.text
    new_access_token = refreshed.json()["access_token"]
    assert new_access_token != old_access_token

    with TestClient(app) as isolated_client:
        invalidated = isolated_client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {old_access_token}"},
        )
    assert invalidated.status_code == 401

    logout = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert logout.status_code == 200


def test_citizen_can_read_aggregate_stats(client):
    _, token = _register_and_login(client)
    response = client.get("/api/stats/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "total_issues" in response.json()["cards"]


def test_password_reset_is_one_time_and_revokes_sessions(client, monkeypatch):
    email, old_token = _register_and_login(client)
    monkeypatch.setenv("ENABLE_DEV_PASSWORD_RESET", "true")
    requested = client.post("/api/auth/forgot-password", json={"email": email})
    assert requested.status_code == 202
    code = requested.json()["dev_code"]

    new_password = "New-Correct-Horse-Battery-84!"
    reset = client.post(
        "/api/auth/reset-password",
        json={"token": code, "password": new_password},
    )
    assert reset.status_code == 200, reset.text
    reused = client.post(
        "/api/auth/reset-password",
        json={"token": code, "password": new_password},
    )
    assert reused.status_code == 400

    with TestClient(app) as isolated_client:
        revoked = isolated_client.get(
            "/api/auth/me", headers={"Authorization": f"Bearer {old_token}"}
        )
    assert revoked.status_code == 401

    new_login = client.post(
        "/api/auth/login",
        data={"username": email, "password": new_password},
    )
    assert new_login.status_code == 200
