---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';
import EnvLink from '@site/src/components/EnvLink';

# 4.1. Follow the N+1 by its shape

*The transaction history page works and isn't erroring. Duration alone won't flag it - the answer is in the shape of the trace.*

You'll lead with **Traces Drilldown** (find the pattern in the trace), confirm it from the database's side in **Database Observability**, then let the **Grafana Assistant** narrate it and check its story against yours.

Open **Drilldown** -> **Traces** and select the banking Tempo data source. Everything here works by clicking - choose a signal, a RED metric, and filters as chips.

:::tip Jump straight there

<EnvLink path="/a/grafana-exploretraces-app/explore" timeParam="none" params="from=now-1h&to=now&var-ds=grafanacloud-traces&var-primarySignal=nestedSetParent%3C0&var-filters=&var-metric=rate&var-groupBy=resource.service.name&var-spanListColumns=&var-latencyThreshold=&var-partialLatencyThreshold=&var-durationPercentiles=0.9&actionView=breakdown">Open Traces Drilldown</EnvLink> - opens Traces Drilldown on the Rate metric, broken down by service, over the last hour. Unlike the other labs there's no incident window to pin: the N+1 runs continuously, so a recent range always shows it. Needs your environment ID from the Welcome page.

:::

![Traces Drilldown](/img/lab4/4.1-traces-drilldown.png)

---

## Question 1: Is the transaction history request even slow?

**Using the RED metrics, check the rate, errors, and duration for the banking services. What do they tell you?**

Traces Drilldown opens on the RED metrics - **Rate**, **Errors**, and a **Duration** heatmap. Add a `service.namespace` filter for `banking-prod` and select **Duration**.

<TryIt where="the Duration metric, then the Breakdown tab grouped by service.name." />

<details className="answer-reveal">
<summary>Show answer</summary>

Errors are effectively zero (a stray tick well under 1%) and the banking services sit in modest duration bands - nothing is on fire. Broken down by `service.name`, the services on the transaction path are measured in milliseconds, not seconds. A duration-based alert would never trip here.

That's the point of this lab: the problem isn't latency, so RED alone won't hand it to you. You have to look at what a single request is actually *doing*.

**How to find it:**

1. Open **Drilldown** -> **Traces**; select the banking data source.
2. Add a filter: `resource.service.namespace` = `banking-prod`.

   ![Adding the service.namespace filter for banking-prod](/img/lab4/4.1-namespace-filter.png)

3. Click **Histogram by duration**, then open the **Breakdown** tab grouped by `service.name`.
4. Note the durations are modest and errors are effectively zero.

![Duration breakdown across banking services](/img/lab4/4.2-duration-heatmap.png)

</details>

---

## Question 2: What is the request actually doing?

**Open the Root cause latency tab. Where is the transaction-history request spending its time?**

With the **Duration** metric selected, the **Root cause latency** tab builds an aggregated span tree from the matching traces, showing where the wall-clock time goes.

<TryIt where="the Root cause latency tab (it appears when the Duration metric is selected)." />

<details className="answer-reveal">
<summary>Show answer</summary>

In the aggregated structure for `frontend`, the `GET /api/transactions` request spends nearly all of its time inside the **transaction** service - `banking.v1.TransactionService/ListTransactions` carries ~110 of the ~115ms, with database spans (`stmt.Query`, `db.Prepare`) on its critical path rather than one slow operation. The structure points at the database layer of the transaction service, even though no single span is alarming.

One thing this view *can't* show you: it aggregates spans across traces, rolling repeated identical spans together - so the sheer **count** of queries per request is invisible here. The repetition is easiest to see in one trace - that's the next question.

**How to find it:**

1. With **Histogram by duration** selected, open the **Root cause latency** tab.
2. In the structure for `frontend`, find the `GET /api/transactions` request and expand it.
3. Note the time concentrated under the transaction service's `ListTransactions` span and its `db` children.

