from collections.abc import Mapping, Sequence

from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.database import Database


def rows_as_dicts(
    rows: Sequence[Mapping[str, object]],
) -> list[dict[str, object]]:
    return [dict(row) for row in rows]


def not_found(message: str) -> JSONResponse:
    # ASP.NET serialized string error bodies as JSON strings. Keep that contract.
    return JSONResponse(status_code=404, content=message)


def insert_row(
    db: Database,
    table: str,
    payload: BaseModel,
) -> dict[str, object]:
    values = payload.model_dump()
    columns = ", ".join(values)
    placeholders = ", ".join("?" for _ in values)
    with db:
        cursor = db.execute(
            f'INSERT INTO "{table}" ({columns}) VALUES ({placeholders})',
            tuple(values.values()),
        )
    return {"id": cursor.lastrowid, **values}


def update_row(
    db: Database,
    table: str,
    row_id: int,
    payload: BaseModel,
) -> dict[str, object] | None:
    values = payload.model_dump()
    assignments = ", ".join(f"{column} = ?" for column in values)
    with db:
        cursor = db.execute(
            f'UPDATE "{table}" SET {assignments} WHERE rowid = ?',
            (*values.values(), row_id),
        )
    if cursor.rowcount == 0:
        return None
    return {"id": row_id, **values}


def delete_row(db: Database, table: str, row_id: int) -> bool:
    with db:
        cursor = db.execute(
            f'DELETE FROM "{table}" WHERE rowid = ?', (row_id,)
        )
    return cursor.rowcount > 0
