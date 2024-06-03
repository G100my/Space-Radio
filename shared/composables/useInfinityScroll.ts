import { nextTick, onMounted, onUnmounted, ref, type ComputedRef } from 'vue'

interface UseInfinityScrollParams {
  containerID: string
  fetchCallback: (...args: any[]) => Promise<void>
  nextCondition: ComputedRef<boolean>
  onUnmountedCallback?: (...args: any[]) => void
  fetchFirstCallback?: (...args: any[]) => Promise<void>
  mutationOptions?: MutationObserverInit
}

const defaultmMutationObserverConfig = { childList: true }

export function useInfinityScroll({
  containerID,
  fetchCallback,
  nextCondition,
  onUnmountedCallback,
  fetchFirstCallback,
  mutationOptions = defaultmMutationObserverConfig,
}: UseInfinityScrollParams) {
  const infinityContainer = ref<HTMLElement | null>()
  let ScrollObserver: IntersectionObserver
  let target: Element | null | undefined
  const isLoading = ref(false)

  function observeLastElement() {
    target = infinityContainer.value?.lastElementChild
    try {
      // @ts-expect-error
      ScrollObserver.observe(target)
    } catch (error) {
      console.error(error)
    }
  }
  function nextCallback() {
    isLoading.value = false
    if (nextCondition.value) nextTick(observeLastElement)
  }
  function nexthandler() {
    if (target) ScrollObserver.unobserve(target)
    isLoading.value = true
    fetchCallback().then(nextCallback)
  }

  onMounted(() => {
    infinityContainer.value = document.getElementById(containerID)
    if (infinityContainer.value === null) throw new Error(`can not found the element with '${containerID}' id.`)

    if (fetchFirstCallback) {
      fetchFirstCallback().then(() => {
        nextTick(observeLastElement)
      })
    } else {
      const mutationObserver = new MutationObserver(() => {
        nextTick(observeLastElement)
        mutationObserver.disconnect()
      })
      mutationObserver.observe(infinityContainer.value, mutationOptions)
    }
    const observerOptions = {
      root: infinityContainer.value,
      rootMargin: '0px',
      threshold: 0.5,
    }
    const callback: IntersectionObserverCallback = ([entry]) => {
      if (entry.isIntersecting) nexthandler()
    }
    ScrollObserver = new IntersectionObserver(callback, observerOptions)
  })
  onUnmounted(() => {
    onUnmountedCallback && onUnmountedCallback()
  })
  return {
    isLoading,
  }
}
