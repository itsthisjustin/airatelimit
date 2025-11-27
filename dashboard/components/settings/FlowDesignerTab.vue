<template>
  <div class="flow-designer-tab">
    <div class="header">
      <div>
        <h3 class="title">Visual Rule Designer</h3>
        <p class="description">
          Build rate limiting rules using a visual drag-and-drop flow builder.
        </p>
      </div>
      <div class="header-actions">
        <button
          v-if="!isFullscreen"
          @click="openFullscreen"
          class="btn-expand"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          Open Designer
        </button>
      </div>
    </div>

    <div class="preview-container">
      <div v-if="hasFlow" class="flow-preview">
        <div class="flow-stats">
          <div class="stat">
            <span class="stat-value">{{ nodeCount }}</span>
            <span class="stat-label">Nodes</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ edgeCount }}</span>
            <span class="stat-label">Connections</span>
          </div>
        </div>
        <div class="flow-mini-preview">
          <div 
            v-for="node in previewNodes" 
            :key="node.id"
            class="mini-node"
            :class="node.type"
          >
            {{ node.type }}
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="8" y="14" width="8" height="7" rx="1"/>
            <line x1="6.5" y1="10" x2="6.5" y2="14"/>
            <line x1="17.5" y1="10" x2="17.5" y2="14"/>
            <line x1="6.5" y1="14" x2="12" y2="14"/>
            <line x1="17.5" y1="14" x2="12" y2="14"/>
          </svg>
        </div>
        <h4 class="empty-title">No flow configured</h4>
        <p class="empty-text">Create a visual flow to define rate limiting rules.</p>
        <button @click="openFullscreen" class="btn-create">
          Create Flow
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  editForm: {
    flowConfig?: {
      nodes: any[]
      edges: any[]
    }
  }
}>()

const emit = defineEmits<{
  (e: 'openDesigner'): void
}>()

const hasFlow = computed(() => {
  return props.editForm.flowConfig?.nodes && props.editForm.flowConfig.nodes.length > 1
})

const nodeCount = computed(() => props.editForm.flowConfig?.nodes?.length || 0)
const edgeCount = computed(() => props.editForm.flowConfig?.edges?.length || 0)

const previewNodes = computed(() => {
  return props.editForm.flowConfig?.nodes?.slice(0, 5) || []
})

const isFullscreen = false

const openFullscreen = () => {
  emit('openDesigner')
}
</script>

<style scoped>
.flow-designer-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.description {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-expand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-expand:hover {
  background: rgba(99, 102, 241, 0.3);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.preview-container {
  border-radius: 12px;
  border: 1px solid rgba(75, 85, 99, 0.5);
  background: rgba(31, 41, 55, 0.3);
  overflow: hidden;
}

.flow-preview {
  padding: 24px;
}

.flow-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.flow-mini-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.mini-node {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-transform: capitalize;
}

.mini-node.start {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.mini-node.checkTier {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.mini-node.checkLimit {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.mini-node.limitResponse {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.mini-node.allow {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  margin: 0 auto 16px;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(31, 41, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
}

.icon-lg {
  width: 48px;
  height: 48px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #d1d5db;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-create {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #4f46e5;
}
</style>
