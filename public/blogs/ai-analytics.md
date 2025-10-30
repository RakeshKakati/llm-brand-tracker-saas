# AI Analytics

Analytics enhanced by AI assistants and automation.

> TL;DR: Add NL insights to BI, automate anomaly detection, and use forecasting with clear validation. Keep a human in the loop for material decisions.

## Table of contents
- What is AI analytics
- Where AI helps
- Tooling options
- Implementation steps
- Validation and governance
- FAQs
- Related reads

## What is AI analytics?
Analytics workflows that use AI to translate questions into queries, summarize trends, detect anomalies, and forecast outcomes—embedded in BI/notebooks.

## Where AI helps
- NLQ: ask questions in natural language and generate draft queries
- Narrative: auto-summarized insights with context and visuals
- Anomalies: alerting on unexpected changes
- Forecasting: high-level projections with confidence intervals

## Tooling options
- BI: Looker + Gemini, Power BI + Copilot, Tableau + Pulse, Mode + AI
- Notebooks: Hex + AI (notebook + app), Databricks + Mosaic AI
- Data platforms: BigQuery + Vertex AI, Snowflake Cortex

## Implementation steps
1. Define trusted datasets and metrics with owners
2. Enable AI features in BI; restrict to curated models
3. Establish review workflows and data dictionary links
4. Track adoption, correctness rate, time-to-answer

## Validation and governance
- Keep logs for prompts/outputs
- Compare AI answers to ground truth regularly
- Escalate to analysts for strategic decisions

## FAQs
- Will NLQ replace SQL? No; it speeds exploration, SQL still verifies.
- How do we prevent hallucinations? Constrain to governed models and add citations.

## Related reads
- [AI Tools for Data Analysis](/blogs/ai-tools-for-data-analysis)
- [Data Analyst AI](/blogs/data-analyst-ai)

## Conclusion
Focus on decision quality and governance—AI should amplify, not replace, analytics discipline.
