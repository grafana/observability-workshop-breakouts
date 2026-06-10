---
sidebar_position: 1
---

# 1.1. Frontend Observability

Navigate to the **Frontend Observability** app in Grafana and click into the `ecommerce` frontend app.

![Frontend Observability - getting started](/img/lab1/0.1-frontend-instructions.png)

---

## Question 1 - Page loads

How many page loads have there been in the **last 1 hour**?

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

## Question 2 - Largest Contentful Paint

What is the value of the **Largest Contentful Paint** core web vital over the past 1 hour?

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

## Question 3 - Pages with errors

In the last 1 hour, which pages have errors?

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

## Question 4 - Example errors (optional)

What are three examples of errors over the last 1 hour?

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
