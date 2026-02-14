---
id: '003'
title: 3D viewport with camera controls
status: done
use-cases:
- SUC-003
depends-on:
- '001'
---

# 3D viewport with camera controls

## Description

Implement the base Three.js 3D viewport as a React component. The viewport should fill the main content area and provide orbit, pan, and zoom camera controls. This is the container that all subsequent rendering (nodes, members, results) will live inside.

## Implementation Notes

- Use @react-three/fiber for React-Three.js integration
- Use @react-three/drei's OrbitControls for camera interaction
- Set up a scene with:
  - Ambient light + directional light for visibility
  - Ground grid or axis helper for spatial orientation
  - Reasonable default camera position (looking at origin from isometric-ish angle)
- Responsive: viewport resizes with the browser window
- Background color: dark gray or similar neutral for contrast

## Acceptance Criteria

- [ ] Three.js canvas renders in the browser filling the main area
- [ ] User can orbit (left-drag), pan (right-drag or middle-drag), and zoom (scroll)
- [ ] Grid or axis helper visible for spatial reference
- [ ] Viewport resizes correctly when browser window changes size
- [ ] No console errors on load

## Testing

- **Existing tests to run**: Build check from ticket 001
- **New tests to write**: Component renders without errors (React Testing Library smoke test)
- **Verification command**: `npm test`
