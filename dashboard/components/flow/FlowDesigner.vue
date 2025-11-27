<template>
  <div class="flow-designer h-full w-full">
    <!-- Vertical Toolbar -->
    <div class="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
      <div class="text-[10px] text-white/40 font-medium uppercase tracking-wider px-2 pb-1 border-b border-white/10 mb-1">Nodes</div>
      <button
        v-for="nodeType in nodeTypes"
        :key="nodeType.type"
        @click="addNode(nodeType.type)"
        :class="nodeType.color"
        class="px-2 py-1.5 text-xs font-medium rounded-lg border transition-all hover:scale-[1.02] flex items-center gap-2 w-full"
      >
        <component :is="nodeType.icon" class="w-4 h-4" />
        {{ nodeType.label }}
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
      class="bg-gray-500/10"
      fit-view-on-init
    >
      <Background variant="dots" :gap="16" :size="1" pattern-color="rgba(255,255,255,0.15)" />
      <Controls position="bottom-left" class="!bg-gray-500/10 !border-gray-500/10" />
      <!-- <MiniMap 
        class="!bg-gray-900 !border-gray-700" 
        :node-color="nodeColor"
        position="bottom-right"
      /> -->
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
// import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import StartNode from './nodes/StartNode.vue'
import CheckTierNode from './nodes/CheckTierNode.vue'
import CheckLimitNode from './nodes/CheckLimitNode.vue'
import CheckModelNode from './nodes/CheckModelNode.vue'
import LimitResponseNode from './nodes/LimitResponseNode.vue'
import AllowNode from './nodes/AllowNode.vue'

// Heroicons
import { 
  PlayIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CpuChipIcon,
  NoSymbolIcon, 
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  projectId: string
  initialFlow?: { nodes: any[], edges: any[] }
}>()

const emit = defineEmits<{
  (e: 'save', flow: { nodes: any[], edges: any[] }): void
  (e: 'clear'): void
}>()

const { addEdges } = useVueFlow()

// Custom node types - only what ai-ratelimit actually does
const customNodeTypes = {
  start: markRaw(StartNode),
  checkTier: markRaw(CheckTierNode),
  checkLimit: markRaw(CheckLimitNode),
  checkModel: markRaw(CheckModelNode),
  limitResponse: markRaw(LimitResponseNode),
  allow: markRaw(AllowNode),
}

// Node type definitions for toolbar with Heroicons
const nodeTypes = [
  { 
    type: 'start', 
    label: 'Start', 
    color: 'bg-blue-300/10 text-blue-300 border-blue-300/20 hover:bg-blue-300/20',
    icon: markRaw(PlayIcon)
  },
  { 
    type: 'checkTier', 
    label: 'Check Tier', 
    color: 'bg-purple-300/10 text-purple-300 border-purple-300/20 hover:bg-purple-300/20',
    icon: markRaw(UserGroupIcon)
  },
  { 
    type: 'checkLimit', 
    label: 'Check Limit', 
    color: 'bg-amber-300/10 text-amber-300 border-amber-300/20 hover:bg-amber-300/20',
    icon: markRaw(ClockIcon)
  },
  { 
    type: 'checkModel', 
    label: 'Check Model', 
    color: 'bg-cyan-300/10 text-cyan-300 border-cyan-300/20 hover:bg-cyan-300/20',
    icon: markRaw(CpuChipIcon)
  },
  { 
    type: 'limitResponse', 
    label: 'Limit Response', 
    color: 'bg-rose-300/10 text-rose-300 border-rose-300/20 hover:bg-rose-300/20',
    icon: markRaw(NoSymbolIcon)
  },
  { 
    type: 'allow', 
    label: 'Allow', 
    color: 'bg-green-300/10 text-green-300 border-green-300/20 hover:bg-green-300/20',
    icon: markRaw(CheckCircleIcon)
  },
]

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
        period: 'daily'
      }
    case 'checkModel':
      return { 
        model: '',
        limit: 100
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
    start: '#60a5fa',
    checkTier: '#a855f7',
    checkLimit: '#fbbf24',
    checkModel: '#22d3ee',
    limitResponse: '#fb7185',
    allow: '#34d399',
  }
  return colors[node.type] || '#666'
}

// Track if we're clearing to skip the watch
const isClearing = ref(false)

// Auto-emit changes when nodes or edges update
watch([nodes, edges], () => {
  if (isClearing.value) return
  emit('save', {
    nodes: nodes.value,
    edges: edges.value
  })
}, { deep: true })

// Clear flow
const clearFlow = () => {
  isClearing.value = true
  nodes.value = [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Request In' }
    }
  ]
  edges.value = []
  emit('clear')
  // Reset flag after next tick
  setTimeout(() => {
    isClearing.value = false
  }, 0)
}

// Expose clear method for parent to call
defineExpose({ clearFlow })
</script>

<style>
.vue-flow__node {
  border-radius: 8px;
}

.vue-flow__edge-path {
  stroke-width: 2;
}

.vue-flow__controls {
  /* background: rgba(31, 41, 55, 0.95) !important; */
  border: 1px solid rgba(75, 85, 99, 0.4) !important;
  border-radius: 8px !important;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important; */
}

.vue-flow__controls-button {
  background: rgba(0, 0, 0, 0.8) !important;
  border: none !important;
  border-bottom: 1px solid rgba(75, 85, 99, 0.4) !important;
  color: #fff !important;
  width: 32px !important;
  height: 32px !important;
}

.vue-flow__controls-button:first-child {
  border-radius: 7px 7px 0 0 !important;
}

.vue-flow__controls-button:last-child {
  border-radius: 0 0 7px 7px !important;
  border-bottom: none !important;
}

.vue-flow__controls-button svg {
  fill: #fff !important;
  width: 16px !important;
  height: 16px !important;
}

.vue-flow__controls-button:hover {
  background: rgba(75, 85, 99, 0.4) !important;
}

/* .vue-flow__minimap {
  background: rgba(17, 24, 39, 0.95) !important;
  border: 1px solid rgba(75, 85, 99, 0.5) !important;
  border-radius: 8px !important;
} */
</style>
