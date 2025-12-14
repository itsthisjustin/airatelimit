# Dynamic AI Provider Switching

Switch between OpenAI, Gemini, and Claude without app updates using Firebase Remote Config.

## Setup

### 1. Firebase Remote Config

Create these parameters in Firebase Console:

| Parameter | Default Value |
|-----------|---------------|
| `ai_provider` | `openai` |
| `openai_model_name` | `gpt-4.1-mini` |
| `gemini_model_name` | `gemini-2.5-flash` |
| `anthropic_model_name` | `claude-3-5-sonnet-20241022` |

### 2. AI Ratelimit

Add your API keys for each provider in Dashboard → Settings → API Keys.

## Code Examples

### Swift

```swift
import FirebaseRemoteConfig

let config = RemoteConfig.remoteConfig()

// Get current model from config
let provider = config["ai_provider"].stringValue ?? "openai"
let model = config["\(provider)_model_name"].stringValue ?? "gpt-4.1-mini"

// Use with AI Ratelimit
let body: [String: Any] = ["model": model, "messages": messages]
request.setValue("pk_xxx", forHTTPHeaderField: "x-project-key")
request.setValue(userID, forHTTPHeaderField: "x-identity")
```

### Kotlin

```kotlin
val config = FirebaseRemoteConfig.getInstance()

// Get current model from config
val provider = config.getString("ai_provider")
val model = config.getString("${provider}_model_name")

// Use with AI Ratelimit
request.addHeader("x-project-key", "pk_xxx")
request.addHeader("x-identity", userID)
```

### React Native

```typescript
import remoteConfig from '@react-native-firebase/remote-config';

const provider = remoteConfig().getString('ai_provider');
const model = remoteConfig().getString(`${provider}_model_name`);

fetch('https://api.airatelimit.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'x-project-key': 'pk_xxx',
    'x-identity': userID,
  },
  body: JSON.stringify({ model, messages }),
});
```

## Use Cases

- **A/B test providers** — Route 10% of users to Gemini, measure quality
- **Instant failover** — OpenAI down? Switch to Claude in seconds
- **Gradual rollouts** — Test new models with beta users first
