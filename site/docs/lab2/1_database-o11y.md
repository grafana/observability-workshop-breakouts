---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 2.1. From symptom to slow query

*The complaint is about the frontend, but the delay is coming from somewhere downstream. Let's follow it.*

## Getting there: frontend → trace → query

Start in **Frontend Observability** (`ecommerce` app). The slow experience shows up as a slow **user action** / high page duration on `/product/*`. Open a slow request and follow it into its **trace** (the **Services** action, or open it in **Traces Drilldown**). In the trace waterfall, one span dominates the time: the recommendation service's call to the database - a `db.Query` span taking several seconds.

That span is your bridge. Click into the database query it represents to land in **Database Observability**. (You can also open **Database Observability** directly from the menu and pick the **orders** database.)

![From a slow trace span into Database Observability](/img/lab2/2.1-trace-to-db.png)

---

## Question 1: Which query is doing the damage?

**Open the Queries Overview and find the slowest query against the orders database.**

The **Queries Overview** dashboard ranks every normalized query with its RED metrics - **Rate**, **Errors**, and **Duration** - plus row counts and wait times. Sorting is how you find the culprit fast.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Sorting by **Duration** puts a single `SELECT` at the top - a recommendation query that reads from the orders tables. Its total and average duration dwarf everything else running against the database.

**How to find it:**

1. Go to **Database Observability** → **Queries Overview**.
2. Scope the filters to the **orders** database / instance.
3. Click the **Duration** column header to sort descending.
4. The slow `SELECT` sits at the top of the table.

![Queries Overview sorted by duration](/img/lab2/2.2-queries-overview.png)

> **The value:** queries are shown **normalized** (literal values replaced with placeholders), so every execution of the same statement collapses into one ranked row. You go straight from "the database feels slow" to "*this* statement is the problem."

</details>

---

## Question 2: Is it slow because it runs a lot, or because each run is expensive?

**Look at the Calls, Duration, and Rows Examined columns for that query. What do they tell you?**

Not all slow queries are slow for the same reason. A query can be a problem because it runs thousands of times (each one cheap), or because each individual run is expensive. The columns tell you which - and that changes the fix entirely.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

This query has a **modest call count** but a **high average duration**, and - the giveaway - a huge **Rows Examined** count compared to **Rows Sent**. It's reading enormous numbers of rows to return only a few. That's the signature of an **expensive-per-run** query, not a high-frequency one.

**How to find it:**

1. In the Queries Overview row for the slow query, read **Calls**, **Duration (avg)**, **Rows Examined**, and **Rows Sent**.
2. Note that Rows Examined ≫ Rows Sent.

> **The value:** the same table that ranks queries also tells you their *shape*. "Reads a million rows to return five" points you at the query logic itself - and rules out simply throttling how often it runs.

</details>

---

## Question 3: What is the query actually doing?

**Open the query's Explain Plan. What operation is making it expensive?**

The **Explain Plan** tab renders the database's execution plan as a graph - each node is an operation (scan, join, sort), color-coded by cost. It shows you *how* the database is fulfilling the query.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The plan shows a **nested loop with a full table scan** on the orders tables - a high-cost (red) node. The query is structured as a **correlated subquery**: for every outer row, it re-runs an inner lookup, re-scanning the same table again and again. That repeated scanning is where the seconds - and the database CPU - go.

**How to find it:**

1. From the Queries Overview, click the query to open **Query Details**.
2. Open the **Explain Plan** tab.
3. Find the red, high-cost node - a full scan inside a nested loop.

![Explain Plan showing a full scan](/img/lab2/2.3-explain-plan.png)

> **The value:** the Explain Plan turns "slow query" into "slow *because of a full scan in a correlated subquery*" - a specific, fixable diagnosis, visible without leaving Grafana. (Note: Explain Plans are available for `SELECT` statements.)

</details>

---

## Question 4: Is there a missing index?

**Open Table Schema Details. Is the column the query filters/joins on indexed?**

The **Table Schema Details** tab shows each table's columns, indexes, and foreign keys - with an **"Indexed" badge** on columns that have an index. A full scan plus an unindexed join column is a classic missing-index story.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The column the query joins/filters on (a product/order identifier on one of the orders tables) has **no "Indexed" badge**. With no index to seek on, the database has no choice but to scan the whole table for every iteration of the correlated subquery - exactly what the Explain Plan showed.

**How to find it:**

1. In **Query Details**, open the **Table Schema Details** tab.
2. If multiple tables are involved, pick the scanned table from the dropdown.
3. In **Column Details**, look for the filter/join column and note the missing **Indexed** badge.

![Table Schema Details - missing index](/img/lab2/2.4-table-schema.png)

> **The value:** schema and indexes sit right next to the query and its plan, so you can confirm the *cause* (no index) in the same investigation - not by SSHing into a database.

</details>

---

## Question 5: Prove it's hurting the whole database <Badge variant="optional">Optional</Badge>

**Correlate the query with the database instance's CPU. Did this query cause the DB-wide slowdown?**

A single expensive query doesn't just slow itself - by saturating CPU it slows *every* query on that instance. Database Observability lets you line up query cost against host / cloud-provider resource metrics.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The instance's **CPU climbs to near saturation** exactly when this query's duration and CPU-time rise. Because the orders database also handles order inserts and lookups, those get slower too - which is why the impact reached checkout and the frontend, not just recommendations.

**How to find it:**

1. In **Query Details**, view the query's **CPU time / duration** trend.
2. Open the correlated host / **RDS (Cloud Provider)** CPU panel for the instance.
3. Confirm the timelines line up.

![Query cost tracking DB CPU](/img/lab2/2.5-db-cpu.png)

> **The value:** it connects one query to a database-wide symptom - the difference between "the DB is slow" and "*this query* is why the DB is slow."

</details>
