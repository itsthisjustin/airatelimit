<template>
  <div class="limit-response-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">BLOCK</div>
    <div class="node-content">
      <div class="config">
        <textarea 
          v-model="data.message" 
          class="config-textarea"
          placeholder="Rate limit exceeded..."
          rows="2"
        />
        <label class="config-checkbox">
          <input type="checkbox" v-model="data.includeUpgradeUrl" class="checkbox-input" />
          <span class="checkbox-label">Include upgrade link</span>
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
  background: rgb(255, 161, 173, 0.2);
  border: 1px solid rgb(255, 161, 173, 0.4);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 220px;
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 600;
  background: #ffa1ad;
  color: #000000;
  border-radius: 6px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  /* box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); */
}

.node-content {
  margin-top: 8px;
}

.config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  resize: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.config-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.config-textarea:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(239, 68, 68, 0.3);
}

.config-textarea:focus {
  outline: none;
  border-color: rgb(255, 161, 173, 0.5);
  box-shadow: 0 0 0 2px rgb(255, 161, 173, 0.1);
}

.config-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  accent-color: #ffa1ad;
}

.checkbox-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.handle-top {
  background: #ffa1ad !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
}
</style>
