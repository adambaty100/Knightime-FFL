from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sqlite3

from fastapi.testclient import TestClient
import pytest

from app.main import create_app
from index import app as vercel_app


ADMIN_API_KEY = "test-admin-api-key"
AUTH_HEADERS = {"Authorization": f"Bearer {ADMIN_API_KEY}"}


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    database_path = tmp_path / "test.db"
    app = create_app(database_path, admin_api_key=ADMIN_API_KEY)
    with TestClient(app) as test_client:
        with sqlite3.connect(database_path) as db:
            db.executemany(
                """
                INSERT INTO League_Members (id, league_member, experience)
                VALUES (?, ?, ?)
                """,
                [(1, "Alice Knight", 10), (2, "Bob Rook", 7)],
            )
        yield test_client


def test_health_and_openapi(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}
    paths = client.get("/openapi.json").json()["paths"]
    assert "/teamdata/id/{row_id}" in paths
    assert "/gamedata/week/{week}" in paths
    assert "/transactions/member/{league_member_id}" in paths
    assert "/champions/year/{year}" in paths
    for path in ("/teamdata", "/gamedata", "/transactions", "/champions"):
        assert paths[path]["post"]["security"] == [{"HTTPBearer": []}]
        assert paths[f"{path}/id/{{row_id}}"]["patch"]["security"] == [
            {"HTTPBearer": []}
        ]
        assert paths[f"{path}/id/{{row_id}}"]["delete"]["security"] == [
            {"HTTPBearer": []}
        ]


def test_vercel_entrypoint_exports_fastapi_application() -> None:
    assert vercel_app.title == "Knightime FFL API"
    assert any(route.path == "/health" for route in vercel_app.routes)


