from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.auth import AdminAuth
from app.crud import delete_row, insert_row, not_found, rows_as_dicts, update_row
from app.database import Database, get_db
from app.schemas import GameData, GameDataCreate


router = APIRouter(prefix="/gamedata", tags=["Game data"])
DatabaseDependency = Annotated[Database, Depends(get_db)]
SELECT = """
SELECT rowid AS id, league_member_id, points_for, points_against,
       win_loss_tie, opponent_id, year, week
FROM Game_Data
"""


@router.get("", response_model=list[GameData])
def get_game_data(db: DatabaseDependency):
    rows = db.execute(SELECT).fetchall()
    if not rows:
        return not_found("No game data found")
    return rows_as_dicts(rows)


@router.get("/id/{row_id}", response_model=GameData)
def get_game_data_by_id(row_id: int, db: DatabaseDependency):
    row = db.execute(f"{SELECT} WHERE rowid = ?", (row_id,)).fetchone()
    if row is None:
        return not_found(f"Game data with ID {row_id} not found")
    return dict(row)


@router.get("/week/{week}", response_model=list[GameData])
def get_game_data_by_week(week: str, db: DatabaseDependency):
    rows = db.execute(f"{SELECT} WHERE week = ?", (week,)).fetchall()
    if not rows:
        return not_found(f"No game data found for week {week}")
    return rows_as_dicts(rows)


@router.get("/year/{year}", response_model=list[GameData])
def get_game_data_by_year(year: int, db: DatabaseDependency):
    rows = db.execute(f"{SELECT} WHERE year = ?", (year,)).fetchall()
    if not rows:
        return not_found(f"No game data found for year {year}")
    return rows_as_dicts(rows)


@router.get("/member/{league_member_id}", response_model=list[GameData])
def get_game_data_by_member(league_member_id: int, db: DatabaseDependency):
    rows = db.execute(
        f"{SELECT} WHERE league_member_id = ?", (league_member_id,)
    ).fetchall()
    if not rows:
        return not_found(
            f"No game data found for league member ID {league_member_id}"
        )
    return rows_as_dicts(rows)


@router.post("", response_model=GameData, status_code=status.HTTP_201_CREATED)
def create_game_data(
    payload: GameDataCreate,
    db: DatabaseDependency,
    response: Response,
    _admin: AdminAuth,
):
    created = insert_row(db, "Game_Data", payload)
    response.headers["Location"] = f"/gamedata/id/{created['id']}"
    return created


@router.patch("/id/{row_id}", response_model=GameData)
def update_game_data(
    row_id: int,
    payload: GameDataCreate,
    db: DatabaseDependency,
    _admin: AdminAuth,
):
    updated = update_row(db, "Game_Data", row_id, payload)
    if updated is None:
        return not_found(f"Game data with ID {row_id} not found")
    return updated


@router.delete("/id/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_data(
    row_id: int, db: DatabaseDependency, _admin: AdminAuth
):
    if not delete_row(db, "Game_Data", row_id):
        return not_found(f"Game data with ID {row_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
