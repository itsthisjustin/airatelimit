<template>
  <div class="px-6 space-y-6">
    <!-- Anonymization Section -->
    <!-- <div class="bg-gray-500/10 border border-gray-500/10 rounded-lg p-4">
      <div class="flex items-center space-x-2 mb-2">
        <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h3 class="font-semibold text-white">Privacy Protection (Tofu Box)</h3>
      </div>
      <p class="text-sm text-gray-400">
        Automatically detect and mask PII (emails, phone numbers, etc.) before sending requests to AI providers.
        Your users' data stays private.
      </p>
    </div> -->

    <!-- Enable Anonymization -->
    <div class="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-semibold text-white mb-1">PII Anonymization</h4>
          <p class="text-xs text-gray-400">Automatically detect and mask PII (emails, phone numbers, etc.) before sending requests to AI providers.
            Your users' data stays private.</p>
        </div>
        <button
          type="button"
          @click="editForm.anonymizationEnabled = !editForm.anonymizationEnabled"
          :class="editForm.anonymizationEnabled ? 'bg-blue-300' : 'bg-gray-500/20'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        >
          <span
            :class="editForm.anonymizationEnabled ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          />
        </button>
      </div>

      <!-- PII Categories -->
      <div v-if="editForm.anonymizationEnabled" class="mt-4 pt-4 border-t border-gray-500/20">
        <label class="block text-sm font-medium text-white mb-3">What to detect and mask</label>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="category in piiCategories"
            :key="category.id"
            :class="editForm.anonymizationConfig[category.configKey] ? 'border-blue-300/20 bg-blue-300/5' : 'border-gray-500/10 bg-gray-500/5 hover:bg-gray-500/10'"
            class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all"
          >
            <div class="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                v-model="editForm.anonymizationConfig[category.configKey]"
                class="sr-only"
              />
              <div 
                :class="editForm.anonymizationConfig[category.configKey] ? 'bg-blue-300 border-blue-300' : 'border-gray-500 bg-transparent'"
                class="w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
              >
                <svg 
                  v-if="editForm.anonymizationConfig[category.configKey]"
                  class="w-2.5 h-2.5 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <span class="text-sm font-medium text-white">{{ category.name }}</span>
              <p class="text-xs text-gray-500">{{ category.description }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Masking Style -->
      <div v-if="editForm.anonymizationEnabled" class="mt-4 pt-4 border-t border-gray-500/20">
        <label class="block text-sm font-medium text-white mb-3">Masking style</label>
        <div class="space-y-2">
          <label
            v-for="style in maskingStyles"
            :key="style.value"
            :class="editForm.anonymizationConfig.maskingStyle === style.value ? 'border-blue-300/30 bg-blue-300/5' : 'border-gray-500/10 bg-gray-500/5 hover:bg-gray-500/10'"
            class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all"
          >
            <div class="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name="maskingStyle"
                :value="style.value"
                v-model="editForm.anonymizationConfig.maskingStyle"
                class="sr-only"
              />
              <div
                :class="editForm.anonymizationConfig.maskingStyle === style.value ? 'border-blue-300' : 'border-gray-500'"
                class="w-4 h-4 rounded-full border-2 transition-colors"
              >
                <div
                  v-if="editForm.anonymizationConfig.maskingStyle === style.value"
                  class="w-2 h-2 m-0.5 rounded-full bg-blue-300"
                ></div>
              </div>
            </div>
            <div class="flex-1">
              <span class="text-sm font-medium text-white">{{ style.name }}</span>
              <p class="text-xs text-gray-400">{{ style.description }}</p>
              <code class="text-xs text-gray-500 mt-1 block">{{ style.example }}</code>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Session Limits Section -->
    <!-- <div class="bg-gray-500/10 border border-gray-500/10 rounded-lg p-4 mt-8">
      <div class="flex items-center space-x-2 mb-2">
        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="font-semibold text-white">Session-Based Limits</h3>
      </div>
      <p class="text-sm text-gray-400">
        Limit usage per conversation session, not just per identity. Perfect for chat apps where you want to limit
        messages per conversation.
      </p>
    </div> -->

    <!-- Enable Session Limits -->
    <div class="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-semibold text-white mb-1">Session Limits</h4>
          <p class="text-xs text-gray-400">Enable per-session rate limiting using the <code class="bg-gray-500/20 px-1 rounded">x-session</code> header. Limit usage per conversation session, not just per identity.</p>
        </div>
        <button
          type="button"
          @click="editForm.sessionLimitsEnabled = !editForm.sessionLimitsEnabled"
          :class="editForm.sessionLimitsEnabled ? 'bg-blue-300' : 'bg-gray-500/20'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        >
          <span
            :class="editForm.sessionLimitsEnabled ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          />
        </button>
      </div>

      <!-- Session Limits Config -->
      <div v-if="editForm.sessionLimitsEnabled" class="mt-4 pt-4 border-t border-gray-500/20">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-white mb-1">Requests per Session</label>
            <input
              v-model.number="editForm.sessionRequestLimit"
              type="number"
              min="0"
              placeholder="e.g., 10"
              class="w-full px-3 py-2 text-sm text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">0 or empty = unlimited</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-white mb-1">Tokens per Session</label>
            <input
              v-model.number="editForm.sessionTokenLimit"
              type="number"
              min="0"
              placeholder="e.g., 5000"
              class="w-full px-3 py-2 text-sm text-white bg-gray-500/10 border border-gray-500/10 rounded-lg focus:ring-2 focus:ring-blue-300/50 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">0 or empty = unlimited</p>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="mt-4 p-3 bg-blue-300/5 border border-blue-300/10 rounded-lg">
          <p class="text-xs text-blue-300 font-medium mb-2">How to use session limits:</p>
          <p class="text-xs text-gray-400">
            Pass a unique session ID in the <code class="bg-gray-500/20 px-1 rounded text-blue-300">x-session</code> header 
            with each request. For chat apps, use the conversation/thread ID.
          </p>
          <pre class="mt-2 text-xs text-gray-500 bg-gray-500/10 p-2 rounded overflow-x-auto"><code>headers: {
  'x-project-key': 'your-key',
  'x-identity': 'user-123',
  'x-session': 'conv-abc123',  // ← Add this
  'x-tier': 'free'
}</code></pre>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <button
      @click="$emit('update')"
      :disabled="updating"
      class="w-full px-4 py-2 bg-blue-300 text-black text-sm font-medium rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ updating ? 'Saving...' : 'Save Privacy Settings' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  editForm: any
  updating: boolean
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const piiCategories = [
  { id: 'email', configKey: 'detectEmail', name: 'Email Addresses', description: 'user@example.com' },
  { id: 'phone', configKey: 'detectPhone', name: 'Phone Numbers', description: '+1 (555) 123-4567' },
  { id: 'ssn', configKey: 'detectSSN', name: 'Social Security', description: '123-45-6789' },
  { id: 'creditCard', configKey: 'detectCreditCard', name: 'Credit Cards', description: '4111-1111-1111-1111' },
  { id: 'ip', configKey: 'detectIpAddress', name: 'IP Addresses', description: '192.168.1.1' },
]

const maskingStyles = [
  {
    value: 'placeholder',
    name: 'Placeholder',
    description: 'Replace with descriptive placeholders',
    example: 'john@example.com → [EMAIL_REDACTED]',
  },
  {
    value: 'redact',
    name: 'Redact',
    description: 'Replace with asterisks matching length',
    example: 'john@example.com → ****************',
  },
  {
    value: 'hash',
    name: 'Hash',
    description: 'Replace with consistent hash tokens',
    example: 'john@example.com → [EMAIL_A7B3C9]',
  },
]

// Initialize anonymizationConfig if not present
onMounted(() => {
  if (!props.editForm.anonymizationConfig) {
    props.editForm.anonymizationConfig = {
      detectEmail: true,
      detectPhone: true,
      detectSSN: true,
      detectCreditCard: true,
      detectIpAddress: true,
      maskingStyle: 'placeholder',
    }
  }
})
</script>

