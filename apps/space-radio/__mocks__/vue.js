const computed = callback => {
  return { value: callback() }
}
const ref = (...args) => ({ value: args })
const watch = (...args) => {
  console.log('watch', args)
}
const unref = (...args) => args

export { computed, ref, watch, unref }
