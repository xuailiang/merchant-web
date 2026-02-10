import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Modal } from 'ant-design-vue'

type Options = {
  message?: string
  okText?: string
  cancelText?: string
}

export const useDirtyGuard = (dirty: Ref<boolean>, options: Options = {}) => {
  const {
    message = '页面内容未保存，确认离开吗？',
    okText = '确认离开',
    cancelText = '继续编辑',
  } = options

  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
  })

  onBeforeRouteLeave(() => {
    if (!dirty.value) return true
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: '未保存的更改',
        content: message,
        okText,
        cancelText,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  })
}
