import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UnitSystem = 'imperial' | 'metric'

export interface SettingsState {
  unitSystem: UnitSystem
  snapGridSize: number
  gridLineSpacing: number
  workPlaneSize: number
  snapEnabled: boolean

  setUnitSystem: (u: UnitSystem) => void
  setSnapGridSize: (s: number) => void
  setGridLineSpacing: (s: number) => void
  setWorkPlaneSize: (s: number) => void
  setSnapEnabled: (b: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      unitSystem: 'imperial',
      snapGridSize: 1,        // 1 ft for imperial
      gridLineSpacing: 5,     // major grid line every 5 units
      workPlaneSize: 20,      // 20 ft work plane
      snapEnabled: true,

      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setSnapGridSize: (snapGridSize) => set({ snapGridSize }),
      setGridLineSpacing: (gridLineSpacing) => set({ gridLineSpacing }),
      setWorkPlaneSize: (workPlaneSize) => set({ workPlaneSize }),
      setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
    }),
    { name: 'structview-settings' },
  ),
)
