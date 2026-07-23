---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 1.2. Let the Assistant take a turn

*You solved it by hand and learned the tools doing it. Now see how much of that the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/) can do for you - and, just as importantly, learn to check its work.*

The Assistant can query your metrics, logs, traces, and frontend telemetry to investigate a problem and report what it found, with the evidence behind it. The goal of this final step isn't to watch AI do magic - it's to see the value it adds *and* to build the habit of verifying it.

:::note

Because an LLM's output varies between runs, your Assistant's wording won't match the text below exactly. Judge it on whether it reaches the same *conclusion* with the same *evidence*.

:::

---

## Question 1: What does the Assistant conclude?

**Ask the Assistant to investigate the ecommerce slowdown. What root cause does it report?**

Open the Grafana Assistant and give it a prompt like: *"Users report the ecommerce site is slow. Investigate the frontend performance in the last 3 hours and tell me the root cause."*

<TryIt>Ask Grafana Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should land on the same story you did: **LCP has regressed on image-heavy pages, driven by slow image loading, with no elevated errors and a healthy backend.**

```
🔎 LCP (p75) on /product/* and / has risen well above the 2.5s "good" threshold.
📉 Only LCP is affected; error rates are flat and backend span durations are normal.
✅ Root cause: slow client-side image asset loading. Backend services are healthy.
```

**How to find it:**

1. Open the **Grafana Assistant**.
2. Ask it to investigate the frontend performance of the `ecommerce` app.
3. Read its summary of findings and root cause.

![Assistant investigation summary](/img/lab1/2.1-assistant-summary.png)

</details>

---

## Question 2: Verify its evidence

**Expand the Assistant's steps. Did it actually check the right things - and did it avoid blaming the backend without evidence?**

This is the most important question in the lab. An answer that *sounds* right is not the same as one that *is* right. Expand the Assistant's tool calls and hold them against your own investigation.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

A trustworthy investigation shows the Assistant:

- Querying **Web Vitals** and finding **only LCP** regressed - matches your Question 2.
- Scoping it to **image-heavy pages** - matches your Question 3.
- Checking **error rates** and finding them flat - matches your Question 5.
- Checking **backend traces / service health** and finding them healthy - matches your Question 7.

If it did all that, its conclusion is well-supported and you can act on it. If it skipped a step - or blamed a backend service without opening a single trace - that's exactly the gap this habit is meant to catch. **The Assistant is a force multiplier, not a replacement for judgement.**

**How to find it:**

1. In the Assistant's response, expand each tool call / step.
2. Confirm which telemetry it queried and that the evidence supports the conclusion.
3. Compare against your findings from section 1.1.

![Assistant tool calls expanded](/img/lab1/2.2-assistant-tool-calls.png)

</details>

---

## Wrap-up

In 20 minutes you caught a revenue-affecting problem that **every backend dashboard reported as healthy** - because the only place it was visible was the browser. Using Frontend Observability you:

- confirmed traffic was fine but **LCP** was poor (Web Vitals),
- narrowed it to **image-heavy pages** (Page Performance) and confirmed it was **universal** (segmentation),
- **ruled out errors** and pinned the slow **image resource** in a real user session,
- and **proved the backend was innocent** by following the trace,
- then had the Assistant reach the same conclusion - and verified its evidence.

> **Why this matters:** without RUM, this incident stays invisible until customers leave. The frontend is your earliest signal of real user pain, and it correlates all the way down the stack.

But the frontend is only ever the *start* of the trail. In **Lab 2**, a similar-looking symptom won't stop at the browser - the trace will lead you down into a slow database query, and a whole different signal.
