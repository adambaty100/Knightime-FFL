from pathlib import Path

import pytest

from app.database import configured_database


def test_turso_configuration_comes_from_environment(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv(
        "TURSO_DATABASE_URL", "libsql://knightime-example.turso.io"
    )
    monkeypatch.setenv("TURSO_AUTH_TOKEN", "secret-token")

    config = configured_database()

    assert config.url == "libsql://knightime-example.turso.io"
    assert config.auth_token == "secret-token"
    assert config.local_path is None


def test_turso_configuration_requires_url(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("TURSO_DATABASE_URL", raising=False)
    monkeypatch.delenv("TURSO_AUTH_TOKEN", raising=False)

    with pytest.raises(RuntimeError, match="TURSO_DATABASE_URL is required"):
        configured_database()


def test_turso_configuration_requires_token(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv(
        "TURSO_DATABASE_URL", "libsql://knightime-example.turso.io"
    )
    monkeypatch.delenv("TURSO_AUTH_TOKEN", raising=False)

    with pytest.raises(RuntimeError, match="TURSO_AUTH_TOKEN is required"):
        configured_database()


def test_explicit_local_database_is_available_for_isolated_tests(tmp_path: Path):
    database_path = tmp_path / "test.db"

    config = configured_database(database_path)

    assert config.url == str(database_path)
    assert config.auth_token == ""
    assert config.local_path == database_path
