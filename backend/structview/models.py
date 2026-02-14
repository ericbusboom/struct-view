"""Pydantic models mirroring the frontend TypeScript data model."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal


class Vec3(BaseModel):
    x: float
    y: float
    z: float


class SpringStiffness(BaseModel):
    kx: float = Field(ge=0)
    ky: float = Field(ge=0)
    kz: float = Field(ge=0)
    krx: float = Field(ge=0)
    kry: float = Field(ge=0)
    krz: float = Field(ge=0)


SupportType = Literal[
    "free", "pinned", "fixed",
    "roller_x", "roller_y", "roller_z",
    "spring",
]


class Support(BaseModel):
    type: SupportType
    spring_stiffness: SpringStiffness | None = None


ConnectionType = Literal["rigid", "pinned", "semi_rigid"]
ConnectionMethod = Literal["welded", "bolted", "screwed", "nailed", "glued"]


class Node(BaseModel):
    id: str = Field(min_length=1)
    position: Vec3
    support: Support
    connection_type: ConnectionType
    connection_method: ConnectionMethod | None = None
    tags: list[str]


class Material(BaseModel):
    name: str = Field(min_length=1)
    E: float = Field(gt=0)
    G: float = Field(gt=0)
    density: float = Field(gt=0)
    yield_strength: float = Field(gt=0)


class Section(BaseModel):
    name: str = Field(min_length=1)
    A: float = Field(gt=0)
    Ix: float = Field(gt=0)
    Iy: float = Field(gt=0)
    Sx: float = Field(gt=0)
    Sy: float = Field(gt=0)
    J: float = Field(gt=0)


class EndRelease(BaseModel):
    fx: bool
    fy: bool
    fz: bool
    mx: bool
    my: bool
    mz: bool


class EndReleases(BaseModel):
    start: EndRelease
    end: EndRelease


class Member(BaseModel):
    id: str = Field(min_length=1)
    start_node: str = Field(min_length=1)
    end_node: str = Field(min_length=1)
    material: Material
    section: Section
    end_releases: EndReleases
    tags: list[str]


class PanelMaterial(BaseModel):
    name: str = Field(min_length=1)
    E: float = Field(gt=0)
    G: float = Field(gt=0)
    thickness: float = Field(gt=0)
    density: float = Field(gt=0)


class Panel(BaseModel):
    id: str = Field(min_length=1)
    node_ids: list[str] = Field(min_length=3)
    material: PanelMaterial
    side: Literal["positive", "negative"]
    tags: list[str]


LoadType = Literal["point", "distributed", "area", "self_weight"]


class Load(BaseModel):
    id: str = Field(min_length=1)
    case: str = Field(min_length=1)
    type: LoadType
    target: str = Field(min_length=1)
    magnitude: float
    direction: Vec3
    position: float | None = Field(default=None, ge=0, le=1)
    start_magnitude: float | None = None
    end_magnitude: float | None = None


LoadCaseType = Literal["dead", "live", "wind", "snow", "seismic", "other"]


class LoadCase(BaseModel):
    name: str = Field(min_length=1)
    type: LoadCaseType


class CombinationFactor(BaseModel):
    case: str = Field(min_length=1)
    factor: float


class LoadCombination(BaseModel):
    name: str = Field(min_length=1)
    factors: list[CombinationFactor] = Field(min_length=1)


class Project(BaseModel):
    name: str = Field(min_length=1)
    nodes: list[Node]
    members: list[Member]
    panels: list[Panel]
    loads: list[Load]
    load_cases: list[LoadCase]
    combinations: list[LoadCombination]


# --- API Response Models ---

class ValidationError(BaseModel):
    path: str
    message: str


class ValidateResponse(BaseModel):
    valid: bool
    errors: list[ValidationError]


class AnalysisStubResponse(BaseModel):
    status: str
    message: str
    node_count: int
    member_count: int
