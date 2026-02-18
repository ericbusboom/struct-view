/** Lightweight tracker for currently-held keyboard keys (no re-renders). */
export const pressedKeys = new Set<string>()

/** Last known cursor position (client coordinates). */
export const cursorPosition = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => pressedKeys.add(e.key.toLowerCase()))
  window.addEventListener('keyup', (e) => pressedKeys.delete(e.key.toLowerCase()))
  window.addEventListener('blur', () => pressedKeys.clear())
  window.addEventListener('pointermove', (e) => {
    cursorPosition.x = e.clientX
    cursorPosition.y = e.clientY
  })
}
