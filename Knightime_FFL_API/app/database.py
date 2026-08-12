from collections.abc import Generator, Sequence
from dataclasses import dataclass
from pathlib import Path
from types import TracebackType
from typing import Any, Self
import os

from dotenv import load_dotenv
from fastapi import Request
import libsql


API_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = API_ROOT / "schema.sql"
load_dotenv(API_ROOT / ".env")


@dataclass(frozen=True)
class DatabaseConfig:
    url: str
    auth_token: str = ""
    local_path: Path | None = None


def configured_database(
    database: str | Path | None = None,
    auth_token: str | None = None,
) -> DatabaseConfig:
    if isinstance(database, Path):
        path = database.expanduser().resolve()
        return DatabaseConfig(url=str(path), local_path=path)

    url = database or os.getenv("TURSO_DATABASE_URL")
    token = auth_token if auth_token is not None else os.getenv("TURSO_AUTH_TOKEN", "")
    if not url:
        raise RuntimeError(
            "TURSO_DATABASE_URL is required. Copy .env.example to .env and add "
            "your Turso database credentials."
        )
    if url.startswith("libsql://") and not token:
        raise RuntimeError("TURSO_AUTH_TOKEN is required for a Turso Cloud database.")

    return DatabaseConfig(url=url, auth_token=token)


class Cursor:
    def __init__(self, cursor: Any):
        self._cursor = cursor

    @property
    def lastrowid(self) -> int | None:
        return self._cursor.lastrowid

    @property
    def rowcount(self) -> int:
        return self._cursor.rowcount

    def _as_dict(self, row: Sequence[object]) -> dict[str, object]:
        columns = [column[0] for column in self._cursor.description]
        return dict(zip(columns, row, strict=True))

    def fetchone(self) -> dict[str, object] | None:
        row = self._cursor.fetchone()
        return None if row is None else self._as_dict(row)

    def fetchall(self) -> list[dict[str, object]]:
        return [self._as_dict(row) for row in self._cursor.fetchall()]


class Database:
    def __init__(self, connection: Any):
        self._connection = connection

    def execute(
        self, sql: str, parameters: Sequence[object] = ()
    ) -> Cursor:
        return Cursor(self._connection.execute(sql, parameters))

    def executescript(self, sql: str) -> None:
        self._connection.executescript(sql)

    def commit(self) -> None:
        self._connection.commit()

    def rollback(self) -> None:
        self._connection.rollback()

    def close(self) -> None:
        self._connection.close()

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exception_type: type[BaseException] | None,
        exception: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        if exception_type is None:
            self.commit()
        else:
            self.rollback()


def connect(config: DatabaseConfig) -> Database:
    connection = libsql.connect(
        database=config.url,
        auth_token=config.auth_token,
        _check_same_thread=False,
    )
    connection.execute("PRAGMA foreign_keys = ON")
    return Database(connection)


def initialize_database(config: DatabaseConfig) -> None:
    if config.local_path is not None:
        config.local_path.parent.mkdir(parents=True, exist_ok=True)
    with connect(config) as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))


def get_db(request: Request) -> Generator[Database, None, None]:
    connection = connect(request.app.state.database_config)
    try:
        yield connection
    finally:
        connection.close()
