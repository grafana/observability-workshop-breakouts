---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 1.2. Ask the Assistant, then check its work

*You've found the root cause by hand. Now ask the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) to investigate the same problem, and check its work against yours.*

The Assistant can query metrics, logs, traces, and frontend telemetry to investigate a problem and report what it found. Because LLMs can make mistakes, the habit to build is: read its conclusion, then expand its tool calls and confirm the evidence supports it.

:::note

Because of the variable nature of an LLM assistant, results will not always match between users or match the answers below exactly. Judge the Assistant on whether it reaches the same conclusion with the same evidence.

:::

---

## Question 1: What does the Assistant conclude?

**Ask the Assistant to investigate the ecommerce slowdown. What root cause does it report?**

Open the Grafana Assistant and use a prompt like: *"Users report the ecommerce site is slow. Investigate the frontend performance during [your time window] and tell me the root cause."*

<TryIt where="the Grafana Assistant button in the top-right corner of Grafana.">Ask Grafana Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should land on the same conclusion you did: LCP regressed on image-heavy pages, driven by slow image loading, with no elevated errors and a healthy backend.

```
LCP (p75) on /product/* and / has risen well above the 2.5s "good" threshold.
Only LCP is affected; error rates are flat and backend span durations are normal.
Root cause: slow client-side image asset loading. Backend services are healthy.
```

**How to find it:**

1. Open the **Grafana Assistant**.
2. Ask it to investigate the frontend performance of the `ecommerce` app.
3. Read its summary of findings and root cause.

![Assistant investigation summary](/img/lab1/2.1-assistant-summary.png)

</details>

---

## Question 2: Verify its evidence

**Expand the Assistant's steps. Did it check the right things?**

<TryIt where="the tool calls inside the Assistant's response - each one expands to show the query it ran." />

<details className="answer-reveal">
<summary>Show answer</summary>

A well-supported investigation should show the Assistant:

- Querying **Web Vitals** and finding only LCP regressed - matches your Question 2.
- Scoping it to **image-heavy pages** - matches your Question 3.
- Checking **error rates** and finding them flat - matches your Question 5.
- Checking **backend traces / service health** and finding them healthy - matches your Question 7.

If it did all of that, the conclusion is backed by evidence and you can act on it. If it skipped a step - or blamed a backend service without opening a trace - that's exactly what this check is for.

**How to find it:**

1. In the Assistant's response, expand each tool call.
2. Confirm which telemetry it queried and that the evidence supports the conclusion.
3. Compare against your own findings from section 1.1.

![Assistant tool calls expanded](/img/lab1/2.2-assistant-tool-calls.png)

</details>

---

## Wrap-up

You found a customer-facing problem that never showed up in a backend dashboard: a slow-image regression visible only through real user monitoring. You confirmed the LCP regression, narrowed it to the image-heavy pages, ruled out errors, pinned the slow image resource in a user session, confirmed the backend was healthy through a trace, and verified the Assistant reached the same conclusion.

In Lab 2, a similar frontend symptom will lead somewhere different - into a database query.
