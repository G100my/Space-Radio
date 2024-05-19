import { unref, type Ref } from 'vue'

export function usePlusMinusHandler(reactiveTarget: Ref<number>, step: number, minLimit: number, maxLimit: number) {
  return {
    plus() {
      if (reactiveTarget.value + step <= unref(maxLimit)) reactiveTarget.value += step
    },
    minus() {
      if (reactiveTarget.value - step >= unref(minLimit)) reactiveTarget.value -= step
    },
  }
}
