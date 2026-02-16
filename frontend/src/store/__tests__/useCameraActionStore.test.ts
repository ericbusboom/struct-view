import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraActionStore } from '../useCameraActionStore'

describe('useCameraActionStore', () => {
  beforeEach(() => {
    useCameraActionStore.setState({ pendingAction: null })
  })

  it('starts with no pending action', () => {
    expect(useCameraActionStore.getState().pendingAction).toBeNull()
  })

  it('requestAction sets pendingAction', () => {
    const action = {
      position: { x: 1, y: 2, z: 3 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 },
    }
    useCameraActionStore.getState().requestAction(action)
    expect(useCameraActionStore.getState().pendingAction).toEqual(action)
  })

  it('clearAction resets to null', () => {
    useCameraActionStore.getState().requestAction({
      position: { x: 1, y: 2, z: 3 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 },
    })
    useCameraActionStore.getState().clearAction()
    expect(useCameraActionStore.getState().pendingAction).toBeNull()
  })

  it('last requestAction wins', () => {
    const first = {
      position: { x: 1, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 },
    }
    const second = {
      position: { x: 5, y: 5, z: 5 },
      target: { x: 1, y: 1, z: 1 },
      up: { x: 0, y: 0, z: 1 },
    }
    useCameraActionStore.getState().requestAction(first)
    useCameraActionStore.getState().requestAction(second)
    expect(useCameraActionStore.getState().pendingAction).toEqual(second)
  })
})
