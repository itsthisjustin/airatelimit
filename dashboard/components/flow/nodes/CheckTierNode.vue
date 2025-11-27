<template>
  <div class="check-tier-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK TIER</div>
    <div class="node-content">
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
  background: rgb(168, 85, 247, 0.2);
  border: 1px solid rgb(168, 85, 247, 0.4);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 180px;
}

.node-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 600;
  background: #c084fc;
  color: #000000;
  border-radius: 6px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  /* box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3); */
}

.node-content {
  margin-top: 8px;
}

.config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.tiers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tier-badge {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: #c084fc;
  border: 1px solid rgb(168, 85, 247, 0.4);
  transition: all 0.2s ease;
}

.tier-badge:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgb(168, 85, 247, 0.5);
}

.outputs {
  display: flex;
  justify-content: space-around;
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
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

.handle-top {
  background: #c084fc !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
}

.handle-tier {
  background: #c084fc !important;
  width: 10px !important;
  height: 10px !important;
  border: none !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
}
</style>
