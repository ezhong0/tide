# AI Model Configuration

**Date**: 2025-10-07
**Alpha Version**: GPT-5 Only

---

## Primary AI Model: GPT-5 (OpenAI)

Tide Alpha uses **GPT-5 models exclusively** (released August 7, 2025).

---

## Available GPT-5 Models

### 1. **gpt-5** (Full Model)
- **Use Case**: Advanced reasoning, complex analysis, critical decisions
- **Context**: 272,000 input tokens / 128,000 output tokens
- **Cost**: $1.25/1M input, $10/1M output (averaged: $0.00125/1K tokens)
- **Latency**: ~1000ms
- **Accuracy**: 98%
- **Capabilities**: Reasoning, creativity, analysis, coding
- **When Used**: Complex reasoning tasks, critical decisions requiring validation

### 2. **gpt-5-mini** (Balanced) ⭐ **PRIMARY**
- **Use Case**: General purpose, best cost/performance balance
- **Context**: 272,000 input tokens / 128,000 output tokens
- **Cost**: $0.25/1M input, $2.00/1M output (averaged: $0.00025/1K tokens)
- **Latency**: ~200ms
- **Accuracy**: 94%
- **Capabilities**: Conversation, summarization, analysis, reasoning
- **When Used**: Most user requests (default model)

### 3. **gpt-5-nano** (Fast)
- **Use Case**: Speed-optimized, simple tasks
- **Context**: 272,000 input tokens / 128,000 output tokens
- **Cost**: $0.05/1M input, $0.40/1M output (averaged: $0.00005/1K tokens)
- **Latency**: ~50ms
- **Accuracy**: 88%
- **Capabilities**: Classification, extraction, simple tasks, speed
- **When Used**: Urgent requests, simple classification, fast responses

---

## Model Selection Strategy

The Multi-Model Router automatically selects the optimal model based on request characteristics:

### Routing Logic

1. **Critical Decisions** (criticality > 0.9):
   - Primary: `gpt-5`
   - Validator: `gpt-5-mini`
   - Aggregation: Weighted vote
   - Example: "Approve this $1M budget proposal"

2. **Privacy-Sensitive** (sensitivity > 0.8):
   - Model: `gpt-5-mini`
   - Example: "Analyze this salary information"

3. **Time-Sensitive** (urgency > 0.8):
   - Model: `gpt-5-nano`
   - Example: "URGENT: Quick question about meeting time"

4. **Complex Reasoning** (complexity > 0.7 OR requires reasoning):
   - Model: `gpt-5`
   - Example: "Explain why this strategy will work"

5. **Standard Requests** (default):
   - Model: `gpt-5-mini`
   - Example: "Show me my urgent emails"

---

## Cost Analysis (Alpha with 100 Users)

### Expected Usage
- **100 users** × 50 requests/day × 30 days = **150,000 requests/month**
- **Average tokens per request**: ~1,000 tokens (500 input + 500 output)
- **Total tokens**: 150M tokens/month

### Model Distribution (Estimated)
- **70% gpt-5-mini** (balanced): 105M tokens @ $0.00025/1K = **$26.25**
- **20% gpt-5-nano** (fast): 30M tokens @ $0.00005/1K = **$1.50**
- **10% gpt-5** (advanced): 15M tokens @ $0.00125/1K = **$18.75**

**Total Alpha Cost**: **~$47/month** for 100 users

**Per User Cost**: **$0.47/month** (very affordable!)

### Scaling Projections
- **1,000 users**: ~$470/month
- **10,000 users**: ~$4,700/month
- **100,000 users**: ~$47,000/month

---

## Environment Configuration

### Required API Key (from .env)

```bash
# OpenAI API Key (GPT-5 access)
OPENAI_API_KEY=sk-proj-jWwgGa0sgNsF31IbFUCuFyCi_jmGJzv4P-HncoDhjw...

# Set in Railway environment variables
railway variables set OPENAI_API_KEY=<your-key> --service tide-ai
```

### NOT Used in Alpha
```bash
# Anthropic API Key - NOT USED FOR ALPHA
# ANTHROPIC_API_KEY=<anthropic-key>

# Keep in .env for future but don't set in Railway
```

---

## Request Examples

