---
covers: ["001", "002", "003"]
---

# Plan: Tickets 001-003 — Plane Rotation with Acceleration, Snap, and Tangent Tracking

## Approach

Tickets 001-003 are tightly coupled and implemented together:
1. **Rotation math** (`planeRotation.ts`) — Rodrigues rotation applied to the
   full orthonormal frame (normal + tangentU + tangentV), plus 15-degree snap.
2. **Keyboard handling** (modify `KeyboardHandler.tsx`) — Track arrow key
   state, run requestAnimationFrame loop for smooth acceleration.
3. **Store integration** — Call `usePlaneStore.updatePlane()` with the rotated plane.

### Rotation Logic

- `rodriguesRotate(v, axis, angleDeg)` — Rotate vector v around axis by angle.
- `rotatePlane(plane, axis, angleDeg)` — Apply same rotation to normal, tangentU,
  tangentV simultaneously. This is the gimbal-lock-free incremental update.
- Rotation axes for point-constrained planes:
  - Left/Right → rotate around tangentV (vertical axis in plane view)
  - Up/Down → rotate around tangentU (horizontal axis in plane view)
- Line-constrained planes: rotation only around the constraint line direction.
- Fully-constrained planes: no rotation.

### 15-Degree Snap

After applying rotation, check if the normal's angle to the nearest 15-degree
reference direction is within 1 degree. If so, snap the entire frame to the
exact 15-degree orientation using the reference normal and recomputed tangents.

Reference directions: generate from rotations of the three world axes in
15-degree increments. In practice, we check the angle between the rotated
normal and each world axis — if the angle is within 1 degree of a 15-degree
multiple, snap.

### Acceleration Curve

- Track hold duration per key
- Speed = min(5, 0.1 + holdDuration * 4.9) deg/sec (linear ramp over 1 second)
- Single tap (dt ≈ 16ms): 0.1 * 0.016 ≈ 0.002 degrees per frame → small rotation
- Actually for a tap we want ~0.1 degrees total. Use a minimum step: max(speed * dt, 0.1) on first frame, then speed * dt after.

Revised: On first frame of key press, apply 0.1 degrees. Then ramp speed.

## Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `editor3d/planeRotation.ts` | New | rodriguesRotate, rotatePlane, snapPlane |
| `editor3d/__tests__/planeRotation.test.ts` | New | Unit tests |
| `components/KeyboardHandler.tsx` | Modify | Arrow key state + rAF rotation loop |

## Testing Plan

- **Unit tests** (`editor3d/__tests__/planeRotation.test.ts`):
  - rodriguesRotate: 90° around Z rotates X→Y, 180° around Z rotates X→-X
  - rotatePlane: preserves orthonormality, 360° round-trip
  - snapPlane: snaps within threshold, doesn't snap outside
  - Rotation axis selection by constraint type
- **Regression**: All existing 243 tests pass

## Documentation Updates

None needed — sprint docs already describe the feature.
