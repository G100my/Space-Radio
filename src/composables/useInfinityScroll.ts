import { isRef, nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'

interface UseInfinityScrollParams {
  id: string
  fetchCallback: (...args: any[]) => Promise<void>
  nextURL: Ref<string>
  onUnmountedCallback: (...args: any[]) => void
  fetchFirstCallback: (...args: any[]) => Promise<void>
}
export function useInfinityScroll({
  id,
  fetchCallback,
  nextURL,
  onUnmountedCallback,
  fetchFirstCallback,
}: UseInfinityScrollParams) {
  if (!isRef(nextURL)) {
    console.error(`nextURL is not ref`, nextURL)
  }

  /**
   * @type HTMLElement
   */
  const infinityContainer = ref<HTMLElement>()
  let ScrollObserver: IntersectionObserver
  let target: Element | null | undefined
  const isLoading = ref(false)

  const mutationObserverConfig = { childList: true }
  function observeLastElement() {
    target = infinityContainer.value?.lastElementChild
    if (target) ScrollObserver.observe(target)
    else {
      console.error('target element is not a Element', target)
    }
  }
  function nextCallback() {
    isLoading.value = false
    if (nextURL.value) nextTick(observeLastElement)
  }
  function nexthandler() {
    if (target) ScrollObserver.unobserve(target)
    isLoading.value = true
    fetchCallback().then(nextCallback)
  }

  onMounted(() => {
    const container = document.getElementById(id)
    if (container === null) throw new Error(`can not found element with '${id}' id.`)
    infinityContainer.value = container

    if (fetchFirstCallback) {
      fetchFirstCallback().then(() => {
        nextTick(observeLastElement)
      })
    } else {
      const mutationObserver = new MutationObserver(() => {
        nextTick(observeLastElement)
        mutationObserver.disconnect()
      })
      mutationObserver.observe(infinityContainer.value, mutationObserverConfig)
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
