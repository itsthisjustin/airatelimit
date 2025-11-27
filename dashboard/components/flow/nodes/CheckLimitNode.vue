<template>
  <div class="check-limit-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK LIMIT</div>
    <div class="node-content">
      <div class="config">
        <div class="config-row">
          <div class="select-wrapper">
            <select v-model="data.limitType" class="config-select">
              <option value="requests">Requests</option>
              <option value="tokens">Tokens</option>
            </select>
            <div class="select-chevron">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <span class="config-label">per</span>
          <div class="select-wrapper">
            <select v-model="data.scope" class="config-select">
              <option value="identity">identity</option>
              <option value="session">session</option>
            </select>
            <div class="select-chevron">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div class="config-row">
          <input 
            v-model.number="data.limit" 
            type="number" 
            class="config-number"
            placeholder="100"
          />
          <span class="config-label">/</span>
          <div class="select-wrapper select-sm">
            <select v-model="data.period" class="config-select">
              <option value="daily">day</option>
              <option value="weekly">week</option>
              <option value="monthly">month</option>
            </select>
            <div class="select-chevron">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
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
  background: rgb(245, 158, 11, 0.2);
  border: 1px solid rgb(245, 158, 11, 0.4);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 260px;
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 600;
  background: #fbbf24;
  color: black;
  border-radius: 6px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  /* box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); */
}

.node-content {
  margin-top: 8px;
}

.config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.config-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.select-wrapper.select-sm {
  flex: 0 0 70px;
}

.config-select {
  width: 100%;
  padding: 8px 28px 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #fbbf24;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.config-select:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgb(251, 191, 36, 0.4);
}

.config-select:focus {
  outline: none;
  border-color: rgb(251, 191, 36, 0.5);
  box-shadow: 0 0 0 2px rgb(251, 191, 36, 0.1);
}

.config-select option {
  background: #1a1a1a;
  color: white;
  padding: 8px;
}

.select-chevron {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgb(251, 191, 36, 0.6);
}

.config-number {
  width: 70px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.config-number::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.config-number:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgb(251, 191, 36, 0.4);
}

.config-number:focus {
  outline: none;
  border-color: rgb(251, 191, 36, 0.5);
  box-shadow: 0 0 0 2px rgb(251, 191, 36, 0.1);
}

.outputs {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.output {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.output-label {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.output-label.pass {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.output-label.exceeded {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.handle-top {
  background: #fbbf24 !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
}

.handle-pass {
  background: #34d399 !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}

.handle-exceeded {
  background: #f87171 !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}
</style>
