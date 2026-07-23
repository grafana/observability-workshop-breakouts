---
sidebar_position: 3
---

import TryIt from '@site/src/components/TryIt';

# 4.3. Check the Assistant's read

*One last time: ask the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) to investigate, and verify it recognises the anti-pattern you found.*

:::note

LLM output varies between runs. Judge the Assistant on whether it identifies the N+1 pattern and backs it with the same evidence - the high call count and the repeated span.

:::

---

## Question 1: What does the Assistant find?

**Ask the Assistant to investigate the slow transaction-history requests. What does it report?**

Open the Assistant and prompt something like: *"The banking transaction history page is slow but nothing is erroring. Investigate the traces and database for the transaction service and tell me why."*

<TryIt>Ask the Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should identify the **N+1 query pattern**: a single request issuing many repeated, identical database queries, each fast but collectively slow, and recommend **batching them into one query / JOIN**.

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

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Check its reasoning against yours:

- Did it observe the **repeated database span** within one trace (matching 4.1)? ✅
- Did it note the **high Calls / low Duration** shape in the query metrics (matching 4.2)? ✅
- Does its fix (**batch / JOIN**) actually address an N+1, rather than, say, suggesting an index (which wouldn't fix the round-trip count)?

If its evidence maps to what you found, the conclusion is sound. If it proposed a fix that doesn't match an N+1, that's exactly the kind of plausible-but-wrong answer this verification habit is built to catch.

**How to find it:**

1. Expand the Assistant's tool calls / steps.
2. Confirm it cited the repeated span and the call count.
3. Sanity-check that the fix fits an N+1 specifically.

</details>

---

## Wrap-up

In an app you'd never seen, you:

- framed the slowness with **Traces Drilldown** (Duration + Root cause latency),
- recognised an **N+1 query** from the repeated span in the trace,
- confirmed it from the database side via **Calls** and **Query Samples** in Database Observability,
- understood **why duration-based views missed it**,
- and verified the **Assistant** reached the same conclusion from the same evidence.

> **Why this matters:** the tools and the instincts transfer. Enter from the user's symptom, pick the lens that fits the problem, follow the evidence, and verify the AI. That's the whole workshop, in any application.

## You've finished!

Across four labs you've used **Frontend Observability**, **Database Observability**, the **Knowledge Graph** (Entity Catalog, Entity Graph, RCA Workbench), **Drilldown** for logs and traces, and the **Grafana Assistant** - each on a problem it's well suited to. Thanks for taking part!
