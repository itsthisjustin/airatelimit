<template>
  <div class="limit-response-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">LIMIT RESPONSE</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  position: relative;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(244, 63, 94, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 220px;
  box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.1);
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: #f43f5e;
  color: white;
  border-radius: 9999px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.node-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fb7185;
  flex-shrink: 0;
}

.node-icon .icon {
  width: 16px;
  height: 16px;
}

.config {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.config-textarea {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 6px;
  padding: 6px 8px;
  color: white;
  font-size: 12px;
  width: 100%;
  resize: none;
}

.config-textarea:focus {
  outline: none;
  border-color: rgba(244, 63, 94, 0.5);
}

.config-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
}

.config-checkbox input {
  border-radius: 4px;
  border: 1px solid #4b5563;
  background: #1f2937;
  accent-color: #f43f5e;
}

.handle-top {
  background: #fb7185 !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
}
</style>
