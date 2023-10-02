/**
 * Debounce function
 * @param fn Function to debounce
 * @param ms Debounce time in milliseconds
 */
export const debounce = (fn: any, ms = 100) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args as never), ms)
  }
}
