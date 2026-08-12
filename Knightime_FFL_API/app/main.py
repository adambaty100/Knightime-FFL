from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import configured_cors_origin_regex, configured_cors_origins
from app.database import configured_database, initialize_database
from app.routers import champions, game_data, league_members, team_data, transactions


def create_app(
    database: str | Path | None = None,
    auth_token: str | None = None,
    admin_api_key: str | None = None,
) -> FastAPI:

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        database_config = configured_database(database, auth_token)
        application.state.database_config = database_config
        initialize_database(database_config)
        yield

    application = FastAPI(
        title="Knightime FFL API",
        version="1.0.0",
        description="Historical teams, games, transactions, and champions.",
        lifespan=lifespan,
    )
    application.state.admin_api_key = (
        admin_api_key
        if admin_api_key is not None
        else os.getenv("ADMIN_API_KEY", "")
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=configured_cors_origins(),
        allow_origin_regex=configured_cors_origin_regex(),
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health", tags=["System"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    application.include_router(league_members.router)
    application.include_router(team_data.router)
    application.include_router(game_data.router)
    application.include_router(transactions.router)
    application.include_router(champions.router)
    return application


app = create_app()
