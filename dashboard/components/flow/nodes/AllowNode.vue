<template>
  <div class="allow-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-content">
      <div class="node-icon">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="node-text">
        <div class="node-title">Allow Request</div>
        <div class="node-subtitle">Forward to AI provider</div>
      </div>
    </div>

    <!-- Terminal node -->
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: any
}>()
</script>

<style scoped>
.allow-node {
  @apply bg-gray-900/95 border border-emerald-500/40 rounded-xl px-4 py-3 min-w-[180px];
  @apply shadow-lg shadow-emerald-500/10;
}

.node-content {
  @apply flex items-center gap-3;
}

.node-icon {
  @apply w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400;
}

.node-title {
  @apply text-sm font-medium text-white;
}

.node-subtitle {
  @apply text-xs text-gray-500;
}

.handle-top {
  @apply !bg-emerald-400 !border-2 !border-gray-900 !w-3 !h-3;
}
</style>