### Example 1: Standard Request → gpt-5-mini
```
User: "Show me my top 3 urgent emails"

Router Analysis:
- Criticality: 0.3 (not critical)
- Urgency: 0.5 (normal)
- Complexity: 0.3 (simple)

Selected Model: gpt-5-mini
Reasoning: "Standard request using balanced cost/quality model"
Cost: ~$0.00025 per request
```

### Example 2: Urgent Request → gpt-5-nano
```
User: "URGENT: What time is my next meeting?"

Router Analysis:
- Urgency: 0.9 (urgent keyword detected)

Selected Model: gpt-5-nano
Reasoning: "Urgent request requires fastest response"
Cost: ~$0.00005 per request
```

### Example 3: Complex Reasoning → gpt-5
```
User: "Analyze why this sales strategy will fail and suggest alternatives"

Router Analysis:
- Requires Reasoning: true
- Complexity: 0.8 (analyze, compare, suggest)

Selected Model: gpt-5
Reasoning: "Complex reasoning task requires GPT-5 full model"
Cost: ~$0.00125 per request
```

### Example 4: Critical Decision → gpt-5 + gpt-5-mini Ensemble
```
User: "Should I approve this contract with legal implications?"

Router Analysis:
- Criticality: 0.95 (contract, legal keywords)

Selected Models:
- Primary: gpt-5
- Validator: gpt-5-mini
- Aggregation: weighted_vote

Reasoning: "Critical decision requires multi-model validation"
Cost: ~$0.00150 per request (both models)
```

---

## Performance Benchmarks

### Response Times (Average)
- **gpt-5-nano**: 50-100ms
- **gpt-5-mini**: 200-400ms
- **gpt-5**: 800-1500ms

### Accuracy (on Tide benchmark tasks)
- **gpt-5-nano**: 88% (good for simple tasks)
- **gpt-5-mini**: 94% (excellent for most tasks)
- **gpt-5**: 98% (best for complex reasoning)

### Token Efficiency
- **Context Window**: 272K tokens (all models)
- **Output Limit**: 128K tokens (all models)
- **Enough for**: ~200 pages of text in context

---

## Future Expansion (Post-Alpha)

### Week 5+: Optional Multi-Model Support
Once Alpha is stable, we can add:
- **Claude 3.5 Sonnet** for comparison/validation
- **Claude 3 Opus** for specialized reasoning tasks
- **Local models** for privacy-sensitive content

### Why Not Now?
- Focus on single provider (OpenAI) reduces complexity
- GPT-5 models handle all use cases well
- Simplifies debugging and cost tracking
- Faster Alpha deployment

---

## Monitoring & Optimization

### Metrics to Track
- **Model distribution**: Which models are used most?
- **Cost per user**: Staying within budget?
- **Response times**: Meeting SLAs?
- **Accuracy**: User satisfaction with responses?

### Optimization Opportunities
- **Cache frequent queries**: Reduce API calls
- **Batch processing**: Combine similar requests
- **Fine-tuning**: Custom models for specific tasks (future)
- **Prompt optimization**: Reduce token usage

---

## API Key Security

### Best Practices ✅
- ✅ Store API key in Railway environment variables (encrypted)
- ✅ Never commit API key to git
- ✅ Rotate API key quarterly
- ✅ Monitor usage for anomalies
- ✅ Set spending limits in OpenAI dashboard

### OpenAI Dashboard Settings
1. Go to https://platform.openai.com/usage
2. Set **hard limit**: $500/month (adjust as needed)
3. Set **soft limit**: $250/month (email alert)
4. Monitor usage daily during Alpha

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Verify `OPENAI_API_KEY` is set in Railway:
```bash
railway variables --service tide-ai
```

### Issue: "Rate limit exceeded"
**Solution**:
1. Check OpenAI dashboard for rate limits
2. Implement request queuing
3. Use gpt-5-nano for simple tasks to reduce load

### Issue: "High costs"
**Solution**:
1. Check which model is being used most
2. Optimize prompts to reduce tokens
3. Cache common responses
4. Consider using gpt-5-nano for more tasks

---

**Updated**: 2025-10-07
**Status**: Alpha Configuration (GPT-5 Only)
**Next Review**: After Alpha launch (Week 5)
