# AI SDK Multi-Provider Migration Guide

## Overview

This application has been successfully migrated from direct OpenAI SDK to **Vercel AI SDK**, enabling seamless multi-provider LLM support.

## ✅ What Changed

### Code Changes
- **Streaming Endpoint** (`/api/bot/stream/route.ts`): Migrated to AI SDK `streamText()`
- **Fallback API** (`/actions/bot/index.ts`): Migrated to AI SDK `generateText()`
- **Model Registry** (`/lib/ai-models.ts`): New centralized model management

### What Stayed the Same
- ✅ Database schema (no migrations needed)
- ✅ Client-side code (widget unchanged)
- ✅ All business logic (caching, RAG, credits, state management)
- ✅ Markdown processing and TTFT tracking
- ✅ Error handling and metrics

## 🚀 Supported Providers

### OpenAI (Primary)
- `gpt-4o` - Most capable GPT-4 model
- `gpt-4o-mini` - Fast and affordable (default)
- `gpt-4-turbo` - Previous generation flagship
- `gpt-3.5-turbo` - Fast and economical

### Anthropic Claude
- `claude-3-5-sonnet-20241022` - Best Claude model
- `claude-3-5-haiku-20241022` - Fastest Claude model
- `claude-3-opus-20240229` - Excellent writing quality

### Google Gemini
- `gemini-2.0-flash-exp` - Experimental fast model (1M context)
- `gemini-1.5-pro` - Most capable Gemini (2M context)
- `gemini-1.5-flash` - Fast and efficient (1M context)

## 📝 How to Switch Models

### Method 1: Database Update (Recommended)
```sql
-- Switch to Claude 3.5 Sonnet
UPDATE "ChatBot"
SET "llmModel" = 'claude-3-5-sonnet-20241022'
WHERE "domainId" = 'your-domain-id';

-- Switch to Gemini 2.0 Flash
UPDATE "ChatBot"
SET "llmModel" = 'gemini-2.0-flash-exp'
WHERE "domainId" = 'your-domain-id';

-- Back to GPT-4o Mini
UPDATE "ChatBot"
SET "llmModel" = 'gpt-4o-mini'
WHERE "domainId" = 'your-domain-id';
```

### Method 2: Via Settings UI
The `llmModel` field can be exposed in your chatbot settings UI as a dropdown. Use the `AVAILABLE_MODELS` export from `/lib/ai-models.ts`.

## 🔑 API Key Configuration

### Required
```bash
OPENAI_API_KEY=sk-proj-...
```

### Optional (only needed when using that provider)
```bash
# For Claude models
ANTHROPIC_API_KEY=sk-ant-api03-...

# For Gemini models
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Google: https://aistudio.google.com/app/apikey

## 🧪 Testing

### Test OpenAI (Should work immediately)
```bash
npm run dev
# Test chatbot - should use gpt-4o-mini by default
```

### Test Anthropic
1. Add `ANTHROPIC_API_KEY` to `.env`
2. Update database: `llmModel = 'claude-3-5-haiku-20241022'`
3. Test chatbot - should use Claude

### Test Google
1. Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env`
2. Update database: `llmModel = 'gemini-1.5-flash'`
3. Test chatbot - should use Gemini

## 🎯 Benefits

1. **Multi-Provider Support** - Switch models without code deployment
2. **Cost Optimization** - Use cheaper models for simple queries
3. **A/B Testing** - Test different models per user/domain
4. **Fallback Strategy** - Switch providers if one is down
5. **Future-Proof** - Easy to add new providers (xAI Grok, Mistral, etc.)

## 📊 Model Comparison

| Model | Provider | Cost (per 1M tokens) | Context Window | Best For |
|-------|----------|---------------------|----------------|----------|
| gpt-4o-mini | OpenAI | $0.15 / $0.60 | 128K | General purpose, cost-effective |
| gpt-4o | OpenAI | $2.50 / $10.00 | 128K | Complex reasoning, vision |
| claude-3-5-haiku | Anthropic | $0.80 / $4.00 | 200K | Fast responses, simple tasks |
| claude-3-5-sonnet | Anthropic | $3.00 / $15.00 | 200K | Complex reasoning, writing |
| gemini-1.5-flash | Google | $0.075 / $0.30 | 1M | Huge context, cost-effective |
| gemini-2.0-flash | Google | Free (preview) | 1M | Experimental features |

*Costs: input / output*

## 🔧 Advanced Configuration

### Custom Model Settings
Each model respects the `llmTemperature` field (0.0 - 2.0):
- `0.0` - Deterministic, focused
- `0.7` - Balanced (default)
- `1.0+` - Creative, diverse

### Debug Mode
Enable detailed logging:
```bash
DEBUG_LLM=true npm run dev
```

Shows:
- Complete request/response
- Token counts
- TTFT (Time To First Token)
- Stream duration

## 🆘 Troubleshooting

### "Unknown model" Warning
The system will fall back to `gpt-4o-mini` if model ID is not recognized. Check:
1. Model ID is correct (case-sensitive)
2. Provider API key is set in `.env`
3. Check `/lib/ai-models.ts` for supported models

### API Key Errors
- **OpenAI**: "Incorrect API key provided" → Check `OPENAI_API_KEY`
- **Anthropic**: "Authentication error" → Check `ANTHROPIC_API_KEY`
- **Google**: "API_KEY_INVALID" → Check `GOOGLE_GENERATIVE_AI_API_KEY`

### Performance Issues
- High TTFT → Consider faster model (haiku, flash)
- High costs → Switch to cheaper model (gpt-4o-mini, gemini-flash)
- Rate limits → Implement model rotation or queueing

## 🔮 Future Enhancements

### Coming Soon
- **xAI Grok** - High-performance reasoning
- **Mistral AI** - European-based provider
- **Groq** - Ultra-fast inference
- **UI Model Selector** - Choose model per chatbot in settings

### Potential Features
- A/B testing framework
- Automatic model fallback on errors
- Cost tracking per model
- Model performance analytics

## 📚 Resources

- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [AI SDK Providers](https://ai-sdk.dev/providers)
- [Model Registry Source](/lib/ai-models.ts)

## ⚠️ Important Notes

1. **OpenAI Required**: Even if using other providers, OpenAI is used for embeddings
2. **Database Field**: `llmModel` field controls which model is used
3. **No Breaking Changes**: Existing chatbots continue working with default model
4. **API Keys**: Optional providers only needed when actively using those models

---

**Migration Completed**: All systems operational with multi-provider support! 🎉
