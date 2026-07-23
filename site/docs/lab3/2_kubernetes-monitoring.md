---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.2. Characterise the failure in Kubernetes Monitoring

*The graph told you `productcatalogservice` is crash-looping. **[Kubernetes Monitoring](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/kubernetes-monitoring/)** is where you get the deep infrastructure picture - exactly why it's dying, and what to do about it.*

Open **Infrastructure → Kubernetes**. This view mirrors the Kubernetes hierarchy - **Clusters → Namespaces → Workloads → Nodes → Pods → Containers** - with an **Overview** carrying **Alerts**, **Efficiency**, and **Cost** tabs, and a dedicated **Health** page summarising active issues.

![Kubernetes Monitoring overview](/img/lab3/3.10-k8s-crashloop.png)

---

## Question 1: Why is the pod dying?

**Open the crash-looping container. What is the termination reason, and what is its memory doing?**

Start from the **Overview → Alerts** tab and filter for **`KubePodCrashLooping`** (or use the **Health** page's **Stability** section, which lists OOMKilled and restarting containers across the fleet). Open the container's detail page and set the time range to the last 12 hours.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

In the container's **Container Optimization** section:

- the **Container restarts** graph shows repeated restarts with a **last terminated reason of `OOMKilled`**, and
- the **Container Memory** graph shows memory **climbing steadily until it hits the limit** (`100Mi` here), at which point the kernel kills the container - over and over.

That's the unmistakable signature of a **memory leak**: consumption only ever rises, never plateaus, until it reaches the limit and is OOMKilled.

**How to find it:**

1. **Infrastructure → Kubernetes → Overview → Alerts** → filter **`KubePodCrashLooping`** for `productcatalogservice`. (Or **Health → Stability**.)
2. Click the container to open its detail page; set the range to 12h.
3. In **Container Optimization**, read the **Container restarts** (reason **OOMKilled**) and **Container Memory** (usage rising into the limit) graphs.

![OOMKilled + memory into the limit](/img/lab3/3.4-oomkilled.png)

> **The value:** Kubernetes Monitoring turns "the pod keeps restarting" into a precise failure mode - *OOMKilled because memory grows into its memory limit* - with the graph that proves it.

</details>

---

## Question 2: What's the remediation?

**Open the Efficiency tab. What does it say about this workload's resource sizing?**

Knowing the failure mode is half the job; the other half is the fix. The **Efficiency** tab flags resource-config gaps - missing requests/limits, over- and under-provisioning - and gives right-sizing recommendations.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Efficiency surfaces `productcatalogservice`'s memory sizing and recommends appropriate **memory requests/limits** (the guidance is to set memory requests and limits equal, so the scheduler reserves what the container is allowed to use).

The honest engineering takeaway: raising the limit only buys headroom - it doesn't stop a leak, it just delays the OOMKill. The real fix is the leaking code (which the RCA Workbench, next, will trace back to its trigger). Right-sizing is the operational mitigation; the timeline gives you the root cause.

**How to find it:**

1. **Overview → Efficiency** tab.
2. Find `productcatalogservice` in the over-requested / no-limits lists (filter by namespace `ecommerce-prod`).
3. Read the memory requests/limits recommendation and the wasted-vs-used figures.

![Efficiency / right-sizing recommendation](/img/lab3/3.12-efficiency.png)

> **The value:** the same tool that diagnoses the OOM also quantifies the fix - and, via the **Cost** tab, what that sizing is worth. Diagnosis and remediation in one place.

</details>

---

## Question 3: Let the health check explain it <Badge variant="optional">Optional</Badge>

**Use the Assistant health-check banner on the container page. Does its plain-language summary match what you found?**

Every Kubernetes Monitoring detail page carries a **Grafana Assistant health-check banner** - a Healthy/Unhealthy verdict with a one-line explanation, backed by queries it runs for you. It's a fast plain-language triage.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The banner should report the container **Unhealthy** and summarise the OOMKill / crash-loop in a sentence. Clicking **Investigate** opens the Assistant with the detail and next steps. It should agree with the graphs you just read - and if it doesn't, that's your cue to trust the graphs.

As a recent-feature aside, the detail page also shows **Knowledge Graph annotations** and a ring-icon that opens this entity in the **RCA Workbench** - the same workbench you'll use next, reached directly from the infrastructure view.

**How to find it:**

1. On the container detail page, read the **Assistant health-check banner** at the top.
2. Click **Investigate** to open the Assistant.
3. Note the **Knowledge Graph** annotation / RCA Workbench ring-icon linking back to the graph.

![Assistant health-check banner](/img/lab3/3.13-k8s-assistant.png)

> **The value:** plain-language triage for anyone who doesn't live in PromQL, and a one-click bridge from the deep infra view back into the cross-stack graph.

</details>
