# AI Ratelimit

Add usage limits to your AI app in 5 minutes. Track usage per user, set limits per model, create pricing tiers—all without storing prompts.

```typescript
// Free users get 5 GPT-4o requests, unlimited Gemini
// Pro users get 500 GPT-4o requests, unlimited everything else
const result = await client.chat({
  identity: 'user-123',
  tier: 'free',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Why?

Building a freemium AI app? You need:
- ✅ Limit free tier without building billing
- ✅ Track anonymous users (no login required)
- ✅ Different limits per model (gpt-4o: expensive, gemini: cheap)
- ✅ Custom upgrade prompts when limits hit
- ✅ Privacy-first (never store prompts or responses)

This does all that.

## Quick Start

### 1. Deploy (2 minutes)

**Railway (Recommended):**
1. Push to GitHub
2. Connect to [Railway](https://railway.app)
3. Add PostgreSQL
4. Set `DATABASE_URL` and `JWT_SECRET` env vars
5. Deploy ✨

**Local:**
```bash
npm install && cd dashboard && npm install && cd ..
docker run --name ai-proxy-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_proxy -p 5433:5432 -d postgres:15
cp env.example .env  # Edit with your settings
npm run start
```

Dashboard: `http://localhost:3001` | Backend: `http://localhost:3000`

### 2. Create Project (30 seconds)

1. Open dashboard → Sign up (magic link)
2. Create project with a name
3. Add your AI provider + API key
4. Copy your project key (`pk_...`)

### 3. Use SDK (5 lines)

```bash
npm install @ai-ratelimit/sdk
```

```typescript
import { createClient } from '@ai-ratelimit/sdk';

const client = createClient({
  baseUrl: 'https://your-app.railway.app/api',
  projectKey: 'pk_your_key_here',
});

const result = await client.chat({
  identity: 'user-123',      // User ID, session, or device ID
  tier: 'free',              // Optional: free, pro, etc.
  model: 'gpt-4o',           // Any model from your provider
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

Done! Usage is tracked automatically.

## Key Features

### Per-Model Limits
Set different limits for each model:
```typescript
// Unlimited cheap models, limited expensive ones
gemini-2.5: unlimited
gpt-4o: 5 requests/day (free), 500 requests/day (pro)
claude-3-5-sonnet: 50 requests/day
```

### Pricing Tiers
Configure limits per tier (free, pro, enterprise):
```typescript
free:  5 GPT-4o requests, unlimited Gemini
pro:   500 GPT-4o requests, unlimited everything
```

### Custom Messages
Show upgrade prompts with deep links:
```json
{
  "message": "You've used {{usage}}/{{limit}} free requests. [Upgrade to Pro](app://upgrade)!",
  "deepLink": "app://upgrade"
}
```

### Multi-Provider
- OpenAI (GPT-4o, o1, etc.)
- Anthropic (Claude 3.5 Sonnet)
- Google (Gemini 2.5)
- xAI (Grok)
- Any OpenAI-compatible API

### Privacy-First
- Never stores prompts or responses
- Only tracks: identity, usage counts, timestamps
- GDPR/CCPA friendly

### Anonymous Users
No login required—track by:
- Device ID
- Session ID
- IP address
- Custom identifier

## Configuration Examples

### Simple: One limit for everyone
```typescript
// In dashboard: Set daily limit to 100 requests
// All users get same limit
```

### Per-Model: Different limits per model
```typescript
// Model Limits tab:
gpt-4o: 10 requests
gemini-2.5: unlimited
claude-3-5-sonnet: 50 requests
```

### Tiered: Free vs Pro
```typescript
// Plan Tiers tab:
free: {
  gpt-4o: 5 requests,
  gemini-2.5: unlimited
}
pro: {
  gpt-4o: 500 requests,
  gemini-2.5: unlimited
}
```

### Advanced: Tier + Model + Period
```typescript
// Weekly limits, different per tier and model
limitPeriod: 'weekly'
free: {
  gpt-4o: 10/week,
  gemini: unlimited
}
pro: {
  gpt-4o: 1000/week,
  everything else: unlimited
}
```

## Limit Periods

Choose when limits reset:
- **Daily** - Reset at midnight UTC
- **Weekly** - Reset Monday midnight UTC
- **Monthly** - Reset 1st of month UTC

## Supported Providers

| Provider | Models | Streaming |
|----------|--------|-----------|
| OpenAI | gpt-4o, gpt-4o-mini, o1-preview, o1-mini, etc. | ✅ |
| Anthropic | claude-3-5-sonnet, claude-3-opus, haiku | ✅ |
| Google | gemini-2.5-flash, gemini-1.5-pro | ✅ |
| xAI | grok-beta, grok-2 | ✅ |
| Other | Any OpenAI-compatible API | ✅ |

## Dashboard Features

- **Visual rule builder** - Create complex rules without code
- **Analytics** - See usage per user, model, tier
- **Model autocomplete** - Prevents typos, suggests models
- **Test simulator** - Test rules before deploying

## API Response (Limit Exceeded)

```json
{
  "error": "limit_exceeded",
  "message": "You've used 5/5 free requests this week. Upgrade to Pro for 500 requests!",
  "deepLink": "app://upgrade",
  "usage": 5,
  "limit": 5,
  "tier": "free",
  "period": "weekly"
}
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# Optional
PORT=3000
RESEND_API_KEY=re_...  # For magic link emails
```

## Tech Stack

- **Backend:** NestJS + TypeORM + PostgreSQL
- **Dashboard:** Nuxt 3 + Vue 3 + TailwindCSS
- **SDK:** TypeScript
- **Deploy:** Railway, Render, or self-host

## Use Cases

**Image Generation Apps:**
```typescript
limitType: 'requests'  // Count images, not tokens
free: 5 images/day
pro: 100 images/day
```

**Chat Apps:**
```typescript
limitType: 'tokens'  // Count tokens, not requests
free: 10k tokens/day
pro: 500k tokens/day
```

**Multi-Model Apps:**
```typescript
// Give unlimited cheap models, limit expensive ones
gemini-2.5: unlimited
gpt-4o: 5 requests (free), 500 requests (pro)
```

## Privacy

- ✅ Never logs prompts or responses
- ✅ Only stores: identity, count, timestamp
- ✅ No AI data leaves your provider
- ✅ Open source—audit the code

## Links

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Customer Demo](CUSTOMER_DEMO.md) - Interactive walkthrough
- [SDK Docs](sdk/js/README.md) - JavaScript SDK reference

## License

MIT

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/treadiehq/airatelimit/issues)
- 💬 Questions: Open a discussion
- 📧 Email: support@treadie.com

---

Built by [Treadie](https://treadie.com) • MIT Licensed • Open Source
