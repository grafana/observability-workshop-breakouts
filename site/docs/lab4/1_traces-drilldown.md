---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 4.1. Read the shape of the trace

*The transaction history page is slow but not broken. When nothing is erroring, the shape of the trace is where the answer lives.*

Open **Drilldown** -> **Traces** and select the banking Tempo data source. Everything here works by clicking - choose a signal, a RED metric, and filters as chips.

![Traces Drilldown](/img/lab4/4.1-traces-drilldown.png)

---

## Question 1: Which requests are slow?

**Using the Duration metric, find the slow operation behind the transaction history page.**

Traces Drilldown opens on the RED metrics - **Rate**, **Errors**, and a **Duration** heatmap.

<TryIt where="the Duration heatmap, with a service.name filter from the Attributes sidebar." />

<details className="answer-reveal">
<summary>Show answer</summary>

Selecting **Duration** and filtering to the transaction service, the **Duration heatmap** shows the transaction-history request sitting in a high latency band. These requests are consistently slow - structural slowness, not an occasional spike.

**How to find it:**

1. Open **Drilldown** -> **Traces**; select the banking data source.
2. Click the **Duration** metric.
3. In the **Attributes** sidebar, find `service.name` (the transaction/history service) and click **Include**.
4. Read the **Duration heatmap**; set the percentile to p95.

![Duration heatmap for the slow service](/img/lab4/4.2-duration-heatmap.png)

</details>

---

## Question 2: What is making the request slow?

**Open the Root cause latency tab. What span is on the critical path - and how many times does it appear?**

With the **Duration** metric selected, the **Root cause latency** tab builds an aggregated span tree of the longest-running requests across many traces.

<TryIt where="the Root cause latency tab (it appears when the Duration metric is selected)." />

<details className="answer-reveal">
<summary>Show answer</summary>

The slow time isn't one big span - it's a **database span repeated hundreds of times** within a single request. The aggregated tree shows the same `db` query executed over and over under one parent operation. Each individual call is fast; there are just an enormous number of them.

One request firing hundreds of identical small queries is the classic **N+1 query** pattern.

**How to find it:**

1. With **Duration** selected, open the **Root cause latency** tab.
2. Look at the aggregated span tree for the transaction-history request.
3. Note the same DB span repeated many times under one parent.

![Root cause latency - repeated DB span](/img/lab4/4.3-root-cause-latency.png)

</details>

---

## Question 3: Confirm it in a single trace

**Open one slow trace and inspect the repeated span. What query is it running each time?**

Aggregates point the way; a single trace confirms it.

<TryIt where="any trace in the Slow traces list; expand the repeated child spans and read their attributes." />

<details className="answer-reveal">
<summary>Show answer</summary>

Opening a slow trace and expanding the repeated spans shows the same **`db.statement`** - an identical parameterized query (a per-transaction lookup, fetching each transaction's merchant detail one row at a time) executed once per transaction in the list. Fetch 200 transactions, fire ~200 near-identical queries.

**How to find it:**

1. From the **Root cause latency** tab or the **Slow traces** list, open a slow trace.
2. Expand the repeated child spans.
3. Click one and read its span attributes - `db.statement`, `db.system` - and confirm they're identical across the repeats.

![Repeated identical db.statement in a trace](/img/lab4/4.4-trace-span-detail.png)

</details>
