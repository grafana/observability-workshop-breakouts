---
sidebar_position: 3
---

# 3.3. Query Span Metrics

Open a **new conversation** with Assistant for this section.

---

## Question 1 - Service health

Are my services healthy?

<details className="answer-reveal">
<summary>Show answer</summary>

![Service health response](/img/lab3/3.1-grafana-assistant-1.png)

</details>

---

## Question 2 - Interactions and downstream issues

What interacts with the `productcatalogservice`? Any downstream issues?

<details className="answer-reveal">
<summary>Show answer</summary>

**Services that interact with `productcatalogservice`:**

1. `checkoutservice`
2. `frontend`
3. `recommendationservice`
4. `inventoryservice`

**Confirmed downstream issues:**

1. Checkout service instability.
2. Checkout service instability.
3. Service interaction patterns:
   - gRPC calls failing: `GetProduct` and `ListProducts` methods.
   - Multiple regional failures: all 3 regions affected simultaneously.
   - Time correlation: checkout errors occur during catalog service restart periods.

![Prompt](/img/lab3/3.2-grafana-assistant-1.png)
![Findings 1](/img/lab3/3.2-grafana-assistant-2.png)
![Findings 2](/img/lab3/3.2-grafana-assistant-3.png)
![Findings 3](/img/lab3/3.2-grafana-assistant-4.png)
![Findings 4](/img/lab3/3.2-grafana-assistant-5.png)
![Answer](/img/lab3/3.2-grafana-assistant-6.png)

</details>

---

## Question 3 - Postgres version - extra credit

What version of postgres is deployed in my app?

<details className="answer-reveal">
<summary>Show answer</summary>

**PostgreSQL version: 16.0**

![Prompt](/img/lab3/3.3-grafana-assistant-1.png)
![Findings 1](/img/lab3/3.3-grafana-assistant-2.png)
![Findings 2](/img/lab3/3.3-grafana-assistant-3.png)
![Answer](/img/lab3/3.3-grafana-assistant-4.png)

</details>

---

## Question 4 - What's going on? - extra credit

What's going on with the `productcatalogservice`?

<details className="answer-reveal">
<summary>Show answer</summary>

```
📈 Current Status:
Service: Partially functional (restarts every few minutes)
User impact: HIGH - catalog lookups likely failing intermittently
Urgency: CRITICAL - needs immediate developer intervention

The productcatalogservice is in a crash-restart loop due to a combination of database connection exhaustion and runtime panics. It needs immediate code fixes and database configuration changes.
```

![Prompt](/img/lab3/3.4-grafana-assistant-1.png)
![Findings 1](/img/lab3/3.4-grafana-assistant-2.png)
![Findings 2](/img/lab3/3.4-grafana-assistant-3.png)
![Findings 3](/img/lab3/3.4-grafana-assistant-4.png)
![Findings 4](/img/lab3/3.4-grafana-assistant-5.png)
![Answer](/img/lab3/3.4-grafana-assistant-6.png)

</details>
