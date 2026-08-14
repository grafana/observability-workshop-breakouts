---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';
import EnvLink from '@site/src/components/EnvLink';

# 3.1. Map the incident with the Knowledge Graph

*Errors are everywhere and several services look bad at once. Start with the map, not a single dashboard.*

You'll work through the Knowledge Graph's surfaces in order - **Entity Catalog** (find the source), **Entity Graph** (see the blast radius), **Kubernetes Monitoring** (the infrastructure detail), and the **RCA Workbench** (what changed first) - then let the **Grafana Assistant** narrate it and check its story against yours.

Open **Observability** -> **Entity catalog**. This is the inventory of every entity the Knowledge Graph has discovered - services, pods, nodes, namespaces, databases - each showing its health through **insight rings** and type-appropriate KPIs. Set the time range to cover when the errors began.

:::tip Jump straight there

<EnvLink path="/a/grafana-asserts-app/catalog" from="12:00" to="13:00" timeParam="startend" params="namespace%5B0%5D=ecommerce-prod&searchQuery=&entityTypeFilter=Service&pageSize=15&page=1&sortBy%5Bid%5D=AssertionCircle&sortBy%5Border%5D=desc&columns%5B0%5D%5Bid%5D=Technology&columns%5B1%5D%5Bid%5D=LatencyP95&columns%5B2%5D%5Bid%5D=ErrorRatio&columns%5B3%5D%5Bid%5D=RequestRate&uninstrumentedFilter=instrumented">Open the Entity Catalog for the ecommerce namespace</EnvLink> - opens the catalog filtered to the `ecommerce-prod` namespace and Service entities, sorted by health, with the memory-leak window (previous day, UTC) applied. Needs your environment ID from the Welcome page.

:::

![Entity Catalog](/img/lab3/3.1-entity-catalog.png)

---

## Question 1: Which entity is the source of the trouble?

**Filter the catalog to the ecommerce namespace. Which entity has the worst health, and what kind of insight is firing on it?**

Every entity shows two insight rings: the **outer** ring is its *own* insights, the **inner** ring is insights **propagated from things it depends on**. Colors are red (critical), yellow (warning), blue (info). The entity with critical insights of its own is where to look - entities that only light up on the inner ring are downstream of the problem.

<TryIt where="the Entity catalog, namespace = ecommerce-prod. Look for the service with a red insight ring, then open it and use its KPI drawer." />

<details className="answer-reveal">
<summary>Show answer</summary>

