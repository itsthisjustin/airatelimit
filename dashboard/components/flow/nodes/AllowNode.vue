<template>
  <div class="allow-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-content">
      <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="node-text">
        <div class="node-title">Allow Request</div>
        <div class="node-subtitle">Forward to AI provider</div>
      </div>
    </div>
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
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
}

.node-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
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

.handle-top {
  background: #34d399 !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
}
</style>
