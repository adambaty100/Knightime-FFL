from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.auth import AdminAuth
from app.crud import delete_row, insert_row, not_found, rows_as_dicts, update_row
from app.database import Database, get_db
from app.schemas import Champion, ChampionCreate


router = APIRouter(prefix="/champions", tags=["Champions"])
DatabaseDependency = Annotated[Database, Depends(get_db)]
SELECT = "SELECT rowid AS id, league_member_id, year FROM Champions"


@router.get("", response_model=list[Champion])
def get_champions(db: DatabaseDependency):
    rows = db.execute(SELECT).fetchall()
    if not rows:
        return not_found("No champions found")
    return rows_as_dicts(rows)


@router.get("/year/{year}", response_model=list[Champion])
def get_champions_by_year(year: int, db: DatabaseDependency):
    rows = db.execute(f"{SELECT} WHERE year = ?", (year,)).fetchall()
    if not rows:
        return not_found(f"No champions found for year {year}")
    return rows_as_dicts(rows)


@router.get("/member/{league_member_id}", response_model=list[Champion])
def get_champions_by_member(league_member_id: int, db: DatabaseDependency):
    rows = db.execute(
        f"{SELECT} WHERE league_member_id = ?", (league_member_id,)
    ).fetchall()
    if not rows:
        return not_found(
            f"No championships found for league member ID {league_member_id}"
        )
    return rows_as_dicts(rows)


@router.post("", response_model=Champion, status_code=status.HTTP_201_CREATED)
def create_champion(
    payload: ChampionCreate,
    db: DatabaseDependency,
    response: Response,
    _admin: AdminAuth,
):
    created = insert_row(db, "Champions", payload)
    response.headers["Location"] = f"/champions/id/{created['id']}"
    return created


@router.patch("/id/{row_id}", response_model=Champion)
def update_champion(
    row_id: int,
    payload: ChampionCreate,
    db: DatabaseDependency,
    _admin: AdminAuth,
):
    updated = update_row(db, "Champions", row_id, payload)
    if updated is None:
        return not_found(f"Champion with ID {row_id} not found")
    return updated


@router.delete("/id/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_champion(
    row_id: int, db: DatabaseDependency, _admin: AdminAuth
):
    if not delete_row(db, "Champions", row_id):
        return not_found(f"Champion with ID {row_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
