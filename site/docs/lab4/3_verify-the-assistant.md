---
sidebar_position: 3
---

import TryIt from '@site/src/components/TryIt';

# 4.3. Check the Assistant's read

*One last time: ask the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) to investigate, and check that it recognizes the pattern you found.*

:::note

LLM output varies between runs. Judge the Assistant on whether it identifies the N+1 pattern and backs it with the same evidence - the high call count and the repeated span.

:::

---

## Question 1: What does the Assistant find?

**Ask the Assistant to investigate the slow transaction-history requests.**

Use a prompt like: *"The banking transaction history page is slow but nothing is erroring. Investigate the traces and database for the transaction service and tell me why."*

<TryIt where="the Grafana Assistant button in the top-right corner of Grafana.">Ask Grafana Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should identify the N+1 pattern - a single request issuing many repeated, identical database queries, each fast but collectively slow - and recommend batching them into one query / JOIN.

```
The transaction-history request executes the same per-transaction query hundreds
of times (high call count, low per-call duration) - an N+1 access pattern. The
latency is the accumulation of many round-trips, not one slow query.
Fix: fetch the related rows in a single batched query or JOIN.
```

**How to find it:**

1. Open the **Grafana Assistant**.
2. Ask it to investigate the slow transaction service across traces and the database.
3. Read its conclusion and recommended fix.

![Assistant identifies the N+1](/img/lab4/4.7-assistant-summary.png)

</details>

---

## Question 2: Verify its evidence

**Did the Assistant reach the N+1 conclusion from real evidence - the repeated span and the call count?**

<TryIt where="the Assistant's expanded tool calls - check them against the trace (4.1) and the Calls column (4.2)." />

<details className="answer-reveal">
<summary>Show answer</summary>

Check its reasoning against yours:

- Did it observe the **repeated database span** within one trace (matching 4.1)?
- Did it note the **high Calls / low Duration** shape in the query metrics (matching 4.2)?
- Does its fix (batch / JOIN) actually address an N+1? An index suggestion, for example, wouldn't - the problem is the round-trip count, not the per-query cost.

If the evidence maps to what you found, the conclusion is sound.

**How to find it:**

1. Expand the Assistant's tool calls.
2. Confirm it cited the repeated span and the call count.
3. Sanity-check that the fix fits an N+1 specifically.

</details>

---

## You've finished!

Across four labs you've used **Frontend Observability**, **Database Observability**, **Kubernetes Monitoring**, the **Knowledge Graph** (Entity Catalog, Entity Graph, RCA Workbench), **Drilldown** for logs and traces, and the **Grafana Assistant** - each on a problem it's suited to. The pattern is the same everywhere: start from the user's symptom, pick the right lens, follow the evidence, and verify the AI.

Thanks for taking part!
