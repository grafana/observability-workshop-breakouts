---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 4.2. The database's side of the story

*The trace showed the pattern. [Database Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/database-observability/) shows it from the database's side - and it looks completely different from the slow query in Lab 2.*

Open **Database Observability** for the banking database and find the query you saw repeating in the trace.

---

## Question 1: How does an N+1 look in the Queries Overview?

**Find the repeated query. What stands out about its Calls versus its Duration?**

In Lab 2 the culprit rose to the top when you sorted by **Duration**. An N+1 query has the opposite profile.

<TryIt where="the Queries Overview for the banking database - try a different sort column this time." />

<details className="answer-reveal">
<summary>Show answer</summary>

Sort the **Queries Overview** by **Calls** (or **Rate**) and the per-transaction lookup goes to the top with an enormous call count - but a low average duration. Each execution is cheap and fast; there are simply thousands of them. No single execution would ever trip a slow-query threshold.

Because queries are normalized, the hundreds of per-row executions collapse into one row - and the Calls column names the N+1 immediately.

**How to find it:**

1. Open **Database Observability** -> **Queries Overview**; scope to the banking database.
2. Sort by **Calls** / **Rate** (not Duration).
3. Find the normalized query with a very high call count and low average duration.

![Queries Overview sorted by Calls](/img/lab4/4.5-queries-by-calls.png)

</details>

---

## Question 2: Look at the samples

**Open Query Samples. What does the timing of the executions look like?**

**Query Samples** shows real individual executions with their timestamps.

<TryIt where="Query Details → Query Samples tab." />

<details className="answer-reveal">
<summary>Show answer</summary>

The samples show many identical fast executions clustered tightly together in time - a burst of the same query, one after another, corresponding to a single page load. That burst is the N+1: the application issuing one query per transaction instead of fetching them together.

**How to find it:**

1. Click the query to open **Query Details**.
2. Open the **Query Samples** tab.
3. Note the dense cluster of near-identical, fast executions.

![Query Samples - burst of identical executions](/img/lab4/4.6-query-samples.png)

</details>

---

## Question 3: Why did the database metrics look "fine"? <Badge variant="optional">Optional</Badge>

**Why wouldn't a standard slow-query or DB-CPU alert have caught this?**

<TryIt where="no new screens - compare the Calls and Duration columns you've already seen, and think back to the trace." />

<details className="answer-reveal">
<summary>Show answer</summary>

Each query is fast and cheap, so per-query duration looks healthy and the database isn't necessarily CPU-saturated. Nothing crosses a slow-query line. The cost is the round-trip overhead multiplied by hundreds of calls per request - latency that accrues in the application, *between* the queries, not inside any one of them.

That's why the trace found it first (it shows the repetition and the accumulated wall-clock time) and Database Observability confirmed it via call count rather than duration. The fix is architectural: fetch the rows in one batched query / JOIN instead of one at a time.

**How to find it:**

1. Compare this query's avg **Duration** (low) with its **Calls** (very high).
2. Recall the trace: the time was the sum of many small spans, plus the overhead between them.

</details>
