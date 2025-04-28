export function containsJavaScript(str) {
  const regex = /javascript/i
  return regex.test(str)
}
