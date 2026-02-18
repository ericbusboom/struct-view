import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { createNode } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { snapToPlaneGrid } from '../editor3d/planeSnap'
import { snapPoint3D } from '../editor3d/snap3d'
import { cursorPosition } from '../utils/pressedKeys'

const _raycaster = new THREE.Raycaster()
const _ndc = new THREE.Vector2()
const _intersect = new THREE.Vector3()
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) // Z-up ground

/**
 * Listens for the N key and places a node at the cursor position,
 * projected onto the active work plane or ground plane.
 */
export default function NodePlacer() {
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key.toLowerCase() !== 'n') return

      const rect = gl.domElement.getBoundingClientRect()
      // Check if cursor is over the viewport
      if (
        cursorPosition.x < rect.left ||
        cursorPosition.x > rect.right ||
        cursorPosition.y < rect.top ||
        cursorPosition.y > rect.bottom
      ) return

      _ndc.set(
        ((cursorPosition.x - rect.left) / rect.width) * 2 - 1,
        -((cursorPosition.y - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_ndc, camera)

      const workPlane = usePlaneStore.getState().activePlane
      const isFocused = usePlaneStore.getState().isFocused
      const snapGridSize = useSettingsStore.getState().snapGridSize
      const nodes = useModelStore.getState().nodes
      const members = useModelStore.getState().members

      let position: { x: number; y: number; z: number }

      if (isFocused && workPlane) {
        // Project onto the work plane
        const threePlane = new THREE.Plane()
        const normal = new THREE.Vector3(workPlane.normal.x, workPlane.normal.y, workPlane.normal.z)
        const point = new THREE.Vector3(workPlane.point.x, workPlane.point.y, workPlane.point.z)
        threePlane.setFromNormalAndCoplanarPoint(normal, point)

        if (!_raycaster.ray.intersectPlane(threePlane, _intersect)) return

        position = snapToPlaneGrid(
          { x: _intersect.x, y: _intersect.y, z: _intersect.z },
          workPlane,
          snapGridSize,
        )
      } else {
        // Project onto the ground plane (Z = 0)
        if (!_raycaster.ray.intersectPlane(_groundPlane, _intersect)) return

        const cursor = { x: _intersect.x, y: _intersect.y, z: 0 }
        const snapped = snapPoint3D(cursor, nodes, members, {
          snapRadius: snapGridSize / 2,
          gridSize: snapGridSize,
        })
        position = snapped.point
      }

      const node = createNode({ position })
      useModelStore.getState().addNode(node)
      useEditorStore.getState().select(node.id, 'node')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [camera, gl])

  return null
}
