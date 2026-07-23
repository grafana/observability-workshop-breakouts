---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 4.2. Confirm the N+1 in Database Observability

*The trace showed the pattern. [Database Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/database-observability/) shows it from the database's side - and it looks completely different from the slow query in Lab 2.*

Open **Database Observability** for the banking database and find the query you saw repeating in the trace.

---

## Question 1: How does an N+1 look in the Queries Overview?

**Find the repeated query. What stands out about its Calls versus its Duration?**

In Lab 2 the culprit rose to the top by **Duration**. An N+1 query is the opposite profile - so you find it a different way.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Sort the **Queries Overview** by **Calls** (or **Rate**) and the per-transaction lookup shoots to the top with an **enormous call count** - but a **low average Duration**. Individually each execution is cheap and fast; there are simply thousands of them. No single execution would ever trip a "slow query" threshold.

**How to find it:**

1. **Database Observability → Queries Overview**; scope to the banking database.
2. Sort by **Calls** / **Rate** (not Duration).
3. Find the normalized query with a very high call count and low avg duration.

![Queries Overview sorted by Calls](/img/lab4/4.5-queries-by-calls.png)

> **The value:** because queries are **normalized**, the hundreds of per-row executions collapse into one row - and the **Calls ≫ everything** shape names the N+1 immediately. It's the mirror image of Lab 2's high-Duration query.

</details>

---

## Question 2: See the executions in the samples

**Open Query Samples. What does the timing of the executions look like?**

**Query Samples** shows real individual executions with their timestamps - the ground-level view of the N+1 firing.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The samples show **many identical fast executions clustered tightly together in time** - a burst of the same query, one after another, corresponding to a single page load. That burst *is* the N+1: the application issuing one query per transaction instead of fetching them together.

**How to find it:**

1. Click the query to open **Query Details**.
2. Open the **Query Samples** tab.
3. Note the dense cluster of near-identical, fast executions.

![Query Samples - burst of identical executions](/img/lab4/4.6-query-samples.png)

> **The value:** samples confirm from the database side exactly what the trace showed from the application side - the same query, fired in a burst. Two lenses, one conclusion.

</details>

---

## Question 3: Why the database metrics looked "fine" <Badge variant="optional">Optional</Badge>

**Why wouldn't a standard slow-query or DB-CPU alert have caught this?**

This is the lesson of the lab: some problems are invisible to the obvious metric.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Each query is fast and cheap, so **per-query duration looks healthy** and the database isn't necessarily CPU-saturated. Nothing crosses a "slow query" line. The cost is in the **round-trip overhead multiplied by hundreds of calls per request** - latency that accrues in the *application*, between the queries, not inside any one of them.

That's why the **trace** found it first (it shows the repetition and the accumulated wall-clock time) and Database Observability **confirmed** it (via call count, not duration). The fix is architectural - fetch the rows in one batched query / JOIN instead of one-at-a-time.

**How to find it:**

1. Compare this query's **avg Duration** (low) with its **Calls** (very high).
2. Recall the trace: the time was the *sum* of many small spans, plus overhead between them.

> **The value:** knowing which lens catches which problem is the skill. N+1 hides from duration-based views and reveals itself in traces and call counts.

</details>
