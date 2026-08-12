from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.auth import AdminAuth
from app.crud import delete_row, insert_row, not_found, rows_as_dicts, update_row
from app.database import Database, get_db
from app.schemas import TeamData, TeamDataCreate


router = APIRouter(prefix="/teamdata", tags=["Team data"])
DatabaseDependency = Annotated[Database, Depends(get_db)]
SELECT = "SELECT rowid AS id, year, league_member_id, team_name FROM Team_Data"


@router.get("", response_model=list[TeamData])
def get_team_data(db: DatabaseDependency):
    rows = db.execute(SELECT).fetchall()
    if not rows:
        return not_found("No team data found")
    return rows_as_dicts(rows)


@router.get("/id/{row_id}", response_model=TeamData)
def get_team_data_by_id(row_id: int, db: DatabaseDependency):
    row = db.execute(f"{SELECT} WHERE rowid = ?", (row_id,)).fetchone()
    if row is None:
        return not_found(f"Team data with ID {row_id} not found")
    return dict(row)


@router.get("/year/{year}", response_model=list[TeamData])
def get_team_data_by_year(year: int, db: DatabaseDependency):
    rows = db.execute(f"{SELECT} WHERE year = ?", (year,)).fetchall()
    if not rows:
        return not_found(f"No team data found for year {year}")
    return rows_as_dicts(rows)


@router.get("/member/{league_member_id}", response_model=list[TeamData])
def get_team_data_by_member(league_member_id: int, db: DatabaseDependency):
    rows = db.execute(
        f"{SELECT} WHERE league_member_id = ?", (league_member_id,)
    ).fetchall()
    if not rows:
        return not_found(
            f"No team data found for league member ID {league_member_id}"
        )
    return rows_as_dicts(rows)


@router.post("", response_model=TeamData, status_code=status.HTTP_201_CREATED)
def create_team_data(
    payload: TeamDataCreate,
    db: DatabaseDependency,
    response: Response,
    _admin: AdminAuth,
):
    created = insert_row(db, "Team_Data", payload)
    response.headers["Location"] = f"/teamdata/id/{created['id']}"
    return created


@router.patch("/id/{row_id}", response_model=TeamData)
def update_team_data(
    row_id: int,
    payload: TeamDataCreate,
    db: DatabaseDependency,
    _admin: AdminAuth,
):
    updated = update_row(db, "Team_Data", row_id, payload)
    if updated is None:
        return not_found(f"Team data with ID {row_id} not found")
    return updated


@router.delete("/id/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_data(
    row_id: int, db: DatabaseDependency, _admin: AdminAuth
):
    if not delete_row(db, "Team_Data", row_id):
        return not_found(f"Team data with ID {row_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
