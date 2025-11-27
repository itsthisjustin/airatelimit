<template>
  <div class="check-limit-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK LIMIT</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      
      <div class="config">
        <div class="config-row">
          <select v-model="data.limitType" class="config-select">
            <option value="requests">Requests</option>
            <option value="tokens">Tokens</option>
          </select>
          <span class="config-label">per</span>
          <select v-model="data.scope" class="config-select">
            <option value="identity">identity</option>
            <option value="session">session</option>
          </select>
        </div>
        <div class="config-row">
          <input 
            v-model.number="data.limit" 
            type="number" 
            class="config-number"
          />
          <span class="config-label">/</span>
          <select v-model="data.period" class="config-select-sm">
            <option value="minute">min</option>
            <option value="hour">hour</option>
            <option value="day">day</option>
          </select>
        </div>
      </div>
    </div>

    <div class="outputs">
      <div class="output">
        <span class="output-label pass">Within Limit</span>
        <Handle id="pass" type="source" :position="Position.Bottom" class="handle-pass" />
      </div>
      <div class="output">
        <span class="output-label exceeded">Exceeded</span>
        <Handle id="exceeded" type="source" :position="Position.Bottom" class="handle-exceeded" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: { 
    limitType: 'requests' | 'tokens'
    scope: 'identity' | 'session'
    limit: number
    period: string
  }
}>()
</script>

<style scoped>
.check-limit-node {
  @apply relative bg-gray-900/95 border border-amber-500/40 rounded-xl px-4 py-3 min-w-[220px];
  @apply shadow-lg shadow-amber-500/10;
}

.node-badge {
  @apply absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold;
  @apply bg-amber-500 text-black rounded-full tracking-wider whitespace-nowrap;
}

.node-content {
  @apply flex items-start gap-3 mt-2;
}

.node-icon {
  @apply w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0;
}

.config {
  @apply flex flex-col gap-2;
}

.config-row {
  @apply flex items-center gap-1.5 text-xs;
}

.config-label {
  @apply text-gray-500;
}

.config-select, .config-select-sm {
  @apply bg-gray-800/80 border border-gray-700/50 rounded px-1.5 py-0.5 text-white text-xs;
  @apply focus:outline-none focus:border-amber-500/50;
}

.config-select-sm {
  @apply w-14;
}

.config-number {
  @apply bg-gray-800/80 border border-gray-700/50 rounded px-1.5 py-0.5 text-white text-xs w-16;
  @apply focus:outline-none focus:border-amber-500/50;
}

.outputs {
  @apply flex justify-between mt-3 pt-2 border-t border-gray-700/30;
}

.output {
  @apply flex flex-col items-center gap-1;
}

.output-label {
  @apply text-[10px] font-medium px-2 py-0.5 rounded-full;
}

.output-label.pass {
  @apply bg-emerald-500/20 text-emerald-400;
}

.output-label.exceeded {
  @apply bg-rose-500/20 text-rose-400;
}

.handle-top {
  @apply !bg-amber-400 !border-2 !border-gray-900 !w-3 !h-3;
}

.handle-pass {
  @apply !bg-emerald-400 !border-2 !border-gray-900 !w-3 !h-3 !relative !left-0 !transform-none;
}

.handle-exceeded {
  @apply !bg-rose-400 !border-2 !border-gray-900 !w-3 !h-3 !relative !left-0 !transform-none;
}
</style>

