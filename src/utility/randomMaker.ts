export function roomKeyMaker() {
  return Array.from(window.crypto.getRandomValues(new Uint32Array(2)), item => item.toString(16)).join('')
}
