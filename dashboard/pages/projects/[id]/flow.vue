<template>
  <div class="min-h-screen h-screen bg-black flex flex-col">
    <!-- Header -->
    <div class="bg-gray-500/10 border-b border-gray-500/10 p-3 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <NuxtLink :to="`/projects/${projectId}`" class="">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-white text-lg font-medium">{{ project?.name || 'Loading...' }}</h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="hasUnsavedChanges" class="text-amber-300 text-xs">
          Unsaved changes
        </div>
        <button
          @click="clearCanvas"
          class="px-3 py-1.5 text-gray-400 text-sm font-medium rounded-lg border border-gray-500/15 hover:bg-gray-500/15 hover:text-white hover:border-gray-500/15 transition-colors"
        >
          Clear
        </button>
        <button
          @click="saveFlow"
          :disabled="saving"
          class="px-3 py-1.5 bg-blue-300 text-black text-sm font-medium rounded-lg hover:bg-blue-400 transition-colors"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Flow Canvas -->
    <div class="flex-1 relative">
      <ClientOnly>
        <FlowDesigner
          ref="flowDesignerRef"
          v-if="project"
          :project-id="projectId"
          :initial-flow="project.flowConfig"
          @save="handleSave"
          @clear="handleClear"
        />
        <template #fallback>
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading flow designer...</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const api = useApi()
const toast = useToast()

const projectId = computed(() => route.params.id as string)
const project = ref<any>(null)
const saving = ref(false)
const hasUnsavedChanges = ref(false)
const currentFlow = ref<{ nodes: any[], edges: any[] } | null>(null)
const flowDesignerRef = ref<any>(null)

// Fetch project
const fetchProject = async () => {
  try {
    project.value = await api(`/projects/${projectId.value}`)
  } catch (err) {
    toast.error('Failed to load project')
  }
}

// Handle flow save from designer
const handleSave = (flow: { nodes: any[], edges: any[] }) => {
  currentFlow.value = flow
  hasUnsavedChanges.value = true
}

// Handle clear from designer
const handleClear = () => {
  currentFlow.value = null
  hasUnsavedChanges.value = false
}

// Clear canvas from header button
const clearCanvas = () => {
  flowDesignerRef.value?.clearFlow()
}

// Save to backend
const saveFlow = async () => {
  if (!currentFlow.value) return
  
  saving.value = true
  try {
    await api(`/projects/${projectId.value}`, {
      method: 'PATCH',
      body: { flowConfig: currentFlow.value }
    })
    hasUnsavedChanges.value = false
    toast.success('Flow saved successfully!')
  } catch (err) {
    toast.error('Failed to save flow')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProject()
})
</script>

<style scoped>

.unsaved-badge {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #374151;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
</style>
