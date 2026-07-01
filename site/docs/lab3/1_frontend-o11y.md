---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.1. Query Frontend Observability data

*You've now solved the productcatalog mystery two ways - one way through Lab 1's apps, and a second, shorter way through Knowledge Graph in Lab 2. There's a third option: don't navigate anywhere. Just ask.*

[Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) is a purpose-built LLM inside Grafana that lets operators, developers, and SREs troubleshoot, manage dashboards, and answer product questions in natural language. In this section you'll point it at the same `ecommerce` frontend app you explored in Lab 1.1 and ask the same questions - then watch how Assistant resolves them.

The core questions cover frontend page loads and errors. The extra credit walks through using `@` context to pin Assistant to a specific data source and label - useful when you want it focused on one slice of telemetry instead of searching everywhere.

---

## Question 1: Page loads

**Looking at my frontend app `ecommerce`, how many page loads have there been in the last 3 hours?**

Same first question as Lab 1.1 - and a good way to see what Assistant does when you give it minimal context. No `@` mention, no data source hint, just the question. Watch which tool calls it picks to answer: expanding them is the difference between "trust me" and "here's my working," and lets you verify it queried the right data before trusting the result.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

Approximately **1,300-1,780 requests per second** over the last 3 hours.

Note that Assistant answered with a *rate* (requests per second) rather than a raw count - a good example of why you expand the tool call to see exactly what it queried.

![Assistant page-loads response](/img/lab3/1.1-grafana-assistant-1.png)

</details>

---

## Question 2: Page errors

**Do any of those pages have errors?**

Continuing the same conversation lets Assistant carry forward what it already knows - this is the AI equivalent of staying on the same service detail page. It should remember the `ecommerce` app from the previous prompt without you re-stating it.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

Yes - Assistant reports errors on the same pages you saw in Lab 1.1 (`/`, `/cart`, `/cart/checkout/*`, and `/product/*`), carrying forward the `ecommerce` app from the previous prompt.

![Assistant errors response](/img/lab3/1.2-grafana-assistant.png)

</details>

---

## Question 3: Logs context <Badge variant="optional">Optional</Badge>

**Ask another Frontend Observability question, this time with `@` context for the logs data source**

So far Assistant has been free to pick its own data source. The `@` syntax is how you take the wheel: point it at a specific resource (here, the logs data source `grafanacloud-*****-logs`) and it runs queries there instead of guessing. Use it whenever the right answer lives in a specific place.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

With the `@` context set, Assistant runs its query against the pinned logs data source (`grafanacloud-*****-logs`) instead of choosing one itself - expand the tool call to confirm which data source it used.

![Assistant with logs data source context](/img/lab3/1.3-grafana-assistant.png)

</details>

---

## Question 4: Label context <Badge variant="optional">Optional</Badge>

**Ask another Frontend Observability question with `@` context for the `app_id` label**

You can pin Assistant even further down: not just to a data source, but to a specific label value within it. Frontend Observability uses the `app_id` label to identify which app each log line belongs to - so pinning Assistant to one `app_id` narrows it to just that frontend.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

Navigate to **Labels** in the context menu:

![Labels menu](/img/lab3/1.4-grafana-assistant-1.png)

Select the logs data source:

![Logs data source](/img/lab3/1.4-grafana-assistant-2.png)

Select the `app_id` label:

![app_id label](/img/lab3/1.4-grafana-assistant-3.png)

Choose the app id:

![Choose the app id](/img/lab3/1.4-grafana-assistant-5.png)

</details>
