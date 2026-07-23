---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';

# 2.2. Turn the diagnosis into a fix

*You know what's wrong: a correlated subquery doing full scans on an unindexed column. Now let the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) propose the fix - and verify it against what you found.*

Database Observability has a Grafana Assistant integration available from its tabs (query performance, samples, wait events, schema, and explain plan). Because it runs live queries against your real metrics and logs with your actual schema, indexes, and execution plan loaded as context, it can suggest concrete, dialect-specific changes.

:::note

An LLM's wording varies between runs. Judge the Assistant on whether its recommendation matches the evidence you gathered - the full scan, the correlated subquery, and the missing index.

:::

---

## Question 1: What fix does the Assistant recommend?

**Ask the Assistant to optimize the slow query. What does it suggest?**

From the query's detail view, open the Assistant and ask something like: *"This query is slow - explain why and suggest how to optimize it."*

<TryIt>Ask the Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should recommend two complementary changes, matching your diagnosis:

- **Rewrite the correlated subquery as a JOIN**, so the inner table is read once instead of once per outer row.
- **Add an index** on the join/filter column (a dialect-specific `CREATE INDEX ...`), so the database can seek instead of scan.

```
Root cause: a correlated subquery re-scans the orders table per outer row (nested
loop, full scan), saturating CPU.
Fix 1: rewrite as a JOIN so the table is scanned once.
Fix 2: CREATE INDEX on the join column to eliminate the full scan.
Expect a large drop in Rows Examined and query duration.
```

**How to find it:**

1. In **Query Details**, open the **Grafana Assistant** from a tab (e.g. Explain Plan).
2. Ask it to explain and optimize the query.
3. Read its recommended rewrite and/or index. *(A legacy "AI Helper" tab may also appear during the product's transition to the Assistant.)*

![Assistant query optimization](/img/lab2/2.6-assistant-fix.png)

</details>

---

## Question 2: Verify the recommendation

**Does the Assistant's fix actually match the evidence - and would you apply it?**

A confident recommendation still needs checking against the plan and schema you already read. This is the habit that keeps AI suggestions safe to act on.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Hold the recommendation against your findings:

- The **JOIN rewrite** addresses the **correlated subquery** you saw in the **Explain Plan** (Question 3). ✅
- The **index** addresses the **missing "Indexed" badge** you found in **Table Schema Details** (Question 4). ✅
- Both would cut the **Rows Examined** you flagged in Question 2, which is what drove the **CPU saturation** in Question 5. ✅

The evidence and the fix agree, so this is safe to take forward (in practice: test on a copy, confirm the new Explain Plan uses the index). The docs themselves advise validating any AI recommendation against the Explain Plan and Query Samples before applying - exactly what you just did.

**How to find it:**

1. Re-open the **Explain Plan** and **Table Schema Details** tabs.
2. Confirm each part of the Assistant's fix maps to something you observed.

</details>

---

## Wrap-up

You started at a slow product page and followed the trail through a trace into **Database Observability**, where you:

- ranked queries and found the slow `SELECT` (**Queries Overview**),
- diagnosed it as expensive-per-run from **Rows Examined ≫ Rows Sent**,
- confirmed a full scan in a correlated subquery (**Explain Plan**) on a **missing index** (**Table Schema Details**),
- tied it to **DB CPU saturation**, and had the **Assistant** propose a JOIN rewrite plus an index - which you verified against the evidence.

> **Why this matters:** query-level observability turns "the app is slow" into a named query, a named table, and a named fix. That's the difference between guessing and knowing.

In **Lab 3**, a problem with a much wider blast radius will call for a different lens - one that maps your whole system at once.
