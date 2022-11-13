import { isRef, nextTick, onMounted, onUnmounted, ref } from 'vue'

interface UseInfinityScrollParams {}
export function useInfinityScroll({ id, fetchCallback, nextURL, onUnmountedCallback, fetchFirstCallback }) {
  if (!isRef(nextURL)) {
    console.error(`nextURL is not ref`, nextURL)
  }

  /**
   * @type HTMLElement
   */
  const infinityContainer = ref(null)
  let ScrollObserver
  let target
  const isLoading = ref(false)

  const mutationObserverConfig = { childList: true }
  function observeLastElement() {
    target = infinityContainer.value.lastElementChild
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
    infinityContainer.value = document.getElementById(id)
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
    const callback = ([entry]) => {
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
