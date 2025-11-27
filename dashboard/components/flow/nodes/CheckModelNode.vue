<template>
  <div class="check-model-node">
    <Handle type="target" :position="Position.Top" class="handle-top" />
    
    <div class="node-badge">CHECK MODEL</div>
    <div class="node-content">
      <div class="config">
        <!-- Searchable Model Dropdown -->
        <div class="search-select" ref="dropdownRef">
          <div 
            class="search-trigger"
            @click="toggleDropdown"
          >
            <span v-if="data.model" class="selected-value">{{ getModelLabel(data.model) }}</span>
            <span v-else class="placeholder">Search models...</span>
            <svg class="chevron" :class="{ 'rotate': isOpen }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <div v-if="isOpen" class="dropdown-menu">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Type to search..."
                @click.stop
              />
            </div>
            
            <div class="options-list">
              <div 
                v-if="filteredModels.length === 0" 
                class="no-results"
              >
                No models found
              </div>
              
              <template v-for="group in filteredGroups" :key="group.label">
                <div v-if="group.models.length > 0" class="option-group">
                  <div class="group-label">{{ group.label }}</div>
                  <div
                    v-for="model in group.models"
                    :key="model.value"
                    class="option"
                    :class="{ 'selected': data.model === model.value }"
                    @click="selectModel(model.value)"
                  >
                    {{ model.label }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="config-row" v-if="data.model">
          <input 
            v-model.number="data.limit" 
            type="number" 
            class="config-number"
            placeholder="100"
          />
          <span class="config-label">req/day</span>
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: { 
    model: string
    limit: number
  }
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Model groups with all models
const modelGroups = [
  {
    label: 'OpenAI - GPT-5',
    models: [
      { value: 'gpt-5', label: 'gpt-5' },
      { value: 'gpt-5-turbo', label: 'gpt-5-turbo' },
      { value: 'gpt-5-mini', label: 'gpt-5-mini' },
    ]
  },
  {
    label: 'OpenAI - GPT-4o',
    models: [
      { value: 'gpt-4o', label: 'gpt-4o' },
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
      { value: 'gpt-4o-audio-preview', label: 'gpt-4o-audio' },
      { value: 'gpt-4o-realtime-preview', label: 'gpt-4o-realtime' },
    ]
  },
  {
    label: 'OpenAI - o-series',
    models: [
      { value: 'o1', label: 'o1' },
      { value: 'o1-preview', label: 'o1-preview' },
      { value: 'o1-mini', label: 'o1-mini' },
      { value: 'o3-mini', label: 'o3-mini' },
    ]
  },
  {
    label: 'OpenAI - GPT-4',
    models: [
      { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
      { value: 'gpt-4', label: 'gpt-4' },
      { value: 'gpt-4-32k', label: 'gpt-4-32k' },
    ]
  },
  {
    label: 'OpenAI - GPT-3.5',
    models: [
      { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
      { value: 'gpt-3.5-turbo-16k', label: 'gpt-3.5-turbo-16k' },
    ]
  },
  {
    label: 'Anthropic - Claude 4',
    models: [
      { value: 'claude-4.5-sonnet', label: 'claude-4.5-sonnet' },
      { value: 'claude-4.5-opus', label: 'claude-4.5-opus' },
      { value: 'claude-sonnet-4', label: 'claude-sonnet-4' },
      { value: 'claude-opus-4', label: 'claude-opus-4' },
    ]
  },
  {
    label: 'Anthropic - Claude 3.5',
    models: [
      { value: 'claude-3-5-sonnet-latest', label: 'claude-3.5-sonnet' },
      { value: 'claude-3-5-haiku-latest', label: 'claude-3.5-haiku' },
    ]
  },
  {
    label: 'Anthropic - Claude 3',
    models: [
      { value: 'claude-3-opus-latest', label: 'claude-3-opus' },
      { value: 'claude-3-sonnet-20240229', label: 'claude-3-sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'claude-3-haiku' },
    ]
  },
  {
    label: 'Google - Gemini 3',
    models: [
      { value: 'gemini-3-ultra', label: 'gemini-3-ultra' },
      { value: 'gemini-3-pro', label: 'gemini-3-pro' },
      { value: 'gemini-3-flash', label: 'gemini-3-flash' },
    ]
  },
  {
    label: 'Google - Gemini 2.x',
    models: [
      { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
      { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
      { value: 'gemini-2.0-pro', label: 'gemini-2.0-pro' },
      { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
    ]
  },
  {
    label: 'Google - Gemini 1.5',
    models: [
      { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
      { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
      { value: 'gemini-1.5-flash-8b', label: 'gemini-1.5-flash-8b' },
    ]
  },
  {
    label: 'xAI - Grok',
    models: [
      { value: 'grok-4', label: 'grok-4' },
      { value: 'grok-4-vision', label: 'grok-4-vision' },
      { value: 'grok-3', label: 'grok-3' },
      { value: 'grok-3-vision', label: 'grok-3-vision' },
      { value: 'grok-2', label: 'grok-2' },
      { value: 'grok-beta', label: 'grok-beta' },
    ]
  },
]

// Flatten all models for search
const allModels = computed(() => 
  modelGroups.flatMap(g => g.models)
)

// Filtered models based on search
const filteredModels = computed(() => {
  if (!searchQuery.value) return allModels.value
  const query = searchQuery.value.toLowerCase()
  return allModels.value.filter(m => 
    m.label.toLowerCase().includes(query) || 
    m.value.toLowerCase().includes(query)
  )
})

// Filtered groups for display
const filteredGroups = computed(() => {
  if (!searchQuery.value) return modelGroups
  const query = searchQuery.value.toLowerCase()
  return modelGroups.map(group => ({
    label: group.label,
    models: group.models.filter(m => 
      m.label.toLowerCase().includes(query) || 
      m.value.toLowerCase().includes(query)
    )
  })).filter(g => g.models.length > 0)
})

const getModelLabel = (value: string) => {
  const model = allModels.value.find(m => m.value === value)
  return model?.label || value
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const selectModel = (value: string) => {
  props.data.model = value
  isOpen.value = false
  searchQuery.value = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.check-model-node {
  position: relative;
  background: rgba(6, 182, 212, 0.2);
  border: 1px solid rgba(6, 182, 212, 0.4);
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
  background: #22d3ee;
  color: black;
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

/* Searchable Select */
.search-select {
  position: relative;
  width: 100%;
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-trigger:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(6, 182, 212, 0.4);
}

.selected-value {
  font-size: 12px;
  font-weight: 500;
  color: #22d3ee;
}

.placeholder {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.chevron {
  width: 14px;
  height: 14px;
  color: rgba(6, 182, 212, 0.6);
  transition: transform 0.2s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 100;
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 8px;
}

.search-icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: white;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
}

.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: transparent;
}

.options-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.no-results {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.option-group {
  padding: 4px 0;
}

.group-label {
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.option {
  padding: 8px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
}

.option:hover {
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

.option.selected {
  background: rgba(6, 182, 212, 0.3);
  color: #22d3ee;
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
  border-color: rgba(6, 182, 212, 0.4);
}

.config-number:focus {
  outline: none;
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.1);
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
  background: #22d3ee !important;
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
