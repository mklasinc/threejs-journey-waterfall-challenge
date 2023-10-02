const map = (x: number, a: number, b: number, c: number, d: number) => ((x - a) * (d - c)) / (b - a) + c

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

/**
 * From 14islands/lerp
 * Drop-in replacement of standard lerp with optional frame delta and target fps
 * to maintain constant animation speed at various fps
 *
 * Based on http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
 *
 * @param {number} source Current value
 * @param {number} target Value to lerp towards
 * @param {number} rate Interpolation rate
 * @param {number} frameDelta Optional frame delta time in *seconds*. Should be 1/60 for a steady 60fps.
 * @param {number} targetFps Optional, target is 60 by default
 * @returns {number} interpolated value
 */

function damp(source: number, target: number, rate: number, frameDelta?: number, targetFps = 60) {
  // return normal lerp if no delta was passed
  if (typeof frameDelta === 'undefined') {
    return lerp(source, target, rate)
  }

  const relativeDelta = frameDelta / (1 / targetFps)
  const smoothing = 1 - rate
  return lerp(source, target, 1 - Math.pow(smoothing, relativeDelta))
}

const clamp = (num: number, min: number, max: number) => (num <= min ? min : num >= max ? max : num)

const mod = (x: number, y: number) => {
  return x - y * Math.floor(x / y)
}

function mapRange(in_min: number, in_max: number, input: number, out_min: number, out_max: number) {
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

// Copied from React UseGesture
// Based on @aholachek
// https://twitter.com/chpwn/status/285540192096497664
// iOS constant = 0.55

// https://medium.com/@nathangitter/building-fluid-interfaces-ios-swift-9732bb934bf5

function rubberband(distance: number, dimension: number, constant: number) {
  if (dimension === 0 || Math.abs(dimension) === Number.POSITIVE_INFINITY) return Math.pow(distance, constant * 5)
  return (distance * dimension * constant) / (dimension + constant * distance)
}

export function rubberbandIfOutOfBounds(position: number, min: number, max: number, constant = 0.15) {
  if (constant === 0) return clamp(position, min, max)
  if (position < min) return -rubberband(min - position, max - min, constant) + min
  if (position > max) return +rubberband(position - max, max - min, constant) + max
  return position
}

/**
 * Normalize a given value against the given dimension
 * @param value - the value to normalize
 * @param dimension - the dimension to normalize against
 * @returns value between -1 and 1
 */
const normalize = (value: number, dimension: number) => {
  return (value / dimension) * 2 - 1
}

const closestAngle = (from: number, to: number) => {
  return from + ((((to - from) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
}

function roundTo(number: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(number * factor) / factor
}

const math = {
  map,
  lerp,
  damp,
  clamp,
  normalize,
  closestAngle,
  roundTo,
}

export { map, lerp, damp, clamp, mod, normalize, closestAngle, roundTo }
export default math
