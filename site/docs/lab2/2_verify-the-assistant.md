---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 2.2. Get the fix, then verify it

*You know what's wrong: a correlated subquery doing full scans on an unindexed column. Ask the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) for the fix, and check it against the evidence.*

Database Observability integrates the Assistant on its tabs (query performance, samples, wait events, schema, explain plan). It runs live queries against your real metrics and logs, with your actual schema, indexes, and execution plan as context - so it can suggest concrete, dialect-specific changes.

:::note

LLM output varies between runs. Judge the recommendation on whether it matches the evidence you gathered - the full scan, the correlated subquery, and the missing index.

:::

---

## Question 1: What fix does the Assistant recommend?

**Ask the Assistant to optimize the slow query.**

From the query's detail view, open the Assistant and ask: *"This query is slow - explain why and suggest how to optimize it."*

<TryIt where="the Grafana Assistant button on any Query Details tab (the Explain Plan tab works well).">Ask the Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should recommend two complementary changes:

- **Rewrite the correlated subquery as a JOIN**, so the inner table is read once instead of once per outer row.
- **Add an index** on the join/filter column (a dialect-specific `CREATE INDEX ...`), so the database can seek instead of scan.

```
Root cause: a correlated subquery re-scans the orders table per outer row (nested
loop, full scan), saturating CPU.
Fix 1: rewrite as a JOIN so the table is scanned once.
Fix 2: CREATE INDEX on the join column to eliminate the full scan.
```

**How to find it:**

1. In **Query Details**, open the **Grafana Assistant** from a tab (e.g. Explain Plan).
2. Ask it to explain and optimize the query.
3. Read its recommended rewrite and/or index. (A legacy "AI Helper" tab may also appear while the product transitions to the Assistant.)

![Assistant query optimization](/img/lab2/2.6-assistant-fix.png)

</details>

---

## Question 2: Verify the recommendation

**Does the fix match the evidence?**

The docs themselves advise validating any AI recommendation against the Explain Plan and Query Samples before applying it.

<TryIt where="back in the Explain Plan and Table Schema Details tabs." />

<details className="answer-reveal">
<summary>Show answer</summary>

Check the recommendation against what you found:

- The **JOIN rewrite** addresses the correlated subquery from the **Explain Plan** (Question 3).
- The **index** addresses the missing "Indexed" badge from **Table Schema Details** (Question 4).
- Both reduce the **Rows Examined** from Question 2, which is what drove the CPU saturation in Question 5.

The evidence and the fix line up, so this is safe to take forward (in practice: test on a copy and confirm the new Explain Plan uses the index).

**How to find it:**

1. Re-open the **Explain Plan** and **Table Schema Details** tabs.
2. Confirm each part of the Assistant's fix maps to something you observed.

</details>

---

## Question 3: Let the Assistant analyze the saturated instance <Badge variant="optional">Optional</Badge>

**From the RDS instance you found in Question 5 of the previous section, ask the Assistant to analyze it - does it reach the same conclusion you did?**

Every entity in Grafana Cloud carries **Insights** from the Knowledge Graph. On the `orders-db` RDS instance, the **Insights** button lists what's firing - `AwsRDSHighCpuLoad`, `AwsRDSHighCpuSpikes`, a latency breach - and an **Analyze** button hands the entity and its insights to the Assistant.

<TryIt where="the Insights button on the orders-db RDS instance (Cloud Provider Observability), then Analyze.">Read the Assistant's analysis before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The instance's own insights already name the problem - high CPU load and spikes - and the Assistant's analysis correlates them back to the cause: it points at the **recommendation service** as a caller of the orders DB and recommends checking the **slow-query log / Performance Insights** for the incident window to find "the actual query driving CPU." That's the same query you found by hand - the Assistant arrived at it from the infrastructure side.

**How to find it:**

1. On the `orders-db` instance dashboard, click the **Insights** button and review the firing insights (`AwsRDSHighCpuLoad`, etc.).

   ![RDS instance Insights, with the Analyze button](/img/lab2/2.6-assistant-analyze.png)

2. Click **Analyze**. The Assistant investigates the instance's health and reports back.
3. Check its conclusion against yours: it should tie the CPU saturation to the recommendation service and the slow query - not send you off in a different direction.

   ![The Assistant's analysis of the RDS instance, pointing back to the recommendation service and slow query](/img/lab2/2.6-assistant-analysis.png)

</details>

---

## Wrap-up

You started at a slow product page, followed a trace to a `db.Query` span, and used Database Observability to identify the query, diagnose it (correlated subquery, full scan, missing index), confirm the CPU impact, and get a concrete fix from the Assistant - verified against the plan and schema.

In Lab 3, the problem has a much wider blast radius, and you'll use the Knowledge Graph to map it.
