from uuid import uuid4


def _authenticated_headers(client):
    email = f"surface-{uuid4().hex}@example.com"
    password = "Surface-Test-Password-42!"
    registered = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": "API Surface Tester",
            "password": password,
        },
    )
    assert registered.status_code == 200
    logged_in = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    assert logged_in.status_code == 200
    return {"Authorization": f"Bearer {logged_in.json()['access_token']}"}


def test_public_and_authenticated_api_surface_has_no_server_errors(client):
    headers = _authenticated_headers(client)
    checks = (
        client.get("/api/health"),
        client.get("/api/issues/"),
        client.get("/api/stats/leaderboard/lifetime"),
        client.get("/api/auth/me", headers=headers),
        client.get("/api/users/activities", headers=headers),
        client.get("/api/users/notifications", headers=headers),
        client.get("/api/stats/", headers=headers),
        client.get("/api/issues/assigned", headers=headers),
        client.get("/api/admin/security-dashboard", headers=headers),
        client.get("/api/stats/ai-insights", headers=headers),
        client.post("/api/issues/upload", headers=headers),
    )
    assert all(response.status_code < 500 for response in checks)
    assert checks[0].status_code == 200
    assert checks[1].status_code == 200
    assert checks[2].status_code == 200
    assert checks[3].status_code == 200
    assert checks[7].status_code == 403
    assert checks[8].status_code == 403
    assert checks[9].status_code == 403
    assert checks[10].status_code == 422