![Root cause latency - the time sits in the transaction service's DB layer](/img/lab4/4.3-root-cause-latency.png)

</details>

---

## Question 3: Confirm it in a single trace

**Open one transaction-history trace and expand the DB spans. What query runs, and how many times?**

Aggregates point the way; a single trace confirms it.

<TryIt where="any GET /api/transactions trace in the Slow traces list; expand the transaction service's db.Query spans and read their attributes." />

<details className="answer-reveal">
<summary>Show answer</summary>

Opening a `GET /api/transactions` trace shows the transaction service firing the same span over and over - **25-plus `db.Query` repeats**, every one measured in **microseconds**. Expand one and the `db.statement` is an identical parameterized lookup:

```sql
SELECT m.name, c.name
FROM merchants m
JOIN categories c ON c.id = m.category_id
WHERE m.lookup_ref = ?
```

One request enriching each transaction row with its merchant and category names, one row at a time. That's the classic **N+1 query** pattern - every individual query is fast, there are just far too many of them.

**How to find it:**

1. From the **Root cause latency** tab or the **Slow traces** list, open a `GET /api/transactions` trace.
2. Expand the transaction service's repeated `db.Query` child spans under `ListTransactions`.
3. Click one and read its attributes - `db.statement`, `db.system` (`mysql`) - and confirm they're identical across the repeats.

![Repeated identical db.statement in a trace](/img/lab4/4.4-trace-span-detail.png)

</details>

---

## Database Observability

*The trace showed the pattern. [Database Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/database-observability/) shows it from the database's side - and it looks completely different from the slow query in Lab 2.*

Open **Database Observability** -> **Queries Overview** and find the query you saw repeating in the trace. It's a MySQL query (`db.system` said so in the span), so select the **MySQL** engine.

---

## Question 4: How does an N+1 look in the Queries Overview?

**Find the repeated query. What stands out about its Calls versus its Duration?**

In Lab 2 the culprit rose to the top when you sorted by **Duration**. An N+1 query has the opposite profile.

<TryIt where="the Queries Overview with the MySQL engine selected - search for the table the trace pointed at (merchants) and open the per-row lookup." />

<details className="answer-reveal">
<summary>Show answer</summary>

Search for `merchants` and open the `SELECT m.name, c.name FROM merchants m JOIN categories c ... WHERE m.lookup_ref = ?` query. Its **Calls** count is enormous while its average **Duration** is measured in **microseconds**. Each execution is cheap and fast; there are simply a huge number of them, and **Errors** stay at zero. No single execution would ever trip a slow-query threshold.

Because queries are normalized, every per-row execution collapses into this one row - and the Calls column names the N+1 immediately.

**How to find it:**

1. Open **Database Observability** -> **Queries Overview**; select the **MySQL** engine.
2. Search for `merchants` (the table the trace pointed at).
3. Open the `SELECT m.name, c.name FROM merchants ...` query.
4. In **Query Performance**, read **Successful Calls** (very high) against the **Duration** panel (microseconds).

![Query Details - high calls, microsecond duration](/img/lab4/4.5-queries-by-calls.png)

</details>

---

## Question 5: Look at the samples

**Open Query Samples. What does the timing of the executions look like?**

**Query Samples** plots real individual executions with their durations.

<TryIt where="the Query Samples tab of the query details page." />

<details className="answer-reveal">
<summary>Show answer</summary>

The samples form a tight band of near-identical fast executions - almost every one lands around the same microsecond-scale mark, densely and continuously, because the same query runs over and over as each page loads. That uniform, high-volume stream is the N+1: the application issuing one lookup per transaction row instead of fetching them together.

**How to find it:**

1. On the query details page, open the **Query Samples** tab.
2. Note the dense band of samples all clustered at the same low duration.

![Query Samples - band of identical fast executions](/img/lab4/4.6-query-samples.png)

</details>

---

## Question 6: Why did the database metrics look "fine"? <Badge variant="optional">Optional</Badge>

**Why wouldn't a standard slow-query or DB-CPU alert have caught this?**

<TryIt where="no new screens - compare the Calls and Duration columns you've already seen, and think back to the trace." />

<details className="answer-reveal">
<summary>Show answer</summary>

Each query is fast and cheap, so per-query duration looks healthy and the database isn't CPU-saturated. Nothing crosses a slow-query line. The cost is the round-trip overhead multiplied by 25-plus calls per request - work that accrues in the application, *between* the queries, not inside any one of them. Today it hides in a fast page; as transaction volume grows, that per-row fan-out is where the page falls over.

That's why the trace found it first (it shows the repetition) and Database Observability confirmed it via call count rather than duration. The fix is architectural: fetch the rows in one batched query / JOIN instead of one at a time.

**How to find it:**

1. Compare this query's avg **Duration** (microseconds) with its **Calls** (very high).
2. Recall the trace: the time was the sum of many small spans, plus the overhead between them.

</details>

---

## Verify the Assistant

*One last time: ask the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) to investigate, and check that it recognizes the pattern you found.*

:::note

LLM output varies between runs. Judge the Assistant on whether it identifies the N+1 pattern and backs it with the same evidence - the high call count and the repeated span.

:::

---

## Question 7: What does the Assistant find?

**Ask the Assistant to investigate the transaction-history request's data-access pattern.**

Use a prompt like: *"On the banking app, look at the GET /api/transactions request across traces and the database. Is its database access pattern efficient? Nothing is erroring."*

<TryIt where="the Grafana Assistant button in the top-right corner of Grafana.">Ask Grafana Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should identify the N+1 pattern - a single request issuing many repeated, identical database queries, each fast but wasteful in aggregate - and recommend batching them into one query / JOIN.

```
The transaction-history request executes the same merchant/category lookup
(SELECT m.name, c.name FROM merchants m JOIN categories c ... WHERE
m.lookup_ref = ?) 25+ times per request - a high call count with a microsecond
per-call duration. That's an N+1 access pattern: many round-trips instead of
one query. It isn't slow yet, but it won't scale.
Fix: fetch the lookups in a single batched query or JOIN.
```

**How to find it:**

1. Open the **Grafana Assistant**.
2. Ask it to investigate the transaction-history request across traces and the database.
3. Read its conclusion and recommended fix.

![Assistant identifies the N+1](/img/lab4/4.7-assistant-summary.png)

</details>

---

## Question 8: Verify its evidence

**Did the Assistant reach the N+1 conclusion from real evidence - the repeated span and the call count?**

<TryIt where="the Assistant's expanded tool calls - check them against the trace and the Calls column you saw earlier." />

<details className="answer-reveal">
<summary>Show answer</summary>

Check its reasoning against yours:

- Did it observe the **repeated database span** within one trace (the 25+ identical merchant/category lookups)?
- Did it note the **high Calls / low Duration** shape in the query metrics?
- Does its fix (batch / JOIN) actually address an N+1? An index suggestion, for example, wouldn't - the problem is the round-trip count, not the per-query cost.

If the evidence maps to what you found, the conclusion is sound.

**How to find it:**

1. Expand the Assistant's tool calls.
2. Confirm it cited the repeated span and the call count.
3. Sanity-check that the fix fits an N+1 specifically.

</details>

---

## Wrap-up

Across four labs you've used **Frontend Observability**, **Database Observability**, **Kubernetes Monitoring**, the **Knowledge Graph** (Entity Catalog, Entity Graph, RCA Workbench), **Drilldown** for logs and traces, and the **Grafana Assistant** - each on a problem it's suited to. The pattern is the same everywhere: start from the user's symptom, pick the right lens, follow the evidence, and verify the AI.

Thanks for taking part!
