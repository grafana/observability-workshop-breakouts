---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';
import EnvLink from '@site/src/components/EnvLink';

# 2.1. From symptom to slow query

*The complaint is about the frontend, but the delay is coming from somewhere downstream. Follow it.*

## Getting there: frontend -> trace -> query

You'll start at the slow **user action**, follow it into a **trace** to see *which* service and database are involved, and then open **Database Observability** to inspect the query itself.

:::tip Jump straight to the ecommerce app

<EnvLink appIdKey="frontendAppId" path="/a/grafana-kowalski-app/apps/{appId}" from="09:00" to="10:00">Open Frontend Observability for the ecommerce app</EnvLink> - opens the app with this lab's window (previous day, UTC) already applied. Needs your environment ID and Frontend Observability app ID from the Welcome page. If you'd rather navigate by hand: left menu -> **Observability -> Frontend -> `ecommerce`**.

:::

:::note Time range keeps resetting?
Two gotchas caught us while building this lab: (1) switching Frontend Observability tabs can flip the time picker back to your **browser** timezone (so a `09:00-10:00 UTC` window shows as `04:00-05:00` local, for example) - the data is the same, but re-set it to **UTC** if you want the times to match the lab; (2) the **Database** app snaps to its own default range when it opens, so you'll re-apply the window there. If a screen looks empty, fix the time range first.
:::

**Step 1 - Find the slow user action.** Click the **User actions** tab. This lists the key interactions instrumented in the app (add-product-to-cart, initiate-checkout, open-product-detail, order-complete...) with their **Duration** and **Duration P95**. Two stand out as slow - **`open-product-detail`** and **`order-complete`**, both around ~8s average and ~10s P95. Click **`open-product-detail`**.

![The User actions tab: open-product-detail and order-complete both around 8s / 10s P95](/img/lab2/2.1-user-actions-list.png)

**Step 2 - Read the user action.** The action page shows **Total executions**, **Error rate** (0 - nothing is *failing*, it's just slow), and **Duration p95** (~10s), with a chart where the duration jumps at the start of the window. This is the customer-facing symptom: opening a product detail page went from ~500ms to ~10s.

![The open-product-detail user action: p95 ~10s, 0 errors, with the Traces sub-tab](/img/lab2/2.1-user-action.png)

**Step 3 - Open a trace.** In the **User Action Overview** panel lower down, click the **Traces** sub-tab. It lists the requests this action made, each ~10s. Click any row to open it as a waterfall.

![The Traces sub-tab listing ~10s requests](/img/lab2/2.1-trace-list.png)

**Step 4 - Read the trace.** The slow trace is the `GET /api/recommendations` request, ~10s end to end. The waterfall walks the request from the browser through `frontendproxy` and the `frontend` API route down to the span that consumes essentially the whole 10 seconds: **`oteldemo.RecommendationService/ListRecommendations`**. That tells you *where* the time goes - the recommendation service and its call to the orders database - but not yet *why*.

![The trace for GET /api/recommendations - ~10s, dominated by RecommendationService/ListRecommendations](/img/lab2/2.1-trace-to-db.png)

:::note Does it matter whether you picked open-product-detail or order-complete?
No. Both pages show "you might also like" recommendations, so both fire the same `GET /api/recommendations` call - and open a trace from *either* action and you land on the same `ListRecommendations` span eating ~10 seconds. Whichever you chose, you're looking at the same root cause. (That's also a preview of the blast radius: one slow query, showing up across multiple customer journeys.)

