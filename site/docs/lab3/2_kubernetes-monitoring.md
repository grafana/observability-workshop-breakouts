---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.2. Inside the crash loop

*The graph told you `productcatalogservice` is crash-looping. [Kubernetes Monitoring](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/kubernetes-monitoring/) shows exactly why it's dying and what to do about it.*

Open **Infrastructure** -> **Kubernetes**. The app mirrors the Kubernetes hierarchy - **Clusters -> Namespaces -> Workloads -> Nodes -> Pods -> Containers** - with an **Overview** carrying **Alerts**, **Efficiency**, and **Cost** tabs, and a **Health** page summarizing active issues across the fleet.

![Kubernetes Monitoring overview](/img/lab3/3.10-k8s-crashloop.png)

---

## Question 1: Why is the pod dying?

**Open the crash-looping container. What is the termination reason, and what is its memory doing?**

<TryIt where="Overview → Alerts, filtered to KubePodCrashLooping (or Health → Stability, which lists OOMKilled and restarting containers). Then open the container's detail page, set the time range to the last 12 hours, and find its Container Optimization section." />

<details className="answer-reveal">
<summary>Show answer</summary>

In the container's **Container Optimization** section:

- the **Container restarts** graph shows repeated restarts with a last terminated reason of **`OOMKilled`**, and
- the **Container Memory** graph shows memory climbing steadily until it hits the limit (`100Mi` here), at which point the kernel kills the container - over and over.

Memory that only ever rises until it hits the limit is a memory leak.

**How to find it:**

1. **Infrastructure** -> **Kubernetes** -> **Overview** -> **Alerts** -> filter **`KubePodCrashLooping`** for `productcatalogservice`. (Or **Health** -> **Stability**.)
2. Click the container to open its detail page; set the range to 12h.
3. In **Container Optimization**, read the **Container restarts** (reason **OOMKilled**) and **Container Memory** (usage rising into the limit) graphs.

![OOMKilled + memory into the limit](/img/lab3/3.4-oomkilled.png)

</details>

---

## Question 2: What's the remediation?

**Open the Efficiency tab. What does it say about this workload's resource sizing?**

The **Efficiency** tab flags resource-config gaps - missing requests/limits, over- and under-provisioning - and gives right-sizing recommendations.

<TryIt where="Overview → Efficiency, filtered to namespace ecommerce-prod." />

<details className="answer-reveal">
<summary>Show answer</summary>

Efficiency surfaces `productcatalogservice`'s memory sizing and recommends appropriate memory requests/limits (the guidance is to set memory requests and limits equal, so the scheduler reserves what the container is allowed to use).

Note that raising the limit only buys headroom - it doesn't stop a leak, it delays the OOMKill. Right-sizing is the operational mitigation; the actual root cause is coming up in the RCA Workbench.

**How to find it:**

1. Open **Overview** -> **Efficiency**.
2. Find `productcatalogservice` (filter by namespace `ecommerce-prod`).
3. Read the memory requests/limits recommendation and the wasted-vs-used figures.

![Efficiency / right-sizing recommendation](/img/lab3/3.12-efficiency.png)

</details>

---

## Question 3: The Assistant health check <Badge variant="optional">Optional</Badge>

**Read the Assistant health-check banner on the container page. Does its summary match what you found?**

Every Kubernetes Monitoring detail page carries a Grafana Assistant health-check banner - a Healthy/Unhealthy verdict with a one-line explanation, backed by queries it runs in the background.

<TryIt where="the banner at the top of the container detail page." />

<details className="answer-reveal">
<summary>Show answer</summary>

The banner should report the container **Unhealthy** and summarize the OOMKill / crash-loop. Clicking **Investigate** opens the Assistant with detail and next steps. It should agree with the graphs you just read - and if it doesn't, trust the graphs.

The detail page also shows **Knowledge Graph annotations** and a ring icon that opens this entity in the **RCA Workbench** - which is where you're headed next.

**How to find it:**

1. On the container detail page, read the **Assistant health-check banner** at the top.
2. Click **Investigate** to open the Assistant.
3. Note the Knowledge Graph annotation / RCA Workbench ring icon.

![Assistant health-check banner](/img/lab3/3.13-k8s-assistant.png)

</details>
