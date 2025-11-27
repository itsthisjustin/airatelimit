<template>
  <div class="check-tier-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK TIER</div>
    <div class="node-content">
      <div class="node-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  position: relative;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.1);
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: #a855f7;
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
  background: rgba(168, 85, 247, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c084fc;
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

.config-label {
  font-size: 12px;
  color: #9ca3af;
}

.tiers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tier-badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 9999px;
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.outputs {
  display: flex;
  justify-content: space-around;
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
  color: #6b7280;
}

.handle-top {
  background: #c084fc !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
}

.handle-tier {
  background: #c084fc !important;
  border: 2px solid #111827 !important;
  width: 12px !important;
  height: 12px !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}
</style>
