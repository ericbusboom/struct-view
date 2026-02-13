---
status: draft
---

# Sprint 005 Use Cases

## SUC-015: Run structural analysis
Parent: UC-005 (Run server-side analysis and view results)

- **Actor**: User
- **Preconditions**: Model has members with materials/sections, at least one support, and at least one load
- **Main Flow**:
  1. User clicks "Run Analysis".
  2. Frontend validates the model (supports exist, members have properties).
  3. Frontend sends model JSON to the backend API.
  4. Backend translates model to PyNite FEModel3D, runs linear static analysis.
  5. Backend samples results at 21 stations per member.
  6. Backend computes envelope results across all combinations.
  7. Backend returns results JSON.
  8. Frontend stores results and enables visualization controls.
- **Alternate Flow (P-delta)**:
  1. User selects "P-delta analysis" before running.
  2. Backend runs second-order analysis.
  3. If convergence fails, backend returns a specific error message.
- **Postconditions**: Results are available for visualization.
- **Acceptance Criteria**:
  - [ ] Analysis completes for valid models.
  - [ ] Invalid models return clear, actionable error messages.
  - [ ] P-delta convergence failure returns specific error.
  - [ ] Loading indicator shows during analysis.

## SUC-016: Visualize analysis results
Parent: UC-005 (Run server-side analysis and view results)

- **Actor**: User
- **Preconditions**: Analysis has completed successfully
- **Main Flow**:
  1. User selects result type: deflected shape, moment, shear, axial, or reactions.
  2. Selected visualization overlays on the 3D model.
  3. User adjusts exaggeration scale for deflected shape.
  4. User switches between load cases/combinations.
  5. Color scales and magnitude labels aid interpretation.
- **Postconditions**: User understands the structural behavior.
- **Acceptance Criteria**:
  - [ ] Deflected shape uses color gradient from min to max displacement.
  - [ ] Moment and shear diagrams render smoothly along member lengths.
  - [ ] Axial force: red = compression, blue = tension.
  - [ ] Reactions show as arrows with numeric magnitude labels.
  - [ ] Switching result type or case updates immediately.

## SUC-017: Check deflection limits
Parent: UC-006 (Define deflection limits and identify over-limit members)

- **Actor**: User
- **Preconditions**: Analysis results are available
- **Main Flow**:
  1. User opens deflection limit settings.
  2. User specifies limits per member group or globally (e.g., L/240, L/360).
  3. System evaluates each member's max deflection against its limit.
  4. Over-limit members are highlighted in red.
  5. Summary table lists all over-limit members with deflection and limit values.
- **Postconditions**: User knows which members need attention.
- **Acceptance Criteria**:
  - [ ] Limit check uses correct member length for L/N calculation.
  - [ ] Over-limit members are clearly highlighted in the viewport.
  - [ ] Summary table is sortable and clicking a row selects the member.
