---
status: draft
---

# Sprint 006 Use Cases

## SUC-018: Automate model changes via MCP/AI
Parent: UC-007 (Automate model changes via per-project MCP server)

- **Actor**: AI Client (Claude or similar, via MCP)
- **Preconditions**: Project has an active MCP server endpoint
- **Main Flow**:
  1. User adds the project's MCP endpoint to their AI client.
  2. User issues a natural language command (e.g., "Make all vertical wall studs 2x4 Douglas Fir on 16-inch centers").
  3. AI client calls MCP tools: list_members, set_member_properties, auto_layout, etc.
  4. MCP server validates inputs and applies mutations to the model.
  5. Frontend reflects changes in real time.
- **Postconditions**: Model is updated per the AI-driven operations.
- **Acceptance Criteria**:
  - [ ] MCP tools cover geometry, property, load, and analysis operations.
  - [ ] Each tool validates inputs and returns structured success/error responses.
  - [ ] Frontend updates in real time as MCP mutations occur.
  - [ ] Spec Section 5 example interaction works end-to-end.

## SUC-019: Undo and redo model changes
Parent: UC-008 (All model mutations are undoable/redoable)

- **Actor**: User
- **Preconditions**: At least one model mutation has been performed
- **Main Flow**:
  1. User performs a mutation (add node, assign material, apply load, etc.).
  2. User presses Ctrl+Z — last mutation is reversed.
  3. User presses Ctrl+Shift+Z — undone mutation is reapplied.
  4. Works for both UI and MCP-driven mutations.
- **Postconditions**: Model state matches expected position in command history.
- **Acceptance Criteria**:
  - [ ] Every mutation type is undoable.
  - [ ] Undo/redo preserves complete model state.
  - [ ] Command stack bounded to 100 operations.
  - [ ] MCP mutations appear in the same undo stack as UI mutations.

## SUC-020: Guard against invalid model states
Parent: UC-008 (All model mutations are undoable/redoable)

- **Actor**: User or AI Client
- **Preconditions**: An operation would create an invalid state
- **Main Flow**:
  1. Attempt to create a non-planar panel -> rejected with warning.
  2. Attempt to import overly complex STL -> rejected with guidance.
  3. Attempt to run analysis on incomplete model -> validation errors returned.
- **Postconditions**: Model remains valid.
- **Acceptance Criteria**:
  - [ ] Non-planar panel creation rejected (not silently accepted).
  - [ ] STL complexity limit enforced consistently.
  - [ ] Analysis validation: supports exist, members have properties, connectivity verified.

## SUC-021: Query analysis results via MCP
Parent: UC-007 (Automate model changes via per-project MCP server)

- **Actor**: AI Client
- **Preconditions**: Analysis has been run
- **Main Flow**:
  1. AI calls `trigger_analysis` to run analysis.
  2. AI calls `get_max_deflection` for worst-case deflection.
  3. AI calls `get_critical_members` for members near capacity.
  4. AI calls `check_limits` against user-defined limits.
  5. AI calls `get_reactions` for support reactions.
- **Postconditions**: AI has structured result data to report.
- **Acceptance Criteria**:
  - [ ] All query tools return structured JSON.
  - [ ] Results match frontend display.
  - [ ] Queries work per case/combination or for envelope.
