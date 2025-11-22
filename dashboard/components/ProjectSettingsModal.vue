<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative w-full max-w-4xl bg-gray-800 border border-gray-500/20 rounded-lg shadow-xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-500/20">
            <h2 class="text-xl font-bold text-white">Project Settings</h2>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <!-- Tabs -->
            <div class="mb-6 border-b border-gray-500/10">
              <nav class="-mb-px flex space-x-8">
                <button
                  @click="activeSection = 'configuration'"
                  :class="activeSection === 'configuration' ? 'border-blue-300 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-gray-300'"
                  class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Configuration
                </button>
                <button
                  @click="activeSection = 'danger'"
                  :class="activeSection === 'danger' ? 'border-red-400 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-gray-300'"
                  class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Danger Zone
                </button>
              </nav>
            </div>

            <!-- Configuration Section -->
            <div v-show="activeSection === 'configuration'" class="space-y-6">
              <!-- Config Tabs -->
              <div class="border-b border-gray-500/10">
                <nav class="-mb-px flex space-x-8">
                  <button
                    @click="configTab = 'basic'"
                    :class="configTab === 'basic' ? 'border-blue-300 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Basic Limits
                  </button>
                  <button
                    @click="configTab = 'tiers'"
                    :class="configTab === 'tiers' ? 'border-blue-300 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Plan Tiers
                  </button>
                  <button
                    @click="configTab = 'rules'"
                    :class="configTab === 'rules' ? 'border-blue-300 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Visual Rules
                  </button>
                </nav>
              </div>

              <!-- Basic Limits Tab -->
              <form v-show="configTab === 'basic'" @submit.prevent="handleUpdate" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Project Name</label>
                  <input
                    v-model="editForm.name"
                    type="text"
                    class="w-full px-4 py-2 text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
                  />
                </div>

                <!-- Limit Type -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Limit Type</label>
                  <div class="relative">
                    <select
                      v-model="editForm.limitType"
                      class="w-full px-4 py-2.5 text-white bg-gray-500/10 border border-gray-500/20 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent appearance-none cursor-pointer pr-10 transition-all hover:bg-gray-500/20"
                    >
                      <option value="both">Both Requests & Tokens</option>
                      <option value="requests">Requests Only (Image Gen)</option>
                      <option value="tokens">Tokens Only (Chat)</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    Choose how to track usage: requests for image generation, tokens for chat, or both
                  </p>
                </div>

                <div v-if="editForm.limitType !== 'tokens'">
                  <label class="block text-sm font-medium text-white mb-2">Daily Request Limit</label>
                  <input
                    v-model.number="editForm.dailyRequestLimit"
                    type="number"
                    min="0"
                    class="w-full px-4 py-2 text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>

                <div v-if="editForm.limitType !== 'requests'">
                  <label class="block text-sm font-medium text-white mb-2">Daily Token Limit</label>
                  <input
                    v-model.number="editForm.dailyTokenLimit"
                    type="number"
                    min="0"
                    class="w-full px-4 py-2 text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Limit Exceeded Message
                  </label>
                  <textarea
                    v-model="editForm.limitMessage"
                    rows="3"
                    placeholder='{"error": "limit_exceeded", "message": "Upgrade to Pro!", "deepLink": "myapp://upgrade"}'
                    class="w-full px-4 py-2 text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Custom JSON response sent when limits are exceeded
                  </p>
                </div>

                <div v-if="updateError" class="p-3 bg-red-400/10 text-red-400 rounded-lg text-sm">
                  {{ updateError }}
                </div>

                <div v-if="updateSuccess" class="p-3 bg-green-300/10 text-green-300 rounded-lg text-sm">
                  Configuration updated successfully!
                </div>

                <button
                  type="submit"
                  :disabled="updating"
                  class="w-full px-6 py-2 bg-blue-300 text-black text-sm font-medium rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </form>

              <!-- Tiers Tab -->
              <div v-show="configTab === 'tiers'" class="space-y-4">
                <div class="bg-gray-500/10 border border-gray-500/10 rounded-lg p-4">
                  <p class="text-sm text-white">
                    This allows you to define different limits for free, pro, enterprise, etc.
                    Your app passes a <code class="bg-gray-500/10 text-white px-1 rounded">tier</code> parameter in API calls.
                  </p>
                </div>

                <div v-for="(tier, tierName) in editForm.tiers" :key="tierName" class="border border-gray-500/10 rounded-lg p-4">
                  <div class="flex justify-between items-center mb-3">
                    <h4 class="font-semibold text-white capitalize">{{ tierName }} Tier</h4>
                    <button
                      @click="deleteTier(tierName)"
                      class="text-red-400 hover:text-red-400/80 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-medium text-white mb-1">Request Limit</label>
                      <input
                        v-model.number="tier.requestLimit"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 text-sm text-white bg-gray-500/10 border border-gray-500/10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-white mb-1">Token Limit</label>
                      <input
                        v-model.number="tier.tokenLimit"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 text-sm text-white bg-gray-500/10 border border-gray-500/10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <input
                    v-model="newTierName"
                    type="text"
                    placeholder="e.g., free, pro, enterprise"
                    class="flex-1 px-4 py-2 text-white bg-gray-500/10 border border-gray-500/10 rounded-lg text-sm"
                  />
                  <button
                    @click="addTier"
                    class="px-4 py-2 bg-gray-500/10 border border-gray-500/10 text-white text-sm font-medium rounded-lg hover:bg-gray-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Tier
                  </button>
                </div>

                <button
                  @click="handleUpdate"
                  :disabled="updating"
                  class="w-full px-6 py-2 bg-blue-300 text-black text-sm font-medium rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ updating ? 'Saving...' : 'Save Tiers' }}
                </button>
              </div>

              <!-- Rules Tab -->
              <div v-show="configTab === 'rules'">
                <RuleBuilder v-model="editForm.rules" />
                <button
                  @click="handleUpdate"
                  :disabled="updating"
                  class="mt-4 w-full px-6 py-2 bg-blue-300 text-black text-sm font-medium rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ updating ? 'Saving...' : 'Save Rules' }}
                </button>
              </div>
            </div>

            <!-- Danger Zone Section -->
            <div v-show="activeSection === 'danger'" class="space-y-4">
              <div class="bg-red-400/10 border border-red-400/20 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-red-400 mb-2">Delete Project</h3>
                <p class="text-sm text-gray-400 mb-4">
                  Once you delete a project, there is no going back. All data, usage history, and configurations will be permanently removed.
                </p>
                <button
                  @click="handleDeleteRequest"
                  class="px-4 py-2 bg-red-400/20 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/30 text-sm font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete This Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  project: any
  editForm: any
  updating: boolean
  updateError: string
  updateSuccess: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update'): void
  (e: 'delete'): void
}>()

const activeSection = ref('configuration')
const configTab = ref('basic')
const newTierName = ref('')

const addTier = () => {
  if (newTierName.value && !props.editForm.tiers[newTierName.value]) {
    props.editForm.tiers[newTierName.value] = {
      requestLimit: 0,
      tokenLimit: 0,
    }
    newTierName.value = ''
  }
}

const deleteTier = (tierName: string) => {
  if (confirm(`Delete tier "${tierName}"?`)) {
    delete props.editForm.tiers[tierName]
  }
}

const handleUpdate = () => {
  emit('update')
}

const handleDeleteRequest = () => {
  emit('delete')
  emit('close')
}
</script>

