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
  type Plugin,
  type RenderFunction,
} from 'vue'
import CloseIcon from './CloseIcon.vue'

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
let currentLoadingComponent: Component
const generateDefaultLoadingComponent: RenderFunction = () =>
  h('div', { class: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center' }, 'Loading...')

//---

type LevelType = 'success' | 'danger'
const snackbarStack = reactive<VNode[]>([])
let currentLevelStyleMap: { [key in LevelType]: string }
const defaultLevelStyleMap: { [key in LevelType]: string } = {
  danger: 'bg-system-error1',
  success: 'bg-secondary',
}

let currentSnackbar: VNode | Component | ReturnType<typeof defineComponent>
interface DefaultSnackbarProps {
  message: string
  onClear: (...args: any) => any
}
function DefaultSnackbarFuncionalComponent(props: DefaultSnackbarProps) {
  return h(
    'div',
    {
      class:
        'w-full sm:w-fit mx-auto min-h-[40px] max-w-[90vw] container rounded px-2 sm:px-4 py-2.5 text-center text-white flex gap-x-4 items-center',
    },
    [props.message, h('button', { onClick: props.onClear }, [h(CloseIcon)])]
  )
}

export function useSnackbar(
  message: string,
  type: LevelType,
  options?: { onClick?: (...arg: any) => any; duration?: number }
) {
  const clear = setTimeout(() => {
    if (typeof currentIndex === 'number') {
      snackbarStack.splice(currentIndex, 1)
      console.log('clear')
    }
  }, options?.duration ?? 5000)

  const currentIndex =
    snackbarStack.push(
      h(currentSnackbar, {
        key: Date.now(),
        class: currentLevelStyleMap[type],
        message,
        onClick: options?.onClick,
        onClear: () => {
          clearTimeout(clear)
          snackbarStack.splice(currentIndex, 1)
        },
      })
    ) - 1
}

// ---

const showAlert = ref(false)
let currentAlertComponent: Component
function DefaultSimpleAlert(props: { message: string }) {
  return h('div', { class: 'bg-white p-4 rounded max-w-xs flex items-center w-full' }, props.message)
}
export function useAlert(content: string): { open: () => void; close: () => void }
export function useAlert(content: Component): { open: () => void; close: () => void }
export function useAlert(content: Component | string): { open: () => void; close: () => void } {
  currentAlertComponent = typeof content === 'string' ? DefaultSimpleAlert({ message: content }) : content
  return {
    open: () => {
      showAlert.value = true
    },
    close: () => {
      showAlert.value = false
    },
  }
}
// ---

interface ComponentType {
  loading?: true | Component
  snackbar?:
    | true
    | {
        component: Component<DefaultSnackbarProps>
        levelStyleMap?: { [key in LevelType]: string }
      }
  alert?: true
}
function createVM({ loading, snackbar, alert }: ComponentType) {
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
        showModal: showAlert,
      }
    },
    render() {
      const components = []
      if (snackbar) {
        if (typeof snackbar === 'boolean') {
          currentSnackbar = DefaultSnackbarFuncionalComponent
          currentLevelStyleMap = defaultLevelStyleMap
        } else {
          currentSnackbar = snackbar.component
          currentLevelStyleMap = snackbar.levelStyleMap ?? defaultLevelStyleMap
        }
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
      if (loading || alert) {
        if (loading) {
          if (typeof loading === 'boolean') {
            currentLoadingComponent = generateDefaultLoadingComponent
          } else {
            currentLoadingComponent = loading
          }
        }

        components.push(
          h(
            Transition,
            {
              enterActiveClass: 'transition-opacity duration-150',
              leaveActiveClass: 'transition-opacity duration-150',
              enterFromClass: 'opacity-0',
              leaveToClass: 'opacity-0',
            },
            () => [
              this.showModal
                ? h(
                    'div',
                    {
                      class: 'fixed inset-0 bg-slate-900/20 flex items-center justify-center',
                      onClick: () => (showAlert.value = false),
                    },
                    h(currentAlertComponent, { key: 'ModalContent' })
                  )
                : undefined,
              this.showLoading ? h(currentLoadingComponent, { key: 'LoadingContent' }) : undefined,
            ]
          )
        )
      }

      return components
    },
  })

  vm = createApp(rootComponent).mount(rootElement)
}

// ---

export const GlobalComponentPlugin: Plugin = {
  install: (_app, options: Parameters<typeof createVM>[0]) => createVM(options),
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.useLoading = useLoading
  // @ts-ignore
  window.useSnackbar = useSnackbar
  // @ts-ignore
  window.useModal = useAlert
}
