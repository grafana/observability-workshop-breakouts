---
sidebar_position: 2
---

# 2.2. Compare with the classic apps

To really understand why Knowledge Graph helps, try solving the same questions **without** it - using the same apps you used in Lab 1 (Application Observability, Kubernetes Monitoring, etc.).

Let us know how you do!

:::info

The answers below use Knowledge Graph as the reference path, but you should attempt each question in the classic apps first before revealing.

:::

---

## Question 1 - Memory assigned

How much memory is assigned to the `productcatalogservice` workload?

<details className="answer-reveal">
<summary>Show answer</summary>

**100 MiB**

**How to find it (Knowledge Graph path):**

1. Use the search bar to show the `productcatalogservice` service, or open Entity Explorer → **Show all services** and filter for `productcatalogservice`.
2. Open the **KPI drawer**.
3. Click the **Kubernetes** tab.
4. See **memory limits** within the **Workload Memory** panel.

![Workload memory](/img/lab2/2.1-knowledge-graph.png)

</details>

---

## Question 2 - Error rate

What error rate percentage has the `productcatalogservice` reached over the last 24 hours?

<details className="answer-reveal">
<summary>Show answer</summary>

Between **15% and 40%**.

**How to find it (Knowledge Graph path):**

1. Use the search bar to show the `productcatalogservice`, or open Entity Explorer → **Show all services** and filter.
2. Open the **KPI drawer**.
3. Click the **Service Overview** tab.
4. Look at the **Errors** panel and see how high the spike gets.

</details>

---

## Question 3 - Error message

What error message is the `productcatalogservice` throwing when it errors in the last 24 hours?

<details className="answer-reveal">
<summary>Show answer</summary>

- **Traces approach:** `pq: sorry, too many clients already`
- **Logs approach:**
  - `panic: runtime error: invalid memory address or nil pointer dereference`
  - `pq: sorry, too many clients already`

The interesting path here is using the **context-driven RCA Workbench**.

1. Open RCA Workbench with `productcatalogservice` and add connected services (see [Question 5 in 2.1](./1_knowledge-graph.md#question-5---first-event)).
2. Click the **Summary** tab - it's easier to read, though Timeline works too.
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

## Question 4 - Erroring endpoint

Which endpoint or endpoints are erroring within the `productcatalogservice` over the last 24 hours?

<details className="answer-reveal">
<summary>Show answer</summary>

**`oteldemo.ProductCatalogService/ListProducts`**

**How to find it:**

1. Use the search bar to show the `productcatalogservice`, or open Entity Explorer → **Show all services** and filter.
2. Open the **KPI drawer**.
3. Click the **Service Overview** tab.
4. Look at the **Operations** panel - `oteldemo.ProductCatalogService/ListProducts` has wiggles in its sparkline.

![Operations sparkline](/img/lab2/2.4-knowledge-graph.png)

</details>
