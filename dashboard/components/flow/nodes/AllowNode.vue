<template>
  <div class="allow-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-content text-center justify-center">
      <!-- <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div> -->
      <div class="node-text">
        <div class="node-title">Allow</div>
        <div class="node-subtitle">Forward to AI</div>
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
  position: relative;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 14px 18px;
  min-width: 140px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
}

.node-icon .icon {
  width: 18px;
  height: 18px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #34d399;
}

.node-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1px;
}

.handle-top {
  background: #10b981 !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
}
</style>
