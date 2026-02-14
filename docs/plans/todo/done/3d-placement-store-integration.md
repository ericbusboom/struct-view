---
status: done
sprint: '007'
---

# 3D placement store integration

The `placeShape` and `mergeCoincidentNodes` functions exist as pure logic but are not wired into the model store. When a user places a shape, the resulting nodes and members need to be added to `useModelStore` and appear in the 3D viewport.

- Wire placeShape output into addNode/addMember calls
- Run mergeCoincidentNodes against existing model nodes
- Apply node remapping to new members
- Update the 3D scene reactively after placement
