---
sidebar_position: 4
---

import TryIt from '@site/src/components/TryIt';

# 3.3. Let the Assistant read the graph

*You reconstructed the incident by hand. Now let the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench-ai/) do it from the same graph - and verify that its story matches yours.*

Inside the RCA Workbench, the Assistant runs in **Knowledge Graph mode**: it reasons over the entities, their relationships, and the insight timeline you're looking at. Click **Analyze RCA Workbench** (or open the Assistant and reference the entities with `@`).

:::note

LLM output varies between runs. Judge the Assistant on whether it names the same root cause and the same order of events you found on the timeline.

:::

---

## Question 1: What does the Assistant conclude?

**Ask the Assistant to analyze the workbench. What root cause and sequence does it report?**

<TryIt>Ask the Assistant before revealing the answer below.</TryIt>

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

The Assistant is only as trustworthy as its evidence. You have the timeline and the graph in front of you - check its narrative against them.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Check each claim against what you already established:

- **Source entity** = `productcatalogservice` - matches the entity with critical *own* insights (3.1 Q1). ✅
- **First event** = the feature-flag change - matches the earliest timeline insight (3.3 Q1). ✅
- **Mechanism** = memory saturation → OOMKilled → crash loop - matches Kubernetes Monitoring (3.2 Q1) and the logs (3.3 Q2). ✅
- **Propagation** = `frontend` errors *because* it calls `productcatalogservice` - matches the Entity Graph edge (3.1 Q2). ✅

Because the knowledge graph gives the Assistant a pre-built, typed map of entities and relationships, its analysis is grounded in the same structure you verified - which is why the story lines up. If any claim *didn't* match the timeline, that's your cue to dig, not to trust.

**How to find it:**

1. Compare the Assistant's narrative point-by-point with the **Timeline** and **Entity Graph**.
2. Confirm the source entity, first event, mechanism, and propagation path all agree.

</details>

---

## Wrap-up

Faced with a wide-blast-radius incident, you used the Knowledge Graph and Kubernetes Monitoring to:

- rank health across the estate and identify the **source** entity via its own vs propagated insights (**Entity Catalog**),
- see the **blast radius** from failing pod to frontend (**Entity Graph**),
- characterise the failure as an **OOMKill** with memory climbing into its limit, and see the right-sizing fix (**Kubernetes Monitoring**),
- reconstruct the incident's **order of events** and find the feature-flag change that started it (**RCA Workbench**),
- confirm the crash in **logs** and its impact in **traces** (**Drilldown**),
- and had the **Assistant** produce the same narrative from the same graph - which you verified.

> **Why this matters:** a graph of your system - entities, relationships, and time-ordered insights - is what turns "half of everything is red" into "one change, here, caused all of it." It's also what lets an AI reason about your system reliably.

In **Lab 4**, you'll take these skills to an entirely different application - and lead with **Traces Drilldown** to catch a problem hiding in plain sight.
