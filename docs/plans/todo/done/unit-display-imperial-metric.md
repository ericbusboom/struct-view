---
status: done
sprint: '007'
---

# Unit display: imperial and metric with round-tripping

Spec Section 12.2: "The UI supports both imperial and metric input/display. When the user enters imperial values, the original imperial value is stored alongside the metric conversion so that round-tripping is exact."

This is not implemented anywhere. Currently all values are raw numbers with no unit awareness.

- Per-project display unit preference (metric or imperial)
- Input fields accept both unit systems
- Store original imperial value alongside metric conversion
- Display coordinates, lengths, and properties in the chosen unit system
- Coordinate display in 2D and 3D editors should respect this setting
