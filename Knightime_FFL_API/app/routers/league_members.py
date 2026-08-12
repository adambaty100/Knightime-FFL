from typing import Annotated

from fastapi import APIRouter, Depends

from app.crud import not_found, rows_as_dicts
from app.database import Database, get_db
from app.schemas import LeagueMember


router = APIRouter(prefix="/leaguemembers", tags=["League members"])
DatabaseDependency = Annotated[Database, Depends(get_db)]


@router.get("", response_model=list[LeagueMember])
def get_league_members(db: DatabaseDependency):
    members = db.execute(
        "SELECT id, league_member, experience FROM League_Members"
    ).fetchall()
    if not members:
        return not_found("No league members found")
    return rows_as_dicts(members)


@router.get("/id/{member_id}", response_model=LeagueMember)
def get_league_member_by_id(member_id: int, db: DatabaseDependency):
    member = db.execute(
        "SELECT id, league_member, experience FROM League_Members WHERE id = ?",
        (member_id,),
    ).fetchone()
    if member is None:
        return not_found(f"League member with ID {member_id} not found")
    return dict(member)


@router.get("/name/{name}", response_model=list[LeagueMember])
def get_league_members_by_name(name: str, db: DatabaseDependency):
    members = db.execute(
        """
        SELECT id, league_member, experience
        FROM League_Members
        WHERE instr(lower(league_member), lower(?)) > 0
        """,
        (name,),
    ).fetchall()
    if not members:
        return not_found(f"No league members found with name containing '{name}'")
    return rows_as_dicts(members)
