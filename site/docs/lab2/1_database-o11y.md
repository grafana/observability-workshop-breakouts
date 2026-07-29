---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 2.1. From symptom to slow query

*The complaint is about the frontend, but the delay is coming from somewhere downstream. Follow it.*

## Getting there: frontend -> trace -> query

Start in **Frontend Observability** (`ecommerce` app). The slow experience shows up as a slow user action / high page duration on `/product/*`. Open a slow request and follow it into its **trace** (the **Services** action, or open it in **Traces Drilldown**). In the trace waterfall, one span dominates: the recommendation service's call to the database - a `db.Query` span taking several seconds.

Click into the query that span represents to land in **Database Observability**. (You can also open Database Observability directly from the menu and pick the **orders** database.)

![From a slow trace span into Database Observability](/img/lab2/2.1-trace-to-db.png)

---

## Question 1: Find the slow query

**Open the Queries Overview and find the slowest query against the orders database.**

The **Queries Overview** dashboard ranks every normalized query with its RED metrics - **Rate**, **Errors**, and **Duration** - plus row counts and wait times.

<TryIt where="Database Observability → Queries Overview; try sorting the columns." />

<details className="answer-reveal">
<summary>Show answer</summary>

Sorting by **Duration** puts a single `SELECT` at the top - a recommendation query that reads from the orders tables. Its total and average duration dwarf everything else running against the database.

Queries are shown normalized (literal values replaced with placeholders), so every execution of the same statement collapses into one ranked row.

**How to find it:**

1. Go to **Database Observability** -> **Queries Overview**.
2. Scope the filters to the **orders** database / instance.
3. Click the **Duration** column header to sort descending.
4. The slow `SELECT` sits at the top of the table.

![Queries Overview sorted by duration](/img/lab2/2.2-queries-overview.png)

</details>

---

## Question 2: Why is it slow?

**Look at the Calls, Duration, and Rows Examined columns for that query. What do they tell you?**

A query can be a problem because it runs thousands of times (each one cheap), or because each individual run is expensive. The columns tell you which - and that changes the fix.

<TryIt where="the query's row in the Queries Overview - the Calls, Duration (avg), Rows Examined, and Rows Sent columns." />

<details className="answer-reveal">
<summary>Show answer</summary>

This query has a modest call count but a high average duration - and a huge **Rows Examined** count compared to **Rows Sent**. It reads enormous numbers of rows to return only a few. That's an expensive-per-run query, not a high-frequency one.

**How to find it:**

1. In the Queries Overview row for the slow query, read **Calls**, **Duration (avg)**, **Rows Examined**, and **Rows Sent**.
2. Note that Rows Examined is far larger than Rows Sent.

</details>

---

## Question 3: What is the query actually doing?

**Open the query's Explain Plan. What operation is making it expensive?**

The **Explain Plan** tab renders the database's execution plan as a graph - each node is an operation (scan, join, sort), color-coded by cost.

<TryIt where="click the query to open Query Details, then the Explain Plan tab." />

<details className="answer-reveal">
<summary>Show answer</summary>

The plan shows a **nested loop with a full table scan** on the orders tables - a high-cost (red) node. The query is written as a **correlated subquery**: for every outer row, it re-runs an inner lookup, re-scanning the same table again and again. That repeated scanning is where the time and the database CPU go.

**How to find it:**

1. From the Queries Overview, click the query to open **Query Details**.
2. Open the **Explain Plan** tab.
3. Find the red, high-cost node - a full scan inside a nested loop. (Explain Plans are available for `SELECT` statements.)

![Explain Plan showing a full scan](/img/lab2/2.3-explain-plan.png)

</details>

---

## Question 4: Is there a missing index?

**Open Table Schema Details. Is the column the query filters/joins on indexed?**

The **Table Schema Details** tab shows each table's columns, indexes, and foreign keys, with an **"Indexed" badge** on columns that have an index.

<TryIt where="Query Details → Table Schema Details → Column Details." />

<details className="answer-reveal">
<summary>Show answer</summary>

The column the query joins on (a product/order identifier on one of the orders tables) has **no "Indexed" badge**. With no index to seek on, the database has to scan the whole table for every iteration of the correlated subquery - exactly what the Explain Plan showed.

**How to find it:**

1. In **Query Details**, open the **Table Schema Details** tab.
2. If multiple tables are involved, pick the scanned table from the dropdown.
3. In **Column Details**, find the filter/join column and note the missing **Indexed** badge.

![Table Schema Details - missing index](/img/lab2/2.4-table-schema.png)

</details>

---

## Question 5: Confirm the wider impact <Badge variant="optional">Optional</Badge>

**Correlate the query with the database instance's CPU. Did this query cause the DB-wide slowdown?**

A single expensive query doesn't just slow itself down - by saturating CPU it slows every query on the instance.

> **Why this matters:** this is the difference between "the DB is slow" and "*this query* is why the DB is slow."

<TryIt where="the query's CPU time trend in Query Details, alongside the RDS (Cloud Provider) CPU panel for the instance." />

<details className="answer-reveal">
<summary>Show answer</summary>

The instance's CPU climbs to near saturation exactly when this query's duration and CPU time rise. Because the orders database also handles order inserts and lookups, those get slower too - which is why the impact reached checkout and the frontend, not just recommendations.

**How to find it:**

1. In **Query Details**, view the query's **CPU time / duration** trend.
2. Open the correlated host / **RDS (Cloud Provider)** CPU panel for the instance.
3. Confirm the timelines line up.

![Query cost tracking DB CPU](/img/lab2/2.5-db-cpu.png)

</details>
