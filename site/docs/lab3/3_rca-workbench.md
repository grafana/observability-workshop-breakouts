---
sidebar_position: 3
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.2. Find the first event in the RCA Workbench

*You know the memory leak is the failure mode. But a leak doesn't start itself - something changed. The [RCA Workbench](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench/) puts every insight on one timeline so you can see what happened first.*

Open **Observability → RCA workbench**. Add `productcatalogservice` and `frontend`, then click **Causes** - it automatically pulls in related upstream entities that could be the root cause (the pods, the node, and services that feed them). Set the time range to start just before the errors began.

![RCA Workbench timeline](/img/lab3/3.5-rca-workbench.png)

---

## Question 1: What was the very first event?

**Sort the Timeline by time. What is the earliest insight - before the memory saturation and the crashes?**

The **Timeline** lays out every insight chronologically. The failure and error insights are loud, but they're symptoms. Scroll to the *start* of the incident to find what actually kicked it off.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The earliest insight is a **change / configuration event** (an **Amend** insight, shown in blue): a **feature flag was switched on** for `productcatalogservice`. Everything after it follows in order:

1. **Change** - the feature flag flips (Amend, blue).
2. **Saturation** - memory climbs toward the limit (yellow → red).
3. **Failure** - the pod is OOMKilled and crash-loops (red).
4. **Error** - `frontend` starts returning 500s (red).

The flag change is the root cause; the 500s customers noticed are the very last link in the chain.

**How to find it:**

1. In the **RCA workbench**, view the **Timeline** and read it top-to-bottom in time order.
2. Expand the earliest entry - the feature-flag **change** insight on `productcatalogservice`.
3. Trace the sequence forward through Saturation → Failure → Error.

![First event: feature flag change](/img/lab3/3.6-first-event.png)

> **The value:** the timeline reconstructs the incident's *order of events*. "What changed first" is usually the fix, and it's the one thing a single dashboard can't tell you.

</details>

---

## Question 2: Confirm it in the logs

**From the workbench, open the entity's logs. What do the logs say as it dies?**

The workbench links each entity straight into **Logs Drilldown**, pre-filtered - no LogQL to write. Use it to see the crash in the service's own words.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Filtering the logs to `productcatalogservice` and to error level, the **Patterns** view surfaces the crash: **out-of-memory / OOM kill** messages and the runtime **stack trace / panic** as the process is terminated, repeating with each restart of the crash loop.

**How to find it:**

1. From `productcatalogservice` in the workbench, open **Logs** (Logs Drilldown).
2. Filter to `detected_level = error` (and the service, if not already applied).
3. Open the **Patterns** tab; **Include** the OOM/panic pattern.
4. Click a line to read the full stack trace in the details panel.

![Logs Drilldown - OOM pattern](/img/lab3/3.7-logs-drilldown.png)

> **The value:** Drilldown lets you go from an entity in the graph to the exact failing log lines by clicking - the queryless path from "which service" to "here's the crash."

</details>

---

## Question 3: See the impact on traces <Badge variant="optional">Optional</Badge>

**Open the entity's traces. What happens to requests during the crash loop?**

The same workbench link opens **Traces Drilldown** for the entity. Traces show the leak's effect on real requests.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

During each crash window, requests to `productcatalogservice` **error or hang** - the **Errors** RED metric spikes, and traces that touch the service show failed/aborted spans. This is the mechanism by which an infrastructure problem (OOM) becomes a user-facing one (frontend 500s).

**How to find it:**

1. From the entity, open **Traces** (Traces Drilldown).
2. Choose the **Errors** metric; open **Root cause errors** / **Exceptions**.
3. See the error spikes aligned with the crash-loop windows.

![Traces Drilldown - errors during crashes](/img/lab3/3.8-traces-drilldown.png)

> **The value:** metrics, logs, and traces for the entity are all one click from the graph, so you can confirm cause (logs) *and* impact (traces) without rebuilding context.

</details>
