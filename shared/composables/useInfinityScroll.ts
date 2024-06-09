import { nextTick, onMounted, onUnmounted, ref, type ComputedRef } from 'vue'

interface UseInfinityScrollParams {
  containerID: string
  fetchCallback: (...args: any[]) => any
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
  let infinityContainer: HTMLElement | null = null
  let ScrollObserver: IntersectionObserver
  let target: Element | null | undefined
  const isLoading = ref(false)

  function observeLastElement() {
    target = infinityContainer!.lastElementChild
    if (!target) throw new Error('can not found the last element in the container')
    ScrollObserver.observe(target)
  }
  function nexthandler() {
    isLoading.value = true
    if (target) ScrollObserver.unobserve(target)
    fetchCallback().then(() => {
      isLoading.value = false
      if (nextCondition.value) nextTick(observeLastElement)
    })
  }

  onMounted(() => {
    infinityContainer = document.getElementById(containerID)
    if (infinityContainer === null) throw new Error(`can not found the element with '${containerID}' id.`)

    if (fetchFirstCallback) {
      fetchFirstCallback().then(() => {
        nextTick(observeLastElement)
      })
    } else {
      const mutationObserver = new MutationObserver(() => {
        nextTick(observeLastElement)
        mutationObserver.disconnect()
      })
      mutationObserver.observe(infinityContainer, mutationOptions)
    }
    const observerOptions = {
      root: infinityContainer,
      rootMargin: '0px',
      threshold: 0.5,
    }
    const callback: IntersectionObserverCallback = ([entry]) => {
      console.log('🚀 ~ onMounted ~ entry:', entry)
      if (entry.isIntersecting && !isLoading.value) nexthandler()
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
