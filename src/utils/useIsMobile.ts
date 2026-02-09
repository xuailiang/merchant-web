import { onBeforeUnmount, onMounted, ref } from 'vue'

export const useIsMobile = (breakpoint = 768) => {
  const isMobile = ref(false)

  const update = () => {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return isMobile
}
