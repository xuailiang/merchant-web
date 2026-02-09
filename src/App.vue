<template>
  <a-config-provider :theme="themeConfig">
    <RouterView />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { theme as antdTheme } from 'ant-design-vue'
import { themeMode } from './utils/theme'

const themeConfig = computed(() => ({
  token: {
    colorPrimary: '#1f6feb',
    borderRadius: 10,
    fontFamily: '"PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif',
  },
  algorithm: themeMode.value === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
}))
</script>
