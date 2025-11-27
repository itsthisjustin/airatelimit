<template>
  <div class="check-tier-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK TIER</div>
    <div class="node-content">
      <div class="config">
        <div class="config-label">Route by tier:</div>
        <div class="tiers-list">
          <div 
            v-for="(tier, index) in data.tiers" 
            :key="tier"
            class="tier-badge"
          >
            <span>{{ tier }}</span>
            <button 
              @click.stop="removeTier(index)"
              class="tier-remove"
              title="Remove tier"
            >
              <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>
          <!-- Add tier input -->
          <div class="add-tier">
            <input 
              v-model="newTierName"
              @keyup.enter="addTier"
              type="text"
              placeholder="+ tier"
              class="tier-input"
            />
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
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: { 
    tiers: string[]
  }
}>()

const newTierName = ref('')

const addTier = () => {
  const name = newTierName.value.trim().toLowerCase()
  if (name && !props.data.tiers.includes(name)) {
    props.data.tiers.push(name)
    newTierName.value = ''
  }
}

const removeTier = (index: number) => {
  if (props.data.tiers.length > 1) {
    props.data.tiers.splice(index, 1)
  }
}
</script>

<style scoped>
.check-tier-node {
  position: relative;
  background: rgb(168, 85, 247, 0.2);
  border: 1px solid rgb(168, 85, 247, 0.4);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 200px;
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 12px;
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

.tier-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tier-remove:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.add-tier {
  display: flex;
}

.tier-input {
  width: 70px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.6);
  border: 1px dashed rgba(168, 85, 247, 0.3);
  outline: none;
  transition: all 0.2s ease;
}

.tier-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.tier-input:focus {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(168, 85, 247, 0.6);
  border-style: solid;
  color: #c084fc;
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