@pytest.mark.parametrize(
    "origin", ["http://localhost:4200", "http://127.0.0.1:4200"]
)
def test_cors_allows_angular_development_server(
    client: TestClient, origin: str
) -> None:
    preflight = client.options(
        "/teamdata",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    response = client.get("/teamdata", headers={"Origin": origin})

    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == origin
    assert response.status_code == 404
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_allows_vercel_preview_origins(client: TestClient) -> None:
    origin = "https://knightime-ffl-git-feature-example.vercel.app"

    response = client.get("/health", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_allows_configured_production_origin(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    origin = "https://fantasy.example.com"
    monkeypatch.setenv("CORS_ORIGINS", f"{origin}/")
    app = create_app(tmp_path / "cors.db", admin_api_key=ADMIN_API_KEY)

    with TestClient(app) as configured_client:
        response = configured_client.get("/health", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_rejects_unconfigured_origins(client: TestClient) -> None:
    response = client.get(
        "/health", headers={"Origin": "https://untrusted.example.com"}
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_league_member_routes(client: TestClient) -> None:
    members = client.get("/leaguemembers")
    by_id = client.get("/leaguemembers/id/1")
    by_name = client.get("/leaguemembers/name/KNIGHT")

    assert members.status_code == 200
    assert members.json()[0] == {
        "id": 1,
        "leagueMember": "Alice Knight",
        "experience": 10,
    }
    assert by_id.json()["leagueMember"] == "Alice Knight"
    assert [member["id"] for member in by_name.json()] == [1]
    assert client.get("/leaguemembers/id/999").status_code == 404


def test_parallel_member_lookups_remain_on_request_owned_connections(
    client: TestClient,
) -> None:
    origin = "http://127.0.0.1:4200"

    def fetch_member(member_id: int):
        return client.get(
            f"/leaguemembers/id/{member_id}", headers={"Origin": origin}
        )

    member_ids = [1, 2] * 10
    with ThreadPoolExecutor(max_workers=10) as executor:
        responses = list(executor.map(fetch_member, member_ids))

    assert all(response.status_code == 200 for response in responses)
    assert all(
        response.headers["access-control-allow-origin"] == origin
        for response in responses
    )


@pytest.mark.parametrize(
    ("resource", "payload", "updated_payload"),
    [
        (
            "teamdata",
            {"year": 2025, "leagueMemberId": 1, "teamName": "The Knights"},
            {"year": 2026, "leagueMemberId": 1, "teamName": "Knight Shift"},
        ),
        (
            "gamedata",
            {
                "leagueMemberId": 1,
                "pointsFor": 101,
                "pointsAgainst": 99,
                "winLossTie": "W",
                "opponentId": 2,
                "year": 2025,
                "week": "1",
            },
            {
                "leagueMemberId": 1,
                "pointsFor": 105,
                "pointsAgainst": 99,
                "winLossTie": "W",
                "opponentId": 2,
                "year": 2025,
                "week": "1",
            },
        ),
        (
            "transactions",
            {
                "leagueMemberId": 1,
                "trades": 2,
                "acquisitions": 10,
                "drops": 8,
                "activations": 3,
                "ir": 1,
                "year": 2025,
            },
            {
                "leagueMemberId": 1,
                "trades": 3,
                "acquisitions": 10,
                "drops": 8,
                "activations": 3,
                "ir": 1,
                "year": 2025,
            },
        ),
        (
            "champions",
            {"leagueMemberId": 1, "year": 2025},
            {"leagueMemberId": 2, "year": 2025},
        ),
    ],
)
def test_mutable_resource_lifecycle(
    client: TestClient,
    resource: str,
    payload: dict[str, object],
    updated_payload: dict[str, object],
) -> None:
    created = client.post(f"/{resource}", json=payload, headers=AUTH_HEADERS)

    assert created.status_code == 201
    row_id = created.json()["id"]
    assert created.headers["location"] == f"/{resource}/id/{row_id}"
    assert {key: created.json()[key] for key in payload} == payload

    updated = client.patch(
        f"/{resource}/id/{row_id}", json=updated_payload, headers=AUTH_HEADERS
    )
    assert updated.status_code == 200
    assert {key: updated.json()[key] for key in updated_payload} == updated_payload

    listing = client.get(f"/{resource}")
    assert listing.status_code == 200
    assert listing.json() == [updated.json()]

    deleted = client.delete(f"/{resource}/id/{row_id}", headers=AUTH_HEADERS)
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert (
        client.delete(f"/{resource}/id/{row_id}", headers=AUTH_HEADERS).status_code
        == 404
    )


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("post", "/champions", {"leagueMemberId": 1, "year": 2025}),
        (
            "patch",
            "/champions/id/1",
            {"leagueMemberId": 1, "year": 2025},
        ),
        ("delete", "/champions/id/1", None),
    ],
)
@pytest.mark.parametrize(
    "headers",
    [{}, {"Authorization": "Bearer incorrect-key"}],
)
def test_mutations_require_valid_admin_credentials(
    client: TestClient,
    method: str,
    path: str,
    payload: dict[str, object] | None,
    headers: dict[str, str],
) -> None:
    response = client.request(method, path, json=payload, headers=headers)

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or missing admin credentials"
    assert response.headers["www-authenticate"] == "Bearer"


def test_mutations_fail_closed_when_admin_key_is_not_configured(
    tmp_path: Path,
) -> None:
    app = create_app(tmp_path / "unconfigured.db", admin_api_key="")
    with TestClient(app) as unconfigured_client:
        response = unconfigured_client.post(
            "/champions", json={"leagueMemberId": 1, "year": 2025}
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "Admin authentication is not configured"


def test_filter_routes(client: TestClient) -> None:
    client.post(
        "/teamdata",
        json={"year": 2025, "leagueMemberId": 1, "teamName": "The Knights"},
        headers=AUTH_HEADERS,
    )
    client.post(
        "/gamedata",
        json={
            "leagueMemberId": 1,
            "pointsFor": 101,
            "pointsAgainst": 99,
            "winLossTie": "W",
            "opponentId": 2,
            "year": 2025,
            "week": "Final",
        },
        headers=AUTH_HEADERS,
    )
    client.post(
        "/transactions",
        json={"leagueMemberId": 1, "trades": 2, "year": 2025},
        headers=AUTH_HEADERS,
    )
    client.post(
        "/champions",
        json={"leagueMemberId": 1, "year": 2025},
        headers=AUTH_HEADERS,
    )

    successful_filters = [
        "/teamdata/year/2025",
        "/teamdata/member/1",
        "/gamedata/week/Final",
        "/gamedata/year/2025",
        "/gamedata/member/1",
        "/transactions/year/2025",
        "/transactions/member/1",
        "/champions/year/2025",
        "/champions/member/1",
    ]
    for path in successful_filters:
        response = client.get(path)
        assert response.status_code == 200, path
        assert len(response.json()) == 1, path


def test_empty_collection_returns_compatible_json_string(client: TestClient) -> None:
    response = client.get("/gamedata/year/1900")

    assert response.status_code == 404
    assert response.json() == "No game data found for year 1900"


def test_request_validation_uses_camel_case_fields(client: TestClient) -> None:
    response = client.post(
        "/gamedata",
        json={"leagueMemberId": "not-an-integer", "opponentId": 2},
        headers=AUTH_HEADERS,
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "leagueMemberId"
