---
sidebar_position: 3
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.3. What changed first?

*You know the failure mode is a memory leak. But a leak doesn't start itself - something changed. The [RCA Workbench](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench/) puts every insight on one timeline so you can see what happened first.*

Open **Observability** -> **RCA workbench**. Add `productcatalogservice` and `frontend`, then click **Causes** - it automatically pulls in related upstream entities that could be the root cause (the pods, the node, and connected services). Set the time range to start just before the errors began.

![RCA Workbench timeline](/img/lab3/3.5-rca-workbench.png)

---

## Question 1: What was the first event?

**Read the Timeline in time order. What is the earliest insight - before the memory saturation and the crashes?**

The failure and error insights are loud, but they're symptoms.

<TryIt where="the Timeline, read in time order - scroll to the earliest entries." />

<details className="answer-reveal">
<summary>Show answer</summary>

The earliest insight is a change event (an **Amend** insight, shown in blue): a **feature flag was switched on** for `productcatalogservice`. Everything after it follows in order:

1. **Change** - the feature flag flips (Amend, blue).
2. **Saturation** - memory climbs toward the limit (yellow -> red).
3. **Failure** - the pod is OOMKilled and crash-loops (red).
4. **Error** - `frontend` starts returning 500s (red).

The flag change is the root cause; the 500s customers noticed are the last link in the chain.

> **Why this matters:** "what changed first" is usually the fix, and it's the one thing a single dashboard can't tell you.

**How to find it:**

1. In the **RCA workbench**, read the **Timeline** top-to-bottom in time order.
2. Expand the earliest entry - the feature-flag change insight on `productcatalogservice`.
3. Trace the sequence forward through Saturation -> Failure -> Error.

![First event: feature flag change](/img/lab3/3.6-first-event.png)

</details>

---

## Question 2: Confirm it in the logs

**From the workbench, open the entity's logs. What do the logs say as it dies?**

The workbench links each entity into **Logs Drilldown**, pre-filtered - no LogQL needed.

<TryIt where="the Logs link on productcatalogservice in the workbench, then the Patterns tab." />

<details className="answer-reveal">
<summary>Show answer</summary>

Filtering to `productcatalogservice` at error level, the **Patterns** view surfaces the crash: out-of-memory messages and the runtime stack trace as the process is killed, repeating with each restart of the crash loop.

**How to find it:**

1. From `productcatalogservice` in the workbench, open **Logs** (Logs Drilldown).
2. Filter to `detected_level = error` (and the service, if not already applied).
3. Open the **Patterns** tab; **Include** the OOM/panic pattern.
4. Click a line to read the full stack trace in the details panel.

![Logs Drilldown - OOM pattern](/img/lab3/3.7-logs-drilldown.png)

</details>

---

## Question 3: See the impact on traces <Badge variant="optional">Optional</Badge>

**Open the entity's traces. What happens to requests during the crash loop?**

The same workbench links open **Traces Drilldown** for the entity.

<TryIt where="the Traces link on the entity, with the Errors metric selected." />

<details className="answer-reveal">
<summary>Show answer</summary>

During each crash window, requests to `productcatalogservice` error or hang - the **Errors** RED metric spikes, and traces that touch the service show failed spans. This is how an infrastructure problem (OOM) becomes a user-facing one (frontend 500s).

**How to find it:**

1. From the entity, open **Traces** (Traces Drilldown).
2. Choose the **Errors** metric; open **Root cause errors** / **Exceptions**.
3. See the error spikes aligned with the crash-loop windows.

![Traces Drilldown - errors during crashes](/img/lab3/3.8-traces-drilldown.png)

</details>
