import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'

export const useDecorPreview = (canvasRef: Ref<HTMLElement | null>) => {
  const autoScroll = ref(false)
  const snapshotFlash = ref(false)
  let timer: number | null = null

  const stopAutoScroll = () => {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
    autoScroll.value = false
  }

  const startAutoScroll = () => {
    if (!canvasRef.value || timer) return
    timer = window.setInterval(() => {
      const el = canvasRef.value
      if (!el) return
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      if (el.scrollTop >= maxScroll - 1) {
        el.scrollTop = 0
      } else {
        el.scrollTop += 2
      }
    }, 24)
  }

  const toggleAutoScroll = () => {
    if (autoScroll.value) {
      stopAutoScroll()
      return
    }
    autoScroll.value = true
    startAutoScroll()
  }

  const triggerSnapshot = () => {
    snapshotFlash.value = true
    window.setTimeout(() => {
      snapshotFlash.value = false
    }, 280)
  }

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      stopAutoScroll()
      return
    }
    await nextTick()
    if (canvasRef.value) canvasRef.value.scrollTop = 0
  }

  onBeforeUnmount(() => {
    stopAutoScroll()
  })

  return {
    autoScroll,
    snapshotFlash,
    toggleAutoScroll,
    triggerSnapshot,
    handleOpenChange,
    stopAutoScroll,
  }
}