![The order-complete action's slow trace is the same /api/recommendations -> ListRecommendations span](/img/lab2/2.1-order-complete-trace.png)
:::

**Step 5 - Go to Database Observability.** Now open the query from the database's side. In the left menu choose **Observability -> Database**.

:::note TODO - screenshot needed
Capture the alternative jump: open a *completed* recommendation trace, expand to the recommendation service's **SELECT** span, and screenshot the span attributes showing the clickable **`db.statement`** / SQL text that links straight into Database Observability. Save as `site/static/img/lab2/2.1-span-to-db.png` and reference it here. (In this lab's *cancelled* 10s request that link isn't reliable, which is why the menu route below is the primary path.)
:::

:::tip Open Database Observability directly
<EnvLink path="/a/grafana-dbo11y-app/overview" from="09:00" to="10:00">Open Database Observability (Queries Overview)</EnvLink> - needs only your environment ID from the Welcome page. Note the Database app tends to reset to its own default range when it loads, so if the window looks off, re-apply **09:00-10:00** (previous day) and switch the timezone to **UTC** using the time picker.
:::

**Verify you're in the right place.** Database Observability opens on **Queries Overview**, showing datasources for your stack (`...-prom` and `...-logs`), engine filters for **MySQL** and **PostgreSQL**, and RED summary tiles across the top (Instances, Databases, Tables, Total Queries Executed, Current rate) over Duration / Errors / Rate charts. If you see that, continue to Question 1.

![Database Observability - Queries Overview landing](/img/lab2/2.2-queries-overview.png)

---

## Question 1: Find the slow query

**Open the Queries Overview and find the slowest query against the orders database.**

The **Queries Overview** dashboard ranks every normalized query with its RED metrics - **Rate**, **Errors**, and **Duration** - plus row counts and wait times.

<TryIt where="Database Observability → Queries Overview; try sorting the columns." />

<details className="answer-reveal">
<summary>Show answer</summary>

Sorting by **Duration** puts a single `SELECT` at the top - a recommendation query against the **orders** database (instance `orders-db`), with ~369s of total duration across 55 calls. Everything below it is in the low seconds or milliseconds, so this one query dwarfs the rest.

Queries are shown normalized (literal values replaced with placeholders), so every execution of the same statement collapses into one ranked row.

**How to find it:**

1. Go to **Database Observability** -> **Queries Overview**.
2. Click the **Duration** column header to sort descending (the table header reads *"Top 30 out of N queries sorted by Duration (descending)"*).
3. The slow `SELECT ... AS recommended_product_id ...` on `orders` / `orders-db` sits at the top.

![Queries Overview sorted by Duration - the recommendation SELECT on orders-db is far and away the slowest](/img/lab2/2.2-queries-by-duration.png)

Hover the query text (or open it) to read the full statement - it's a tangle of **correlated subqueries** against `order_items` and `cart_items`, which is exactly why it's so expensive (you'll confirm this in the Explain Plan in Question 3).

![The full recommendation query - nested correlated subqueries](/img/lab2/2.2-query-text.png)

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

<TryIt where="the CPU Time panel on Query Details (bottom row), then the instance's host CPU in Cloud Provider Observability." />

Jump to the host CPU: <EnvLink path="/a/grafana-csp-app/aws/dashboards/rds" from="09:00" to="10:00" params="var-datasource=grafanacloud-prom&var-job=$__all&var-account=$__all&var-region=$__all">open the AWS RDS dashboard in Cloud Provider Observability</EnvLink> (needs your environment ID from the Welcome page).

<details className="answer-reveal">
<summary>Show answer</summary>

This query's CPU time climbs across the window - and the **instance** it runs on is an **AWS RDS** database (`orders-db`, `us-east-1`), whose host CPU saturates at the same time. Because the orders database also handles order inserts and lookups, those get slower too - which is why the impact reached checkout and the frontend, not just recommendations.

**How to find it:**

1. On **Query Details** (**Query Performance** tab), scroll to the **CPU Time** panel in the bottom row (next to Rows and Lock Waits). It shows *this query's* CPU time rising during the incident window (into the minutes). The **Instance** panel at the top confirms it runs on `orders-db` / **AWS · us-east-1**.

   ![The query's CPU Time panel on Query Details](/img/lab2/2.5-query-cpu.png)

2. To see the **host / RDS CPU**, you leave Database Observability - the instance name here isn't a link to a CPU panel (its only link is *Filter Queries*). In the left menu open **Observability -> Cloud provider**, choose **AWS**, and under **Quick Links to Dashboards** click **RDS**.

   ![Cloud Provider Observability - AWS, RDS quick link](/img/lab2/2.5-cloud-provider-rds.png)

   :::tip Jump straight to the RDS dashboard
   <EnvLink path="/a/grafana-csp-app/aws/dashboards/rds" from="09:00" to="10:00" params="var-datasource=grafanacloud-prom&var-job=$__all&var-account=$__all&var-region=$__all">Open the AWS RDS dashboard in Cloud Provider Observability</EnvLink> - needs only your environment ID from the Welcome page. Skips the menu clicks and lands on the RDS fleet view with the lab window applied.
   :::

3. In the **DB fleet overview**, find `devfedb13-orders-db` (`us-east-1`). Its **CPU util max** is ~100%. Click the instance ID to open its dashboard.

   ![RDS fleet overview - orders-db at ~100% CPU max](/img/lab2/2.5-rds-fleet.png)

4. The instance dashboard's **CPU Utilization Average** and **Maximum** panels sit pegged at 100% from the moment the scenario starts (~09:12) - crossing the alert threshold - and drop back only when it ends. Line this up against the query's CPU time from step 1: the query's cost and the instance's saturation rise and fall together.

   ![RDS instance CPU pinned at 100% for the incident window](/img/lab2/2.5-rds-cpu.png)

</details>
