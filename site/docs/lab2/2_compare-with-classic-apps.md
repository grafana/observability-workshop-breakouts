---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';

# 2.2. Compare with the classic apps

*Now flip the script. You just answered a series of questions with Knowledge Graph in a few clicks. Try the same questions with only the Lab 1 toolkit - App O11y, K8s Monitoring - and time yourself.*

This isn't meant to make the classic apps look bad. They can answer all of these and they do it well. The point is *how* they answer: how many panels you need to load, how many tabs to switch, how much context you have to hold in your head. That's the difference Knowledge Graph is built to address.

:::info

The walkthroughs below take the Knowledge Graph path so you have a reference. Try the classic-app path on your own first, then reveal.

:::

---

## Question 1: Memory assigned

**How much memory is assigned to the `productcatalogservice` workload?**

You already answered this in Lab 1.3 by clicking through to the workload view in K8s Monitoring. In Knowledge Graph the same Workload Memory panel lives one click into the KPI drawer for the service - no app switch.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**100 MiB**

**How to find it (Knowledge Graph path):**

1. Use the search bar to show the `productcatalogservice` service, or open Entity Graph → **Show all services** and filter for `productcatalogservice`.
2. Open the **KPI drawer**.
3. Click the **Kubernetes** tab.
4. See **memory limits** within the **Workload Memory** panel.

![Workload memory](/img/lab2/2.1-knowledge-graph.png)

</details>

---

## Question 2: Error rate

**What error rate percentage has the `productcatalogservice` reached over the last 24 hours?**

In Lab 1.2 you navigated to the Application Observability service detail page and hovered the Errors panel. The KPI drawer's **Service Overview** tab mirrors that view exactly, just reachable from the same Knowledge Graph entity surface you're already on.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Between **15% and 40%**.

**How to find it (Knowledge Graph path):**

1. Use the search bar to show the `productcatalogservice`, or open Entity Graph → **Show all services** and filter.
2. Open the **KPI drawer**.
3. Click the **Service Overview** tab.
4. Look at the **Errors** panel and see how high the spike gets.

</details>

---

## Question 3: Error message

**What error message is the `productcatalogservice` throwing when it errors in the last 24 hours?**

Compare the journey. In Lab 1.2 you went: services list → service detail → Errors panel → Traces button → pick a trace → expand the span → expand events. That's six clicks before you saw the error string. RCA Workbench compresses that: hover the insight bar, jump straight to logs or traces filtered to the exact insight window.

> **Why this matters:** RCA Workbench is context-aware. When you click "Logs" from an insight, the logs are already filtered to the time range and service that insight relates to. You're not picking up filters; the workbench is.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

- **Traces approach:** `pq: sorry, too many clients already`
- **Logs approach:**
  - `panic: runtime error: invalid memory address or nil pointer dereference`
  - `pq: sorry, too many clients already`

The interesting path here is using the **context-driven RCA Workbench**.

1. Open RCA Workbench with `productcatalogservice` and add connected services (see [the first event question in 2.1](./1_knowledge-graph.md#question-5-first-event)).
2. Click the **Summary** tab - it's easier to read, though Timeline works too. (See [the Summary vs Timeline note in 2.1](./1_knowledge-graph.md#question-6-first-to-error) for when to prefer Timeline.)
3. Hover the red bar of the `oteldemo.ProductCatalogService/ListProducts - ErrorRatioBreach` insight.

   ![ErrorRatioBreach hover](/img/lab2/2.3-knowledge-graph-1.png)

4. Click **Logs** - this opens the Logs tab of the KPI drawer at the timeframe of that insight, showing all error messages. You'll see `pq: sorry, too many clients already` and `panic: runtime error: invalid memory address or nil pointer dereference`.

   ![Logs view](/img/lab2/2.3-knowledge-graph-2.png)

5. Close the KPI drawer.
6. Hover the red bar again and click **Traces** - this opens the Traces tab of the KPI drawer at the same timeframe. Select the error radio button to show only errored traces.

   ![Errored traces](/img/lab2/2.3-knowledge-graph-3.png)

7. Click any trace, then click the `productcatalogservice` span with the red circle.

   ![Span detail](/img/lab2/2.3-knowledge-graph-4.png)

8. Expand events for that span - it shows `pq: sorry, too many clients already`.

   ![Span event](/img/lab2/2.3-knowledge-graph-5.png)

</details>

---

## Question 4: Erroring endpoint

**Which endpoint or endpoints are erroring within the `productcatalogservice` over the last 24 hours?**

Same **Operations** panel concept as Lab 1.2, but you're never leaving the entity view - the panel surfaces inside the KPI drawer for the service, alongside the workload memory data you already saw.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**`oteldemo.ProductCatalogService/ListProducts`**

**How to find it:**

1. Use the search bar to show the `productcatalogservice`, or open Entity Graph → **Show all services** and filter.
2. Open the **KPI drawer**.
3. Click the **Service Overview** tab.
4. Look at the **Operations** panel - `oteldemo.ProductCatalogService/ListProducts` shows visible variation in its sparkline.

![Operations sparkline](/img/lab2/2.4-knowledge-graph.png)

</details>
