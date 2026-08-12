from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class LeagueMember(ApiModel):
    id: int
    league_member: str | None
    experience: int


class TeamDataBase(ApiModel):
    year: int = 0
    league_member_id: int = 0
    team_name: str | None = None


class TeamDataCreate(TeamDataBase):
    pass


class TeamData(TeamDataBase):
    id: int


class GameDataBase(ApiModel):
    league_member_id: int = 0
    points_for: int = 0
    points_against: int = 0
    win_loss_tie: str | None = None
    opponent_id: int = 0
    year: int = 0
    week: str | None = None


class GameDataCreate(GameDataBase):
    pass


class GameData(GameDataBase):
    id: int


class TransactionBase(ApiModel):
    league_member_id: int = 0
    trades: int = 0
    acquisitions: int = 0
    drops: int = 0
    activations: int = 0
    ir: int = 0
    year: int = 0


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int


class ChampionBase(ApiModel):
    league_member_id: int = 0
    year: int = 0


class ChampionCreate(ChampionBase):
    pass


class Champion(ChampionBase):
    id: int
