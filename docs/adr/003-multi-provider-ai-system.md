# 003. Multi-Provider AI System with Fallback

**Date:** 2024-12-04  
**Status:** Accepted

## Context

The ERP SteinmetZ system requires AI capabilities for various features:
- Chat assistant
- Metadata generation
- Translation
- Speech-to-text

We needed to decide on an AI integration strategy that would:
- Support multiple AI providers (OpenAI, Ollama, Anthropic, Azure)
- Enable local development without API costs
- Provide resilience through fallback mechanisms
- Allow easy switching between providers
- Support future provider additions

## Decision

Implement a multi-provider AI system with automatic fallback.

**Architecture:**
```
┌─────────────────────────────────────┐
│          AI Router Layer            │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │  Provider       │
        │  Selection      │
        │  & Fallback     │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼────┐
│OpenAI │   │Ollama │   │Anthropic│
└───────┘   └───────┘   └────────┘
```

**Key Features:**
- Primary provider configured via `AI_PROVIDER` env variable
- Automatic fallback to alternative providers if primary fails
- Health checks for all providers
- Provider-specific configuration
- Unified interface across all providers

**Priority Order:**
1. Configured primary provider
2. Ollama (local, no API costs)
3. OpenAI (if API key available)
4. Anthropic (if API key available)
5. Fallback provider (simple responses)

## Alternatives Considered

### Alternative 1: Single Provider (OpenAI only)
- **Pros:** Simplest implementation, best quality
- **Cons:** Vendor lock-in, requires API key, costs money
- **Why not:** Too dependent on one provider

### Alternative 2: LangChain
- **Pros:** Rich ecosystem, many integrations
- **Cons:** Heavy dependency, complex abstraction
- **Why not:** Overkill for our needs, adds complexity

### Alternative 3: Build custom for each provider
- **Pros:** Full control, no abstraction
- **Cons:** Code duplication, hard to maintain
- **Why not:** DRY principle, maintenance burden

## Consequences

### Positive
- **Resilience:** System continues working if one provider fails
- **Flexibility:** Easy to switch providers based on needs
- **Cost Control:** Can use free/local providers for development
- **No Vendor Lock-in:** Not dependent on single provider
- **Development Experience:** Local Ollama works offline
- **Production Ready:** Fallback ensures availability

### Negative
- **Complexity:** More code to maintain than single provider
- **Testing Overhead:** Must test all provider integrations
- **Inconsistent Results:** Different providers may give different outputs
- **Configuration:** More environment variables to manage

### Risks
- **Risk:** Provider-specific features may not work everywhere
  - **Mitigation:** Use common subset of features
- **Risk:** Fallback may provide lower quality responses
  - **Mitigation:** Clear logging, monitoring of provider usage
- **Risk:** API costs if accidentally using paid provider
  - **Mitigation:** Rate limiting, usage monitoring

## Implementation Notes

### Provider Interface

```typescript
interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateText(prompt: string, options?: Options): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  transcribeAudio(file: Buffer): Promise<string>;
}
```

### Fallback Logic

```typescript
async function generateAIResponse(model: string, messages: ChatMessage[]): Promise<string> {
  const providers = [
    primaryProvider,
    ollamaProvider,
    openaiProvider,
    fallbackProvider
  ];
  
  for (const provider of providers) {
    if (await provider.isAvailable()) {
      try {
        return await provider.generateText(messages);
      } catch (err) {
        logger.warn(`Provider ${provider.name} failed, trying next`);
        continue;
      }
    }
  }
  
  throw new Error('All AI providers unavailable');
}
```

### Configuration

```bash
# Primary provider
AI_PROVIDER=ollama

# Provider-specific configs
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet
```

### Health Checks

Each provider implements health check:
```typescript
async isAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Ollama Documentation](https://ollama.ai/docs)
- [Anthropic Claude API](https://www.anthropic.com/api)
- [HEALTH_CHECKS.md](../HEALTH_CHECKS.md)

---

**Author:** Thomas Heisig  
**Status:** Accepted  
**Last Updated:** 2024-12-04
