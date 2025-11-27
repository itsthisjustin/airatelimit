<template>
  <div class="limit-response-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">LIMIT RESPONSE</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
      
      <div class="config">
        <textarea 
          v-model="data.message" 
          class="config-textarea"
          placeholder="Rate limit exceeded..."
          rows="2"
        />
        <label class="config-checkbox">
          <input type="checkbox" v-model="data.includeUpgradeUrl" />
          <span>Include upgrade link</span>
        </label>
      </div>
    </div>

    <!-- Terminal node -->
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: { 
    message: string
    includeUpgradeUrl: boolean
  }
}>()
</script>

<style scoped>
.limit-response-node {
  @apply relative bg-gray-900/95 border border-rose-500/40 rounded-xl px-4 py-3 min-w-[220px];
  @apply shadow-lg shadow-rose-500/10;
}

.node-badge {
  @apply absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold;
  @apply bg-rose-500 text-white rounded-full tracking-wider whitespace-nowrap;
}

.node-content {
  @apply flex items-start gap-3 mt-2;
}

.node-icon {
  @apply w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0;
}

.config {
  @apply flex flex-col gap-2 flex-1;
}

.config-textarea {
  @apply bg-gray-800/80 border border-gray-700/50 rounded-md px-2 py-1.5 text-white text-xs w-full resize-none;
  @apply focus:outline-none focus:border-rose-500/50;
}

.config-checkbox {
  @apply flex items-center gap-2 text-xs text-gray-400 cursor-pointer;
}

.config-checkbox input {
  @apply rounded border-gray-600 bg-gray-800 text-rose-500 focus:ring-rose-500/50;
}

.handle-top {
  @apply !bg-rose-400 !border-2 !border-gray-900 !w-3 !h-3;
}
</style>

