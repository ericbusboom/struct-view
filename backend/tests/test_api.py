import pytest
from fastapi.testclient import TestClient
from structview.main import app

client = TestClient(app)

STEEL = {
    "name": "Steel A36",
    "E": 200e9,
    "G": 77.2e9,
    "density": 7850,
    "yield_strength": 250e6,
}
SECTION = {
    "name": "W8x31",
    "A": 5.87e-3,
    "Ix": 1.1e-4,
    "Iy": 3.71e-5,
    "Sx": 2.75e-4,
    "Sy": 1.24e-4,
    "J": 5.36e-7,
}
NO_RELEASE = {"fx": False, "fy": False, "fz": False, "mx": False, "my": False, "mz": False}


def minimal_project():
    return {
        "name": "Test",
        "nodes": [
            {"id": "n1", "position": {"x": 0, "y": 0, "z": 0}, "support": {"type": "fixed"}, "connection_type": "rigid", "tags": []},
            {"id": "n2", "position": {"x": 5, "y": 3, "z": 0}, "support": {"type": "free"}, "connection_type": "rigid", "tags": []},
        ],
        "members": [
            {"id": "m1", "start_node": "n1", "end_node": "n2", "material": STEEL, "section": SECTION, "end_releases": {"start": NO_RELEASE, "end": NO_RELEASE}, "tags": []},
        ],
        "panels": [],
        "loads": [
            {"id": "L1", "case": "Dead", "type": "point", "target": "m1", "magnitude": -5000, "direction": {"x": 0, "y": -1, "z": 0}},
        ],
        "load_cases": [{"name": "Dead", "type": "dead"}],
        "combinations": [],
    }


class TestValidateEndpoint:
    def test_valid_project(self):
        resp = client.post("/validate", json=minimal_project())
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is True
        assert data["errors"] == []

    def test_empty_project(self):
        resp = client.post("/validate", json={
            "name": "Empty",
            "nodes": [],
            "members": [],
            "panels": [],
            "loads": [],
            "load_cases": [],
            "combinations": [],
        })
        assert resp.status_code == 200
        assert resp.json()["valid"] is True

    def test_duplicate_node_ids(self):
        proj = minimal_project()
        proj["nodes"].append(proj["nodes"][0])
        resp = client.post("/validate", json=proj)
        data = resp.json()
        assert data["valid"] is False
        assert any("Duplicate node ID" in e["message"] for e in data["errors"])

    def test_invalid_member_reference(self):
        proj = minimal_project()
        proj["members"][0]["start_node"] = "missing"
        resp = client.post("/validate", json=proj)
        data = resp.json()
        assert data["valid"] is False
        assert any("non-existent start_node" in e["message"] for e in data["errors"])

    def test_missing_required_field(self):
        resp = client.post("/validate", json={"name": "Bad"})
        assert resp.status_code == 422  # Pydantic validation error


class TestAnalyzeEndpoint:
    def test_returns_stub(self):
        resp = client.post("/analyze", json=minimal_project())
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "stub"
        assert data["node_count"] == 2
        assert data["member_count"] == 1

    def test_rejects_invalid_body(self):
        resp = client.post("/analyze", json={"bad": True})
        assert resp.status_code == 422
