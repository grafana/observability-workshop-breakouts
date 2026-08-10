---
sidebar_position: 4
---

import TryIt from '@site/src/components/TryIt';

# 3.4. Does the Assistant tell the same story?

*You reconstructed the incident by hand. Now have the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench-ai/) do it from the same graph, and check that its story matches yours.*

Inside the RCA Workbench, the Assistant runs in **Knowledge Graph mode**: it reasons over the entities, relationships, and insight timeline you're looking at. Click **Analyze RCA Workbench** (or open the Assistant and reference entities with `@`).

:::note

LLM output varies between runs. Judge the Assistant on whether it names the same root cause and the same order of events you found on the timeline.

:::

---

## Question 1: What does the Assistant conclude?

**Ask the Assistant to analyze the workbench. What root cause and sequence does it report?**

<TryIt where="the Analyze RCA Workbench button, bottom-right of the workbench.">Ask the Assistant before revealing the answer below.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

The Assistant should narrate the same causal chain you assembled from the timeline:

```
A feature-flag change on productcatalogservice preceded a steady rise in memory
(saturation), leading to OOMKills and a crash loop (failure). Because frontend
depends on productcatalogservice, those failures propagated as 5xx errors to the
frontend. Root cause: the feature-flag change; the frontend 500s are the symptom.
```

**How to find it:**

1. In the **RCA workbench**, click **Analyze RCA Workbench** (bottom-right).
2. Let its analysis finish before asking follow-ups.
3. Read its root cause and event ordering.

![Assistant analyzing the workbench](/img/lab3/3.9-assistant-analyze.png)

</details>

---

## Question 2: Verify against the timeline

**Does the Assistant's story match the graph - the source entity, the order of events, and the propagation path?**

<TryIt where="the Assistant's summary, side by side with the Timeline and Entity Graph you already have open." />

<details className="answer-reveal">
<summary>Show answer</summary>

Check each claim against what you established:

- **Source entity** = `productcatalogservice` - matches the entity with critical *own* insights (3.1 Q1).
- **First event** = the feature-flag change - matches the earliest timeline insight (3.3 Q1).
- **Mechanism** = memory saturation -> OOMKilled -> crash loop - matches Kubernetes Monitoring (3.2 Q1) and the logs (3.3 Q2).
- **Propagation** = `frontend` errors because it calls `productcatalogservice` - matches the Entity Graph edge (3.1 Q2).

The knowledge graph gives the Assistant the same typed map of entities and relationships you just verified, which is why the stories line up. If any claim didn't match the timeline, that's your cue to dig further, not to trust it.

**How to find it:**

1. Compare the Assistant's narrative point-by-point with the **Timeline** and **Entity Graph**.
2. Confirm the source entity, first event, mechanism, and propagation path all agree.

</details>

---

## Wrap-up

You identified the source entity via its own vs propagated insights (Entity Catalog), saw the blast radius from failing pod to frontend (Entity Graph), confirmed the OOMKill and right-sizing fix (Kubernetes Monitoring), found the feature-flag change that started it all (RCA Workbench), confirmed the crash in logs and its impact in traces (Drilldown), and verified the Assistant's analysis against the same timeline.

In Lab 4, you'll take these tools to a different application - the banking app.
