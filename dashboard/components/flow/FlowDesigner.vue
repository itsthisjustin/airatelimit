<template>
  <div class="flow-designer h-full w-full">
    <!-- Toolbar -->
    <div class="absolute top-4 left-4 z-10 flex gap-2">
      <button
        v-for="nodeType in nodeTypes"
        :key="nodeType.type"
        @click="addNode(nodeType.type)"
        :class="nodeType.color"
        class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:scale-105 flex items-center gap-1.5"
      >
        <component :is="nodeType.icon" class="w-3.5 h-3.5" />
        {{ nodeType.label }}
      </button>
    </div>

    <!-- Save/Load -->
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <button
        @click="saveFlow"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
      >
        Save Flow
      </button>
      <button
        @click="clearFlow"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
      >
        Clear
      </button>
    </div>

    <!-- Vue Flow Canvas -->
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="customNodeTypes"
      :default-viewport="{ zoom: 0.8, x: 100, y: 100 }"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      @connect="onConnect"
      class="bg-gray-950"
      fit-view-on-init
    >
      <Background :gap="20" :size="1" pattern-color="rgba(255,255,255,0.03)" />
      <Controls position="bottom-left" class="!bg-gray-800 !border-gray-700" />
      <MiniMap 
        class="!bg-gray-900 !border-gray-700" 
        :node-color="nodeColor"
        position="bottom-right"
      />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import StartNode from './nodes/StartNode.vue'
import CheckTierNode from './nodes/CheckTierNode.vue'
import CheckLimitNode from './nodes/CheckLimitNode.vue'
import LimitResponseNode from './nodes/LimitResponseNode.vue'
import AllowNode from './nodes/AllowNode.vue'

const props = defineProps<{
  projectId: string
  initialFlow?: { nodes: any[], edges: any[] }
}>()

const emit = defineEmits<{
  (e: 'save', flow: { nodes: any[], edges: any[] }): void
}>()

const { addEdges } = useVueFlow()

// Custom node types - only what ai-ratelimit actually does
const customNodeTypes = {
  start: markRaw(StartNode),
  checkTier: markRaw(CheckTierNode),
  checkLimit: markRaw(CheckLimitNode),
  limitResponse: markRaw(LimitResponseNode),
  allow: markRaw(AllowNode),
}

// Node type definitions for toolbar
const nodeTypes = [
  { 
    type: 'start', 
    label: 'Start', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: 'IconPlay'
  },
  { 
    type: 'checkTier', 
    label: 'Check Tier', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: 'IconUsers'
  },
  { 
    type: 'checkLimit', 
    label: 'Check Limit', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: 'IconGauge'
  },
  { 
    type: 'limitResponse', 
    label: 'Limit Response', 
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: 'IconBlock'
  },
  { 
    type: 'allow', 
    label: 'Allow', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: 'IconCheck'
  },
]

// Simple icon components
const IconPlay = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' }
const IconUsers = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' }
const IconGauge = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' }
const IconBlock = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' }
const IconCheck = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' }

// Nodes and edges
const nodes = ref(props.initialFlow?.nodes || [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Request In' }
  }
])

const edges = ref(props.initialFlow?.edges || [])

// Add new node
let nodeId = nodes.value.length + 1
const addNode = (type: string) => {
  const newNode = {
    id: `${type}-${nodeId++}`,
    type,
    position: { x: 250, y: 100 + nodes.value.length * 120 },
    data: getDefaultData(type)
  }
  nodes.value.push(newNode)
}

const getDefaultData = (type: string) => {
  switch (type) {
    case 'start':
      return { label: 'Request In' }
    case 'checkTier':
      return { tiers: ['free', 'pro'] }
    case 'checkLimit':
      return { 
        limitType: 'requests', 
        scope: 'identity',
        limit: 100,
        period: 'day'
      }
    case 'limitResponse':
      return { 
        message: 'Rate limit exceeded. Upgrade to continue.',
        includeUpgradeUrl: true 
      }
    case 'allow':
      return {}
    default:
      return {}
  }
}

// Handle connections
const onConnect = (params: any) => {
  addEdges([{
    ...params,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.3)' }
  }])
}

// Minimap node colors
const nodeColor = (node: any) => {
  const colors: Record<string, string> = {
    start: '#3b82f6',
    checkTier: '#a855f7',
    checkLimit: '#f59e0b',
    limitResponse: '#f43f5e',
    allow: '#10b981',
  }
  return colors[node.type] || '#666'
}

// Save flow
const saveFlow = () => {
  emit('save', {
    nodes: nodes.value,
    edges: edges.value
  })
}

// Clear flow
const clearFlow = () => {
  nodes.value = [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Request In' }
    }
  ]
  edges.value = []
}
</script>

<style>
.vue-flow__node {
  border-radius: 8px;
}

.vue-flow__edge-path {
  stroke-width: 2;
}

.vue-flow__controls {
  background: rgba(31, 41, 55, 0.9) !important;
  border-color: rgba(75, 85, 99, 0.5) !important;
}

.vue-flow__controls-button {
  background: transparent !important;
  border-color: rgba(75, 85, 99, 0.5) !important;
  color: #9ca3af !important;
}

.vue-flow__controls-button:hover {
  background: rgba(75, 85, 99, 0.3) !important;
}

.vue-flow__minimap {
  background: rgba(17, 24, 39, 0.9) !important;
  border-color: rgba(75, 85, 99, 0.5) !important;
}
</style>
