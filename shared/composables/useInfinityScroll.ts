import { nextTick, onMounted, ref, type ComputedRef, onUnmounted } from 'vue'

interface UseInfinityScrollParams {
  containerID: string
  fetchCallback: (...args: any[]) => any
  nextCondition: ComputedRef<boolean>
  onUnmountedCallback?: (...args: any[]) => void
  fetchFirstCallback?: (...args: any[]) => Promise<void>
  mutationOptions?: MutationObserverInit
}

const defaultmMutationObserverConfig = { childList: true, subtree: true }

export function useInfinityScroll({
  containerID,
  fetchCallback,
  nextCondition,
  mutationOptions = defaultmMutationObserverConfig,
}: UseInfinityScrollParams) {
  let infinityContainer: HTMLElement | null = null
  let scrollObserver: IntersectionObserver
  let target: Element | null | undefined
  let mutationObserver: MutationObserver
  const isLoading = ref(false)

  function observeLastElement() {
    if (target) scrollObserver.unobserve(target)

    target = infinityContainer!.lastElementChild

    if (target) scrollObserver.observe(target)
    else console.warn('can not found the last element in the container')
  }
  function nexthandler() {
    if (import.meta.env.DEV) console.log('active next handler')

    isLoading.value = true
    if (target) scrollObserver.unobserve(target)
    fetchCallback().then(() => {
      isLoading.value = false
      if (nextCondition.value) nextTick(observeLastElement)
    })
  }

  onMounted(() => {
    infinityContainer = document.getElementById(containerID)
    if (infinityContainer === null) throw new Error(`can not found the element with '${containerID}' id.`)

    mutationObserver = new MutationObserver(() => {
      if (import.meta.env.DEV) console.log('mutationObserver callback')
      nextTick(observeLastElement)
    })
    mutationObserver.observe(infinityContainer, mutationOptions)
    const observerOptions = {
      root: infinityContainer,
      rootMargin: '0px',
      threshold: 0.5,
    }
    scrollObserver = new IntersectionObserver(([entry]) => {
      if (import.meta.env.DEV) console.log('scrollObserver callback')
      if (entry.isIntersecting && !isLoading.value) nexthandler()
    }, observerOptions)
  })

  function destory() {
    scrollObserver.disconnect()
    mutationObserver.disconnect()
  }
  onUnmounted(() => {
    destory()
  })

  return {
    isLoading,
  }
}
