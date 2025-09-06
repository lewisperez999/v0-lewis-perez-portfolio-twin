# AI Chat Configuration

## Environment Variables

### `CONVERSATION_LIMIT`

Controls how many previous messages the AI chat remembers during conversations.

**Default Value:** `6` (3 user messages + 3 AI responses)

**Valid Range:** `2` to `50` messages

**Usage Examples:**

```bash
# Short conversations (minimal memory usage)
CONVERSATION_LIMIT=4

# Default setting (balanced)
CONVERSATION_LIMIT=6

# Extended conversations (more context, higher token usage)
CONVERSATION_LIMIT=12

# Long technical discussions (maximum context)
CONVERSATION_LIMIT=20
```

### How It Works

The conversation limit determines how many previous messages are included in each AI request:

```typescript
// With CONVERSATION_LIMIT=6
[
  { role: "system", content: "You are Lewis Perez..." },
  { role: "user", content: "What's your Java experience?" },     // Message -6
  { role: "assistant", content: "I have 8+ years..." },          // Message -5
  { role: "user", content: "Tell me about Spring Boot" },        // Message -4
  { role: "assistant", content: "I've built several..." },       // Message -3
  { role: "user", content: "Any microservices work?" },          // Message -2
  { role: "assistant", content: "Yes, at ING I led..." },        // Message -1
  { role: "user", content: "Can you elaborate on that?" }        // Current message
]
```

### Trade-offs

#### Lower Limits (2-6 messages)
✅ **Pros:**
- Lower token usage = faster responses
- Lower API costs
- Consistent performance
- Better for distinct questions

❌ **Cons:**
- Limited follow-up capability
- Context lost in longer conversations

#### Higher Limits (12-20 messages)
✅ **Pros:**
- Better conversation continuity
- Enhanced follow-up responses
- More context for complex discussions

❌ **Cons:**
- Higher token usage = slower responses
- Higher API costs
- Potential token limit issues with very long messages

### Recommended Settings

| Use Case | Limit | Rationale |
|----------|-------|-----------|
| **Portfolio Demo** | 6 | Balanced performance and capability |
| **Technical Interviews** | 12 | Better for detailed technical discussions |
| **Development/Testing** | 4 | Faster iteration, lower costs |
| **Production (High Traffic)** | 6 | Cost-effective with good UX |
| **Production (Premium)** | 10-15 | Enhanced user experience |

### Token Usage Impact

**Approximate token usage per conversation limit:**

```bash
CONVERSATION_LIMIT=4  → ~2,000-4,000 tokens per request
CONVERSATION_LIMIT=6  → ~3,000-6,000 tokens per request  
CONVERSATION_LIMIT=12 → ~6,000-12,000 tokens per request
CONVERSATION_LIMIT=20 → ~10,000-20,000 tokens per request
```

*Note: Actual usage depends on message length and RAG context size*

### Configuration in Different Environments

#### Local Development
```bash
# .env.local
CONVERSATION_LIMIT=4  # Fast iteration
```

#### Vercel Production
```bash
# Vercel Dashboard → Environment Variables
CONVERSATION_LIMIT=8  # Production balance
```

#### Docker Deployment
```bash
# docker-compose.yml
environment:
  - CONVERSATION_LIMIT=10
```

### Monitoring and Optimization

To optimize your conversation limit:

1. **Monitor token usage** in your AI provider dashboard
2. **Track response times** - higher limits = slower responses
3. **Analyze conversation patterns** - do users need long context?
4. **Consider user types** - technical users may need more context

### Advanced Configuration

For dynamic conversation limits based on conversation type:

```typescript
// Future enhancement idea
const limit = detectConversationType(userMessage) === 'technical' ? 12 : 6
```

### Troubleshooting

**Problem:** Responses seem disconnected from earlier conversation
**Solution:** Increase `CONVERSATION_LIMIT` from 6 to 10-12

**Problem:** Slow responses or high costs
**Solution:** Decrease `CONVERSATION_LIMIT` from current value to 4-6

**Problem:** Token limit errors
**Solution:** Decrease `CONVERSATION_LIMIT` and monitor message lengths

**Problem:** Environment variable not working
**Solution:** Restart your development server after changing `.env.local`

### Security Considerations

- Keep conversation limits reasonable (2-50) to prevent abuse
- Higher limits increase API costs if under attack
- Monitor usage patterns for unusual conversation lengths
- Consider rate limiting for expensive conversation settings