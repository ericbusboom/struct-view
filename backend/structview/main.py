from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Project, ValidateResponse, AnalysisStubResponse
from .validation import validate_project

app = FastAPI(title="StructView API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/validate", response_model=ValidateResponse)
def validate(project: Project):
    errors = validate_project(project)
    return ValidateResponse(valid=len(errors) == 0, errors=errors)


@app.post("/analyze", response_model=AnalysisStubResponse)
def analyze(project: Project):
    return AnalysisStubResponse(
        status="stub",
        message="Analysis not yet implemented. This is a placeholder response.",
        node_count=len(project.nodes),
        member_count=len(project.members),
    )
