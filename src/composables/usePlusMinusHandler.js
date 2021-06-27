import { unref } from 'vue'

export function usePlusMinusHandler(reactiveTarget, step, minLimit, maxLimit) {
  return {
    plus() {
      if (reactiveTarget.value + step <= unref(maxLimit)) reactiveTarget.value += step
    },
    minus() {
      if (reactiveTarget.value - step >= unref(minLimit)) reactiveTarget.value -= step
    },
  }
}
