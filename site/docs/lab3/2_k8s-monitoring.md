---
sidebar_position: 2
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.2. Query Kubernetes Monitoring data

*In Lab 1.3 you clicked through Workloads, into a pod, into Containers, into the right-sizing gauge. Now ask Assistant for the same answers in plain English and see how the routing changes.*

Open a **new conversation** with Assistant for this section so it starts with a clean slate.

---

## Question 1: Container health

**What's the health of my containers?**

A great opening prompt because it's the kind of question that takes a *human* a few minutes to answer manually - you'd scan the cluster, look for restart counts, check pod events, eyeball errors. Assistant should give you the same summary in one shot, naming the same usual suspects we found in Lab 1.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

Assistant highlights containers with repetitive restarts, bad k8s events, and errors - `productcatalogservice`, `recommendationservice`, and `checkoutservice` show concerning health.

![Container health response](/img/lab3/2.1-grafana-assistant-1.png)

</details>

---

## Question 2: Image and version

**What image and version is being used for the `productcatalogservice`?**

Same image-spec lookup as Lab 1.3 - except instead of finding the Containers panel and reading the IMAGE SPEC column, you just ask. Faster, but still verify by expanding the tool call.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

`productcatalogservice:v3.24.5`

![Prompt](/img/lab3/2.2-grafana-assistant-1.png)
![Answer](/img/lab3/2.2-grafana-assistant-2.png)

</details>

---

## Question 3: Right-sizing

**Is the `productcatalogservice` right-sized?**

This was the multi-step deep-dive in Lab 1.3 - click into the container, read the gauge, compare to the recommendation. Assistant pulls the same [right-sizing data](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/kubernetes-monitoring/optimize-resource-usage/) and delivers the verdict in one prompt. It isn't a new data source - it's a faster route into the same Grafana data you'd otherwise navigate to manually, and trust comes from being able to verify that.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

No - Assistant reports the service as oversized on memory (assigned ~100 MiB but using far less), the same verdict you reached manually in Lab 1.3.

![Right-sizing response](/img/lab3/2.3-grafana-assistant-1.png)

</details>

---

## Question 4: Deployment namespace <Badge variant="optional">Optional</Badge>

**What namespace is my app deployed in?**

A single-prompt question that would otherwise take a few clicks through the cluster view. The kind of detail it's annoying to remember where to find.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

Your main application is deployed in the **`ecommerce-prod`** namespace.

![Namespace response](/img/lab3/2.4-grafana-assistant-1.png)

</details>

---

## Question 5: Cluster resources <Badge variant="optional">Optional</Badge>

**What resources does my k8s cluster have?**

Same physical-capacity question from the **Clusters** view in Lab 1.3 - now Assistant produces a full cluster summary including node count, CPU, memory, storage, and pod capacity. The kind of overview you'd otherwise piece together from a few panels.

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

```
Cluster WORKSHOP-ID-cluster resource summary (last 1h snapshot):

Nodes: 4
Namespaces: 4
Pods running: 89 (allocatable capacity: 440 pods total, 110 per node)
CPU: 8 cores total capacity, 7.72 cores allocatable
Memory: 32.6 GB total capacity, 29.7 GB allocatable
Ephemeral storage: 85.6 GB total capacity, 72.7 GB allocatable

Allocatable is slightly lower than capacity because Kubernetes reserves some
CPU/memory/storage for system and kubelet overhead on each node.
```

![Prompt](/img/lab3/2.5-grafana-assistant-1.png)

</details>

---

## Question 6: Assistant rule <Badge variant="optional">Optional</Badge>

**Create a rule scoping Assistant to the `ecommerce-prod` namespace**

The more you use Assistant, the more you'll want it scoped to *your* corner of the world. Rules let you set persistent context - "I'm only ever interested in this namespace" - so it stops searching the whole cluster every time.

Try creating a rule that scopes Assistant to applications and infrastructure in the `ecommerce-prod` namespace. Then open a new conversation and ask "Tell me about what's deployed".

<TryIt>Ask Grafana Assistant before revealing the answer.</TryIt>

<details className="answer-reveal">
<summary>Show answer</summary>

If this works, asking the follow-up question and expanding any tool call should show the filter `namespace=ecommerce-prod`.

Opening the rules page:

![Rules page](/img/lab3/2.6-grafana-assistant-1.png)

Click **Create rule**:

![Create rule](/img/lab3/2.6-grafana-assistant-2.png)

Adding the custom rule:

![Adding custom rule](/img/lab3/2.6-grafana-assistant-3.png)

The rule in action:

![Rule in action](/img/lab3/2.6-grafana-assistant-4.png)

</details>
