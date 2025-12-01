# Draft Response for Issue #8955

## GitHub Issue Response

Thanks for raising this @Guria, and @HassenIO for the additional context.

Currently, token consumption information is captured in the `model_generation` span attributes within traces. Each time a model is called, the span records `usage` data including `inputTokens`, `outputTokens`, `totalTokens`, `reasoningTokens`, and `cachedInputTokens`.

Within a single agent execution, token usage is aggregated across multiple model calls (e.g., in agentic loops with tool use), and this is available in the agent's result via `result.usage`. Similarly, agent networks aggregate tokens across multiple agent calls.

However, as you've identified, there is currently **no built-in way to sum token usage across an entire thread**, especially when:
- Multiple agent runs occur in the same thread
- Different models are used in different steps or by different agents
- Workflows call other agents or sub-workflows

To get thread-wide token consumption today, you would need to query the `model_generation` spans from the trace storage and aggregate them manually by thread.

**Planned improvements:**

1. **Thread-level token aggregation** - We plan to add observability features that automatically aggregate token usage at the thread and workflow level, with breakdowns by model.

2. **Metrics over time** - We're also planning to add metrics support, which will allow tracking total usage of different models and other observability metrics over time.

We'll update this issue as we make progress on these features. In the meantime, if you need to implement this today, the token data is available in the span records - you would query spans with `spanType: 'model_generation'` and aggregate the `attributes.usage` field grouped by model and thread.
