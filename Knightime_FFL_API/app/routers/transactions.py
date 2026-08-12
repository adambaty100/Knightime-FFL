from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.auth import AdminAuth
from app.crud import delete_row, insert_row, not_found, rows_as_dicts, update_row
from app.database import Database, get_db
from app.schemas import Transaction, TransactionCreate


router = APIRouter(prefix="/transactions", tags=["Transactions"])
DatabaseDependency = Annotated[Database, Depends(get_db)]
SELECT = """
SELECT rowid AS id, league_member_id, trades, acquisitions, drops,
       activations, ir, year
FROM Transactions
"""


@router.get("", response_model=list[Transaction])
def get_transactions(db: DatabaseDependency):
    rows = db.execute(SELECT).fetchall()
    if not rows:
        return not_found("No transactions found")
    return rows_as_dicts(rows)


@router.get("/id/{row_id}", response_model=Transaction)
def get_transaction_by_id(row_id: int, db: DatabaseDependency):
    row = db.execute(f"{SELECT} WHERE rowid = ?", (row_id,)).fetchone()
    if row is None:
        return not_found(f"Transaction with ID {row_id} not found")
    return dict(row)


@router.get("/member/{league_member_id}", response_model=list[Transaction])
def get_transactions_by_member(league_member_id: int, db: DatabaseDependency):
    rows = db.execute(
        f"{SELECT} WHERE league_member_id = ?", (league_member_id,)
    ).fetchall()
    if not rows:
        return not_found(
            f"No transactions found for league member ID {league_member_id}"
        )
    return rows_as_dicts(rows)


@router.get("/year/{year}", response_model=list[Transaction])
def get_transactions_by_year(year: int, db: DatabaseDependency):
    rows = db.execute(f"{SELECT} WHERE year = ?", (year,)).fetchall()
    if not rows:
        return not_found(f"No transactions found for year {year}")
    return rows_as_dicts(rows)


@router.post("", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: DatabaseDependency,
    response: Response,
    _admin: AdminAuth,
):
    created = insert_row(db, "Transactions", payload)
    response.headers["Location"] = f"/transactions/id/{created['id']}"
    return created


@router.patch("/id/{row_id}", response_model=Transaction)
def update_transaction(
    row_id: int,
    payload: TransactionCreate,
    db: DatabaseDependency,
    _admin: AdminAuth,
):
    updated = update_row(db, "Transactions", row_id, payload)
    if updated is None:
        return not_found(f"Transaction with ID {row_id} not found")
    return updated


@router.delete("/id/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    row_id: int, db: DatabaseDependency, _admin: AdminAuth
):
    if not delete_row(db, "Transactions", row_id):
        return not_found(f"Transaction with ID {row_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
