<template>
  <div class="check-limit-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK LIMIT</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  position: relative;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 220px;
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.1);
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: #f59e0b;
  color: black;
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
  background: rgba(245, 158, 11, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
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
}

.config-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.config-label {
  color: #6b7280;
}

.config-select, .config-select-sm {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
  font-size: 12px;
}

.config-select:focus, .config-select-sm:focus {
  outline: none;
  border-color: rgba(245, 158, 11, 0.5);
}

.config-select-sm {
  width: 56px;
}

.config-number {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
  font-size: 12px;
  width: 64px;
}

.config-number:focus {
  outline: none;
  border-color: rgba(245, 158, 11, 0.5);
}

.outputs {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

.output {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.output-label {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;
}

.output-label.pass {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.output-label.exceeded {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}

.handle-top {
  background: #fbbf24 !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
}

.handle-pass {
  background: #34d399 !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}

.handle-exceeded {
  background: #fb7185 !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}
</style>
