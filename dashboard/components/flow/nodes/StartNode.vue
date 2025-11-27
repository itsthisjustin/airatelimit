<template>
  <div class="start-node">
    <div class="node-badge">START</div>
    <div class="node-content">
      <div class="node-text">
        <div class="node-title">{{ data.label || 'Request In' }}</div>
        <div class="node-subtitle">Entry point</div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" class="handle-bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: { label?: string }
}>()
</script>

<style scoped>
.start-node {
  position: relative;
  background: rgb(60, 130, 246, 0.2);
  border: 1px solid rgb(60, 130, 246, 0.4);
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 160px;
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 600;
  background: #60a5fa;
  color: #000000;
  border-radius: 6px;
  letter-spacing: 0.05em;
  /* box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3); */
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.node-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 2px;
}

.handle-bottom {
  background: #60a5fa !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
}
</style>
