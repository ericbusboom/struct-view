---
id: 008
title: Turntable orbit controls
status: done
use-cases: []
depends-on: []
---

# Turntable orbit controls

## Description

Replace the current trackball orbit with Tinkercad-style turntable orbit that
keeps the Z axis pointing up at all times.

The current trackball controls allow the horizon to tilt freely, making it easy
to end up in a disorienting orientation. Turntable orbit avoids this — you can
reach any viewing angle, but it always feels stable.

## Acceptance Criteria

- [ ] Left/right mouse drag rotates around the world Z axis (azimuth)
- [ ] Up/down mouse drag tilts the camera in a vertical plane through the Z axis and screen center (elevation)
- [ ] Z axis stays pointing up at all times — the horizon never tilts
- [ ] Shift + right-click pans
- [ ] Scroll wheel zooms toward cursor
- [ ] Existing TrackballControls component is replaced or reconfigured
- [ ] Camera does not get stuck in any orientation
