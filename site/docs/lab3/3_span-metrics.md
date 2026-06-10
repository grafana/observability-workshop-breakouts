---
sidebar_position: 3
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.3. Query Span Metrics

*Final stretch. In Lab 1.2 you walked through Application Observability service-by-service to track the productcatalog crash loop. Here you'll do it again, but Assistant drives - and you'll see whether it lands the same conclusions you reached manually.*

Span metrics are derived from your OpenTelemetry traces, so Assistant can reason about service health, dependencies, and the productcatalog story without you opening a single panel.

Open a **new conversation** with Assistant for this section.

---

## Question 1: Service health

**Are my services healthy?**

The natural-language equivalent of opening the Service Inventory and scanning the error/latency columns. Watch which services Assistant flags - they should be the same ones you spotted in Lab 1.2.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

![Service health response](/img/lab3/3.1-grafana-assistant-1.png)

</details>

---

## Question 2: Service interactions

**What interacts with the `productcatalogservice`? Any downstream issues?**

In Lab 1.2 you read the Inbound and Outbound panels to figure out who talks to productcatalog. Now ask the same question, but in one shot - Assistant correlates "what calls this" with "what's broken right now" so you get the dependency map *and* the impact in a single answer.

> **Why this matters:** Assistant isn't just retrieving data, it's joining it. Pulling dependencies + current health in one prompt is something the classic apps would make you do in two separate views.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

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

## Question 3: Postgres version <Badge variant="optional">Optional</Badge>

**What version of postgres is deployed in my app?**

A quick infrastructure-attribute lookup. The kind of question that'd normally need you to remember where to look - or pop into Knowledge Graph to read the properties bag. Assistant should resolve it without you needing to know either path.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

**PostgreSQL version: 16.0**

![Prompt](/img/lab3/3.3-grafana-assistant-1.png)
![Findings 1](/img/lab3/3.3-grafana-assistant-2.png)
![Findings 2](/img/lab3/3.3-grafana-assistant-3.png)
![Answer](/img/lab3/3.3-grafana-assistant-4.png)

</details>

---

## Question 4: Service triage <Badge variant="optional">Optional</Badge>

**What's going on with the `productcatalogservice`?**

This is the workshop's big finish: the entire investigation from Lab 1 → Lab 2, reduced to a single prompt. Assistant should correlate restarts, error logs, traces, and downstream impact into a triage summary - the kind of paragraph you'd otherwise write yourself after thirty minutes of clicking.

Compare its answer to what you found the long way. How close is it?

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

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
