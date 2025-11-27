<template>
  <div class="start-node">
    <div class="node-badge">START</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>
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
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: #3b82f6;
  color: white;
  border-radius: 9999px;
  letter-spacing: 0.05em;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.node-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
}

.node-icon .icon {
  width: 20px;
  height: 20px;
}

.node-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.node-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.handle-bottom {
  background: #60a5fa !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
}
</style>
