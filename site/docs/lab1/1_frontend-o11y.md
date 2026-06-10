---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';

# 1.1. Frontend Observability

*Imagine you're on call. Customers are reporting that the ecommerce site is acting up - pages loading slowly, the occasional error. Where do you start? At the same place your users do: in the browser.*

Grafana Cloud [Frontend Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/) gives you that view. It collects telemetry directly from the browser using the Faro Web SDK - performance metrics, errors, logs, and client-side traces - so you can see what's actually happening across devices, browsers, and networks.

Navigate to the **Frontend Observability** app in Grafana and click into the `ecommerce` frontend app.

![Frontend Observability - getting started](/img/lab1/0.1-frontend-instructions.png)

---

## Question 1: How many page loads have there been in the last 1 hour?

Before we go hunting for problems, let's get our baseline. How busy is the app right now? The **Page Loads** panel on the app overview is the at-a-glance traffic indicator - the very first number worth knowing.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Between **500 and 700** page loads.

**How to find it:**

1. Open the Frontend Observability app.
2. Select the `ecommerce` app.
3. Read the value in the **Page Loads** panel.

![Page Loads panel](/img/lab1/1.1-frontend-o11y.png)

</details>

---

## Question 2: What is the value of the **Largest Contentful Paint** core web vital over the past 1 hour?

Traffic is fine. But how fast does the page actually feel? LCP is one of the Core Web Vitals Frontend Observability surfaces directly on the app overview - it's how Google measures whether your page loads quickly enough to keep users engaged.

> **Why this matters:** Page load metrics are a leading indicator of frustration. Slow pages are abandoned pages, and abandoned pages are lost orders.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Between **1s and 2s**.

**How to find it:**

1. Open the Frontend Observability app.
2. Select the `ecommerce` app.
3. Read the value in the **LCP** panel.

![LCP panel](/img/lab1/1.2-frontend-o11y.png)

</details>

---

## Question 3: In the last 1 hour, which pages have errors?

OK, traffic is healthy and LCP is reasonable - but errors are what customers are calling about. The **Page Performance** panel groups requests by page so you can immediately see *where* it's breaking. If every page is throwing errors, that points to something deep in the stack. If only one is, you've narrowed it already.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

All four pages:

- `/`
- `/cart`
- `/cart/checkout/*`
- `/product/*`

**How to find it:**

1. Open the Frontend Observability app.
2. Select the `ecommerce` app.
3. In the **Page Performance** panel, check the error column for each page ID - they all show errors.

![Page Performance panel](/img/lab1/1.3-frontend-o11y.png)

</details>

---

## Question 4: What are three examples of errors over the last 1 hour? _(optional)_

Every page is broken - that's a strong signal that whatever's wrong is happening on the backend, not in any single frontend route. Before we leave Frontend Observability, let's grab a few of the actual exception strings the browser is sending back. Those errors are clues we'll carry into the next lab.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Anything in `{...}` may be substituted for a value - there are too many permutations to list.

- `Response not ok. Status code: 500. Status text: ''. Url: {YOUR_APP_URL}/api/data?contextKeys=telescopes`
- `Response not ok. Status code: 500. Status text: ''. Url: {YOUR_APP_URL}/api/products?currencyCode={CURRENCY_CODE}`
- `Response not ok. Status code: 500. Status text: ''. Url: {YOUR_APP_URL}/api/recommendations?productIds={PRODUCT_ID}&sessionId={SESSION_ID}&currencyCode={CURRENCY_CODE}`

**How to find it:**

1. Open the Frontend Observability app.
2. Select the `ecommerce` app.
3. Click the **Errors** tab.
4. See the **Top Errors** panel.

![Top Errors panel](/img/lab1/1.4-frontend-o11y.png)

</details>
