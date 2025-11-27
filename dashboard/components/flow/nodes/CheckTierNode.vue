<template>
  <div class="check-tier-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK TIER</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      
      <div class="config">
        <div class="config-label">Route by tier:</div>
        <div class="tiers-list">
          <div 
            v-for="tier in data.tiers" 
            :key="tier"
            class="tier-badge"
          >
            {{ tier }}
          </div>
        </div>
      </div>
    </div>

    <div class="outputs">
      <div 
        v-for="tier in data.tiers" 
        :key="tier"
        class="output"
      >
        <span class="output-label">{{ tier }}</span>
        <Handle 
          :id="tier" 
          type="source" 
          :position="Position.Bottom" 
          class="handle-tier"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: { 
    tiers: string[]
  }
}>()
</script>

<style scoped>
.check-tier-node {
  @apply relative bg-gray-900/95 border border-purple-500/40 rounded-xl px-4 py-3 min-w-[180px];
  @apply shadow-lg shadow-purple-500/10;
}

.node-badge {
  @apply absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold;
  @apply bg-purple-500 text-white rounded-full tracking-wider whitespace-nowrap;
}

.node-content {
  @apply flex items-start gap-3 mt-2;
}

.node-icon {
  @apply w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0;
}

.config {
  @apply flex flex-col gap-2;
}

.config-label {
  @apply text-xs text-gray-400;
}

.tiers-list {
  @apply flex flex-wrap gap-1;
}

.tier-badge {
  @apply px-2 py-0.5 text-[10px] font-medium rounded-full;
  @apply bg-purple-500/20 text-purple-300 border border-purple-500/30;
}

.outputs {
  @apply flex justify-around mt-3 pt-2 border-t border-gray-700/30;
}

.output {
  @apply flex flex-col items-center gap-1;
}

.output-label {
  @apply text-[10px] font-medium text-gray-500;
}

.handle-top {
  @apply !bg-purple-400 !border-2 !border-gray-900 !w-3 !h-3;
}

.handle-tier {
  @apply !bg-purple-400 !border-2 !border-gray-900 !w-3 !h-3 !relative !left-0 !transform-none;
}
</style>

