/**
 * Model-to-Provider Resolver
 * Maps AI model names to their respective providers
 */

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'xai' | 'other';

// Model prefix patterns for each provider
const MODEL_PATTERNS: Record<ProviderType, RegExp[]> = {
  openai: [
    /^gpt-/i,
    /^o1/i,
    /^o3/i,
    /^chatgpt/i,
    /^text-davinci/i,
    /^text-embedding/i,
    /^whisper/i,
    /^tts/i,
    /^dall-e/i,
  ],
  anthropic: [
    /^claude/i,
  ],
  google: [
    /^gemini/i,
    /^palm/i,
    /^bard/i,
  ],
  xai: [
    /^grok/i,
  ],
  other: [],
};

// Known model mappings for exact matches
const KNOWN_MODELS: Record<string, ProviderType> = {
  // OpenAI
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-4-turbo-preview': 'openai',
  'gpt-4': 'openai',
  'gpt-4-32k': 'openai',
  'gpt-3.5-turbo': 'openai',
  'gpt-3.5-turbo-16k': 'openai',
  'o1-preview': 'openai',
  'o1-mini': 'openai',
  'o1': 'openai',
  'o3-mini': 'openai',
  
  // Anthropic
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-sonnet-latest': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  'claude-3-sonnet-20240229': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
  'claude-2.1': 'anthropic',
  'claude-2.0': 'anthropic',
  'claude-instant-1.2': 'anthropic',
  
  // Google
  'gemini-2.5-pro': 'google',
  'gemini-2.5-flash': 'google',
  'gemini-2.0-flash-exp': 'google',
  'gemini-1.5-pro': 'google',
  'gemini-1.5-flash': 'google',
  'gemini-1.0-pro': 'google',
  'gemini-pro': 'google',
  'gemini-pro-vision': 'google',
  
  // xAI
  'grok-beta': 'xai',
  'grok-2-1212': 'xai',
  'grok-2': 'xai',
  'grok-1': 'xai',
};

/**
 * Resolves a model name to its provider
 * @param model The model name (e.g., "gpt-4o", "claude-3-5-sonnet-latest")
 * @returns The provider type or null if unknown
 */
export function resolveModelProvider(model: string): ProviderType | null {
  if (!model) return null;

  const normalizedModel = model.toLowerCase().trim();

  // First, try exact match
  if (KNOWN_MODELS[normalizedModel]) {
    return KNOWN_MODELS[normalizedModel];
  }

  // Then, try pattern matching
  for (const [provider, patterns] of Object.entries(MODEL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(model)) {
        return provider as ProviderType;
      }
    }
  }

  return null;
}

/**
 * Gets the list of known models for a specific provider
 * @param provider The provider type
 * @returns Array of model names
 */
export function getModelsForProvider(provider: ProviderType): string[] {
  return Object.entries(KNOWN_MODELS)
    .filter(([_, p]) => p === provider)
    .map(([model]) => model);
}

/**
 * Checks if a model belongs to a specific provider
 * @param model The model name
 * @param provider The provider to check against
 * @returns True if the model belongs to the provider
 */
export function isModelFromProvider(model: string, provider: ProviderType): boolean {
  const resolved = resolveModelProvider(model);
  return resolved === provider;
}

/**
 * Gets all known models grouped by provider
 */
export function getAllModelsByProvider(): Record<ProviderType, string[]> {
  const result: Record<ProviderType, string[]> = {
    openai: [],
    anthropic: [],
    google: [],
    xai: [],
    other: [],
  };

  for (const [model, provider] of Object.entries(KNOWN_MODELS)) {
    result[provider].push(model);
  }

  return result;
}