Several services light up, but the **source** is **`productcatalogservice`** - it carries a red (critical) insight ring for a **Failure** (it's crash-looping / OOMKilled) and a **Saturation** (memory climbing into its limit).

Click `productcatalogservice` to open its **KPI drawer** - the one-stop view for an entity, with tabs the Knowledge Graph picks based on what it knows about the entity: **Service overview**, **Kubernetes**, **Metrics**, **Logs**, **Traces**, **Profiles**, **Go Runtime**, **Service KPI**.

![productcatalogservice KPI drawer - Service overview, with a Kubernetes tab](/img/lab3/3.2-kpi-drawer.png)

Open the **Kubernetes** tab in that drawer and the root cause is right there: **Workload memory** climbs toward its **limit** (usage peaking near the ~100 MiB container limit) and the pods restart - the OOM. You investigate all of this from the *service* entity; the drawer's **Open in Kubernetes** button takes you into Kubernetes Monitoring for the deeper dive (further down this page).

![The KPI drawer's Kubernetes tab - workload memory climbing into its limit](/img/lab3/3.2-kpi-k8s-memory.png)

:::note Why is productcatalogservice's error ratio 0%?
Because a crashing pod doesn't *emit* errors - it stops responding. While `productcatalogservice` is OOMKilled and restarting it serves little traffic, and the requests that do reach a healthy replica return 200s in ~17ms - so its own **error ratio reads ~0%** even though it's the culprit. The failures land on its **callers**: `checkoutservice`, `frontend`/`frontendproxy`, and `recommendationservice` show elevated error ratios (19.4%, 11.5%, 4.6%). Those are the **blast radius**; the crash-looping service is the **source**. The signal that flags the source isn't its error ratio - it's the red **insight ring** (the Failure/Saturation from its Kubernetes state), and the memory panel in the KPI drawer's Kubernetes tab confirms it.
:::

**How to find it:**

1. Open **Observability** -> **Entity catalog**; set **namespace = `ecommerce-prod`**.
2. Find `productcatalogservice` and note its red insight ring (ignore the 0% error ratio - see the note above).
3. Click it to open the **KPI drawer**, then open the **Kubernetes** tab.
4. Read the **Workload memory** panel - usage climbing into the container limit, with pod restarts.

</details>

---

## Question 2: How far does the damage spread?

**Open the Entity Graph for `productcatalogservice`. What depends on it, and what does it run on?**

The **Entity Graph** draws the dependency topology - `CALLS`, `HOSTS`, and other relationships as edges between entities, with the call rate on each edge and a health ring on each node.

<TryIt where="Observability → Entity graph (or Show connected entities from the catalog entry); search productcatalogservice connected services." />

<details className="answer-reveal">
<summary>Show answer</summary>

Searching **`productcatalogservice` connected services** draws the immediate neighbourhood - and every connected service has a red ring. The callers are all here: **`frontend`**, three regional **`checkoutservice`** instances, and **`recommendationservice`** - each with a `CALLS` edge into `productcatalogservice` labelled with its call rate. So the crash-looping service is exactly why the frontend and checkout are erroring: they call it, and it keeps dying under them. **`flagd`** (the feature-flag service) is connected too - a hint at what set this off, which the RCA Workbench will confirm.

![Entity Graph - productcatalogservice and its connected, erroring callers](/img/lab3/3.3-entity-graph.png)

Zooming out to the whole namespace shows the same picture at scale - `productcatalogservice` sits in the middle of a web of red-ringed services. From here the **Analyze with Assistant** button (bottom-right) can take the current graph selection straight to the Assistant.

![Entity Graph - the full ecommerce-prod namespace, productcatalogservice highlighted](/img/lab3/3.3-entity-graph-all.png)

**How to find it:**

1. Open **Observability** -> **Entity graph** (or **Show connected entities** from the catalog entry).
2. Search `productcatalogservice connected services`.
3. Follow the `CALLS` edges from `frontend` / `checkoutservice` / `recommendationservice` into `productcatalogservice`, and note the call rate and health ring on each.
4. Read the health rings - the whole chain, from the failing service up to the customer-facing frontend, is red.

</details>

---

## Kubernetes Monitoring

You've found the source and its blast radius. Now: *how exactly is it failing?* You glimpsed the memory climb in the KPI drawer's Kubernetes tab - [Kubernetes Monitoring](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/kubernetes-monitoring/) has the full infrastructure detail and the remediation.

You can go straight there from `productcatalogservice`. On the graph, click the entity to open its card and hit the **KPI** button.

![The entity card on the graph, with the KPI button](/img/lab3/3.3-graph-kpi-button.png)

In the KPI drawer's **Kubernetes** section, the `k8s.pod.name` link points at the crash-looping pod (`productcatalogservice-bb8bf6869-8mq2s`). Click it - or use the drawer's **Open in Kubernetes** button - to land on that pod's page in Kubernetes Monitoring, which mirrors the Kubernetes hierarchy (**Clusters -> Namespaces -> Workloads -> Nodes -> Pods -> Containers**).

![The KPI drawer's Kubernetes section links straight to the crash-looping pod](/img/lab3/3.4-kpi-to-pod.png)

## Question 3: Why is the pod dying?

**Open the crash-looping pod in Kubernetes Monitoring. How many times has it restarted, and what is its memory doing?**

<TryIt where="the productcatalogservice pod page (opened from the KPI drawer's Kubernetes section, or Open in Kubernetes) - the Pod information panel, then the Container optimization section. Set the time range to the incident window." />

<details className="answer-reveal">
<summary>Show answer</summary>

The pod page opens with an **Assistant health-check** banner ("Investigating pod...") and a **Pod information** panel that already tells the story: status **Running**, but **number of restarts: 15** - it keeps dying and coming back.

![Pod detail - 15 restarts and the Assistant health-check banner](/img/lab3/3.4-pod-detail.png)

The **Containers** table shows why: memory is blowing past what it asked for - **MEM MAX 99.54 MiB, ~181%** of its request (deep red).

![Containers table - memory at 181% of request](/img/lab3/3.4-container-mem.png)

The **Container optimization -> Container memory** graph is the smoking gun: usage climbs to the **100 MiB limit** (dashed line) and stays pinned there, with periodic sharp drops - each drop is the kernel OOMKilling the container, which then restarts and starts filling memory again. Memory that only ever rises until it hits the limit is a memory leak. (The explicit `OOMKilled` termination reason is on the pod's **Events** tab.)

![Container memory climbing into the 100 MiB limit, with the OOMKill sawtooth](/img/lab3/3.4-oomkilled.png)

**How to find it:**

1. Open the `productcatalogservice` pod (from the KPI drawer's **Kubernetes** section, or **Open in Kubernetes**).
2. In **Pod information**, read **number of restarts** (15 here) - the crash loop.
3. In the **Containers** table, note **MEM MAX** is ~181% of the request.
4. In **Container optimization**, read the **Container memory** graph - usage rising into the 100 MiB limit with repeated drops. (The **Events** tab shows the `OOMKilled` reason.)

</details>

---

## Question 4: Where is the fleet wasting resources?

**Open the Efficiency tab. Which namespace is the biggest offender, and what config gaps does it surface?**

The **Efficiency** tab is a fleet-wide cost/right-sizing lens. It doesn't hand you a per-container recommendation - instead it surfaces **waste and configuration gaps** across every workload, so you can find over-provisioned or mis-configured containers to trim.

<TryIt where="Observability → Kubernetes → the Efficiency tab. Read the stat tiles and the waste-by-namespace charts; scroll for the per-gap tables." />

:::tip Jump straight there

<EnvLink path="/a/grafana-k8s-app/home/efficiency" from="12:00" to="13:00" params="refresh=1m&var-kubeLabels=&var-cluster=$__all&var-namespace=$__all">Open the Kubernetes Efficiency tab</EnvLink> - opens the fleet Efficiency view with the incident window (previous day, UTC) applied. Needs your environment ID from the Welcome page.

:::

<details className="answer-reveal">
<summary>Show answer</summary>

The stat tiles count fleet-wide config gaps - here **44** containers with **no resource requests**, **155** with **no limits**, **62** **CPU over-requested**, and **89** **memory over-requested**. Below them, **CPU waste by namespace** and **Memory waste by namespace** both put **`ecommerce-prod` at the top** (~1.33 wasted CPU cores, ~1.55 wasted memory GiB), and the tables list the specific offending containers (without requests, without limits, over-requested).

![Efficiency tab - waste by namespace and config-gap tiles](/img/lab3/3.12-efficiency.png)

:::note This tab won't fix *this* leak - and that's the point
Efficiency is about **over-provisioning and waste**. `productcatalogservice` is the *opposite* problem: it isn't wasting memory, it's pinned at its limit (you saw its usage climb into the 100 MiB limit in Question 3, with a request of only 55 MiB). Closing that request-vs-limit gap is good hygiene, but **raising the limit only delays the OOMKill - it doesn't stop the leak**. Right-sizing is an operational mitigation; the actual root cause is a change someone made, which the RCA Workbench pins down next.
:::

**How to find it:**

1. Open **Observability** -> **Kubernetes** in the left menu.

   <img src={require('@site/static/img/lab3/3.12-k8s-nav.png').default} alt="The left menu - Observability, Kubernetes" width="280" />

   You land on **Kubernetes Overview** - note the **Stability** tiles already flag this lab's incident (Restarting containers, OOMKilled containers).

   ![Kubernetes Overview - the Stability tiles flag the restarts and OOMKill](/img/lab3/3.12-k8s-overview.png)

2. Open the **Efficiency** tab.

   ![The Efficiency tab on Kubernetes Overview](/img/lab3/3.12-efficiency-tab.png)

3. Read the stat tiles (no requests / no limits / CPU & memory over-requested).
4. Read **CPU/Memory waste by namespace** - note `ecommerce-prod` at the top.
5. Set the **namespace** filter to `ecommerce-prod` to scope the whole tab to the offender - the stat tiles recount for just that namespace.

   ![The namespace filter scoped to ecommerce-prod](/img/lab3/3.12-namespace-filter.png)

6. Scroll to the per-gap tables (**CPU over-requested containers**, **Memory over-requested containers**, and the no-requests/no-limits lists) for the specific containers to fix.

   ![The per-gap tables - the specific over-requested containers](/img/lab3/3.12-gap-tables.png)

</details>

---

## Question 5: The Assistant health check <Badge variant="optional">Optional</Badge>

**Walk from the workload down to the container. At each level, does the Assistant's health check agree with what you found?**

Every Kubernetes Monitoring detail page carries a Grafana Assistant **health check** - a Healthy/Unhealthy verdict with a one-line explanation, backed by queries it runs in the background. Drill from the workload down to its pod and container and you'll see it call the OOM at each level.

<TryIt where="Observability → Kubernetes → Workloads; open productcatalogservice, then drill down to its pod and its container, reading the Assistant health check on each page." />

<details className="answer-reveal">
<summary>Show answer</summary>

**1. Sidebar -> Workloads.** Expand **Observability -> Kubernetes** in the left menu and choose **Workloads**.

<img src={require('@site/static/img/lab3/3.13-nav-workloads.png').default} alt="Kubernetes -> Workloads in the sidebar" width="312" />

**2. Find the workload.** In the Workloads list, `productcatalogservice` (a `deployment` in `ecommerce-prod`) stands out with red CPU/memory usage. Open it.

![Workloads list - productcatalogservice in the red](/img/lab3/3.13-workload-list.png)

**3. Read the workload health check.** At the top of the deployment page, the **Assistant health check** reports **Unhealthy** - *"Pod 0/1 ready; OOMKilled container detected in productcatalogservice-bb8bf6869-8mq2s."* That matches the OOM you already found.

![Workload Assistant health check - Unhealthy, OOMKilled](/img/lab3/3.13-workload-health.png)

For a fuller analysis, open **Insights** (it lists the latency/error breaches and anomalies the graph is firing) and click **Analyze** to hand the entity to the Assistant.

![Insights and the Analyze button on the workload](/img/lab3/3.13-workload-analyze.png)

**4. Drill to the pod.** Scroll down to the **Pods** table and click the `productcatalogservice-*` pod.

![Pods table - open the crash-looping pod](/img/lab3/3.13-pods-table.png)

**5. Drill to the container.** On the pod page, scroll to the **Containers** table (MEM MAX ~181%) and click the container.

![Containers table - open the container](/img/lab3/3.13-containers-table.png)

**6. Read the container health check.** The container page's Assistant health check reports **Unhealthy** - *"Container has 15 restarts; pods experiencing wait conditions or status issues."* Same verdict, one level deeper.

![Container Assistant health check - Unhealthy, 15 restarts](/img/lab3/3.13-container-health.png)

The Assistant's verdict agrees at every level with the graphs you read - the OOMKill and the crash-loop. (If it ever disagreed with the graphs, trust the graphs.) Each page also carries **Knowledge Graph annotations** and a ring icon that opens the entity in the **RCA Workbench** - which is where you're headed next.

</details>

---

## RCA Workbench

You've confirmed the failure mode is a memory leak. The [RCA Workbench](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench/) streams every insight for your entities onto one timeline - sorted by time and severity - so you can see the sequence of what fired and correlate the cascade back to a source.

Open **Observability** -> **RCA workbench**. Add `productcatalogservice` and `frontend`, then click **Causes** - it automatically pulls in related upstream entities that could be the root cause (the pods, the node, and connected services). Set the time range to start a little before the errors began.

![RCA Workbench timeline](/img/lab3/3.5-rca-workbench.png)

## Question 6: Read the timeline - where does it point?

**Read the Timeline in time order. Which categories of insight are firing, and which entity do they cluster on?**

The summary bar at the top breaks the insights into categories - **Saturation, Amend, Anomaly, Failure, Error** - with a count for each. Read those first, then the per-entity rows.

<TryIt where="the Timeline tab; read the category counts in the summary bar, then the per-entity insight rows in time order." />

<details className="answer-reveal">
<summary>Show answer</summary>

The timeline here is made up of **Error** and **Anomaly** insights (roughly `error 18` / `anomaly 11` across these entities), and they cluster on **`productcatalogservice`** and the services that call it. Read top-to-bottom in time order and productcatalogservice leads, with its callers' (`frontend`, `checkoutservice`, `recommendationservice`) error and anomaly insights following - the workbench correlates the whole cascade back to `productcatalogservice` as the origin.

![RCA Workbench timeline - Error and Anomaly insights clustering on productcatalogservice](/img/lab3/3.6-first-event.png)

:::note Where's the "feature flag changed" event?
The trigger for this incident is a feature-flag flip, and in some Grafana Cloud setups that surfaces on the timeline as a blue **Amend** (change) insight on `flagd` - the literal "what changed first." In this workshop stack that change-detection insight isn't wired up, so the summary bar reads **Amend 0** (and **Saturation 0 / Failure 0**) - the timeline carries only the **Error** and **Anomaly** symptoms. Don't hunt for an Amend that isn't there: you already know the trigger from the scenario, and you confirmed the mechanism (memory into the limit -> OOMKill -> crash loop) in Kubernetes Monitoring back in Question 3. The workbench's value here is correlating the symptom cascade, by time and dependency, to the source entity.
:::

**How to find it:**

1. In the **RCA workbench**, open the **Timeline** tab.
2. Read the summary bar's category counts (Saturation / Amend / Anomaly / Failure / Error).
3. Read the per-entity rows in time order - the earliest, most-severe insights are on `productcatalogservice`; its callers' errors follow.

> **Why this matters:** correlating symptoms by time and dependency points you at the source even when the raw trigger isn't itself an insight.

</details>

---

## Question 7: Confirm it in the logs

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

## Question 8: See the impact on traces <Badge variant="optional">Optional</Badge>

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

---

## Verify the Assistant

You reconstructed the incident by hand. Now have the [Grafana Assistant](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/workbench-ai/) do it from the same graph, and check that its story matches yours.

Inside the RCA Workbench, the Assistant runs in **Knowledge Graph mode**: it reasons over the entities, relationships, and insight timeline you're looking at. Click **Analyze RCA Workbench** (or open the Assistant and reference entities with `@`).

:::note

LLM output varies between runs. Judge the Assistant on whether it names the same root cause and the same order of events you found on the timeline.

:::

## Question 9: What does the Assistant conclude?

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

## Question 10: Verify against the timeline

**Does the Assistant's story match the graph - the source entity, the order of events, and the propagation path?**

<TryIt where="the Assistant's summary, side by side with the Timeline and Entity Graph you already have open." />

<details className="answer-reveal">
<summary>Show answer</summary>

Check each claim against what you established:

- **Source entity** = `productcatalogservice` - matches the entity the timeline's insights cluster on (Question 6) and whose Kubernetes state is unhealthy (Question 1).
- **Mechanism** = memory into the limit -> OOMKilled -> crash loop - matches Kubernetes Monitoring (Question 3) and the logs (Question 7).
- **Propagation** = `frontend`/`checkoutservice`/`recommendationservice` error because they call `productcatalogservice` - matches the Entity Graph edges (Question 2) and the Error insights on the timeline.
- **Trigger / root cause** - if the Assistant names the feature-flag change as the trigger, note that *this timeline doesn't carry that as an insight* (**Amend 0**, Question 6). It fits the scenario and the OOM mechanism you confirmed, but you can't verify it on the graph here - so treat it as a lead to check (the flag history), not a fact to take on faith.

The knowledge graph gives the Assistant the same typed map of entities and relationships you just verified, which is why the source, mechanism, and propagation line up. A claim you *can't* tie to a signal on the timeline is exactly the kind to verify rather than trust.

**How to find it:**

1. Compare the Assistant's narrative point-by-point with the **Timeline** and **Entity Graph**.
2. Confirm the source entity, mechanism, and propagation path agree - and flag any claim (like a specific trigger) that isn't backed by an insight on the timeline.

</details>

---

## Wrap-up

You identified the source entity via its own vs propagated insights (Entity Catalog), saw the blast radius from failing service to frontend (Entity Graph), confirmed the OOMKill and right-sizing fix (Kubernetes Monitoring), found the feature-flag change that started it all (RCA Workbench), confirmed the crash in logs and its impact in traces (Drilldown), and verified the Assistant's analysis against the same timeline.

In Lab 4, you'll take these tools to a different application - the banking app.
