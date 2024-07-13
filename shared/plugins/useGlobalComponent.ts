import {
  createApp,
  defineComponent,
  h,
  reactive,
  ref,
  Transition,
  TransitionGroup,
  type VNode,
  type Component,
  type ComponentPublicInstance,
} from 'vue'

const rootElementID = 'global_component_root'
let vm: ComponentPublicInstance

// ---

const showLoading = ref(false)
function on(message?: string) {
  showLoading.value = true
  if (import.meta.env.DEV) console.warn('loading on', message ?? '')
  return Promise.resolve()
}
function off(message?: string) {
  showLoading.value = false
  if (import.meta.env.DEV) console.warn('loading off', message ?? '')
  return Promise.resolve()
}
export function useLoading() {
  return {
    on,
    off,
    isOn: () => showLoading.value,
  }
}

//---

type LevelType = 'success' | 'danger'
const snackbarStack = reactive<VNode[]>([])
const levelStyleMap: { [key in LevelType]: string } = {
  danger: 'bg-system-error1',
  success: 'bg-secondary',
}
const closeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>'
export function useSnackbar({
  message,
  onClick,
  duration = 5000,
}: {
  message: string
  onClick?: (...arg: any) => any
  duration?: number
}) {
  let currentIndex: number
  const clear = setTimeout(() => {
    if (typeof currentIndex === 'number') snackbarStack.splice(currentIndex, 1)
  }, duration)

  const generateSnackbar = (styleClass: string) =>
    h(
      'div',
      {
        key: Date.now(),
        class: [
          'w-full sm:w-fit mx-auto min-h-[40px] max-w-[90vw] container rounded px-2 sm:px-4 py-2.5 text-center text-white flex gap-x-4 items-center',
          styleClass,
        ],
        onClick: clear && onClick,
      },
      [message, h('button', { onClick: () => snackbarStack.splice(currentIndex, 1) }, [closeIcon])]
    )

  return {
    danger: () => (currentIndex = snackbarStack.push(generateSnackbar(levelStyleMap.danger))),
    success: () => (currentIndex = snackbarStack.push(generateSnackbar(levelStyleMap.success))),
  }
}

// ---

type ComponentType = 'loading' | 'snackbar'
function createVM({
  loading,
  snackbar,
}: {
  [key in ComponentType]?: Component | VNode
}) {
  if (vm) return
  const rootElement = document.createElement('div')
  rootElement.id = rootElementID
  rootElement.classList.add('z-[9999]', 'relative')
  document.body.appendChild(rootElement)

  const rootComponent = defineComponent({
    name: rootElementID,
    setup() {
      return {
        showLoading,
        snackbarStack,
      }
    },
    render() {
      const components = []
      if (loading) {
        components.push(
          h(
            Transition,
            {
              enterActiveClass: 'transition-opacity duration-150',
              leaveActiveClass: 'transition-opacity duration-150',
              enterFromClass: 'opacity-0',
              leaveToClass: 'opacity-0',
            },
            () => (this.showLoading ? h(loading, { key: 'LoadingContent' }) : undefined)
          )
        )
      }
      if (snackbar) {
        components.push(
          h(
            TransitionGroup,
            {
              tag: 'div',
              class: 'fixed bottom-3 inset-x-0 space-y-1 z-50',
              name: 'RootTransition',
              moveClass: 'transition-all',
              enterActiveClass: 'transition-all',
              leaveActiveClass: 'transition-all absolute left-0 w-fit right-0',
              enterFromClass: 'opacity-0 translate-y-4',
              leaveToClass: 'opacity-0 translate-y-4',
            },
            () => snackbarStack
          )
        )
      }
      return components
    },
  })

  vm = createApp(rootComponent).mount(rootElement)
}

// ---

export const GlobalComponentPlugin = {
  install: createVM,
}
