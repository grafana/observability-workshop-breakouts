---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 4.1. Expose the shape with Traces Drilldown

*The transaction history page is slow but not broken. When nothing is erroring, the shape of the trace is where the answer lives.*

Open **Drilldown → Traces** and select the banking Tempo data source. You investigate here entirely by clicking - choosing a signal, a RED metric, and filters as **chips** - with no TraceQL.

![Traces Drilldown](/img/lab4/4.1-traces-drilldown.png)

---

## Question 1: Which requests are slow?

**Using the Duration metric, find the slow operation behind the transaction history page.**

Traces Drilldown opens on the RED metrics - **Rate**, **Errors**, and a **Duration** heatmap. Choosing **Duration** and filtering to the banking transaction service narrows you to the slow requests without writing a query.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Selecting **Duration** and filtering to the transaction service, the **Duration heatmap** shows the transaction-history request sitting at a high latency band. These requests are consistently slow - a steady, structural slowness rather than an occasional spike.

**How to find it:**

1. **Drilldown → Traces**; select the banking data source.
2. Click the **Duration** metric.
3. In the **Attributes** sidebar, find `service.name` (the transaction/history service) and click **Include**.
4. Read the **Duration heatmap** / set the percentile to p95.

![Duration heatmap for the slow service](/img/lab4/4.2-duration-heatmap.png)

> **The value:** you framed the problem - "these requests are slow" - by clicking RED metrics and attribute values, no query language required.

</details>

---

## Question 2: What is making the request slow?

**Open the Root cause latency tab. What span is on the critical path - and how many times does it appear?**

For the **Duration** metric, the **Root cause latency** tab builds an aggregated span tree of the longest-running requests across many traces, so you can see which span consistently sits on the critical path.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The slow time isn't one big span - it's a **database span that repeats hundreds of times** within a single request. The aggregated tree shows the same `db` query executed over and over under one parent operation. Each individual call is fast; there are just an enormous number of them.

That shape - one request, hundreds of identical small queries - is the classic **N+1 query** pattern.

**How to find it:**

1. With **Duration** selected, open the **Root cause latency** tab.
2. Look at the aggregated span tree for the transaction-history request.
3. Note the same DB span repeated many times under one parent.

![Root cause latency - repeated DB span](/img/lab4/4.3-root-cause-latency.png)

> **The value:** the aggregated span tree makes an anti-pattern *visible*. You're not reading one 300-span waterfall by eye - Drilldown shows you the repetition directly.

</details>

---

## Question 3: Confirm it in a single trace

**Open one slow trace and inspect the repeated span. What query is it running each time?**

Aggregates point the way; a single trace proves it. Open one and read the repeated span's attributes.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Opening a slow trace and expanding the repeated spans shows the **same `db.statement`** - an identical parameterised query (a per-transaction lookup, e.g. fetching each transaction's merchant/detail one row at a time) executed once per transaction in the list. Fetch 200 transactions, fire ~200 near-identical queries. That's the N+1.

**How to find it:**

1. From the **Root cause latency** tab or the **Slow traces** list, open a slow trace.
2. Expand the repeated child spans.
3. Click one and read its **span attributes** - `db.statement`, `db.system` - and confirm they're identical across the repeats.

![Repeated identical db.statement in a trace](/img/lab4/4.4-trace-span-detail.png)

> **The value:** the span attributes carry the actual SQL, so the trace alone tells you *what* is being repeated - the handoff point into Database Observability.

</details>
