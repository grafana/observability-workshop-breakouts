---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 3.1. Find the unhealthy entity and its blast radius

*Errors are everywhere and several services look bad at once. Start with the map, not a single dashboard.*

Open **Observability → Entity catalog**. This is the inventory of every entity the Knowledge Graph has discovered - services, pods, nodes, namespaces, databases - each showing its health through **insight rings** and type-appropriate KPIs. Set the time range to cover when the errors began.

![Entity Catalog](/img/lab3/3.1-entity-catalog.png)

---

## Question 1: Which entity is the source of the trouble?

**Filter the catalog to the ecommerce namespace. Which entity has the worst health, and what kind of insight is firing on it?**

Every entity shows two **insight rings**: the **outer** ring is its *own* insights, the **inner** ring is insights **propagated up from things it depends on**. Colours are **red** (critical), **yellow** (warning), **blue** (info). The entity with critical insights *of its own* is where to look.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

Filtering to the `ecommerce-prod` namespace, **`productcatalogservice`** stands out with **critical (red) insights of its own** - a **Failure** insight (the pod is crash-looping) and a **Saturation** insight (memory climbing toward its limit). Its pods show a rising **memory** sparkline and an increasing **restart count**.

Other services (like `frontend`) light up too - but largely on their **inner** ring, meaning the trouble is *propagating* to them from something they depend on. That distinction points you at `productcatalogservice` as the source rather than a victim.

**How to find it:**

1. **Observability → Entity catalog**.
2. Filter **Type = Pod** (or Service) and **namespace = `ecommerce-prod`**.
3. Sort/scan by insights; open `productcatalogservice`.
4. Read its insight categories (Failure, Saturation) and the memory / restart KPIs.

![productcatalogservice unhealthy in the catalog](/img/lab3/3.2-unhealthy-entity.png)

> **The value:** the catalog ranks your whole estate by health in one view, and the two-ring model separates *cause* (own insights) from *effect* (propagated insights) - so you don't chase the service that's merely downstream of the problem.

</details>

---

## Question 2: How far does the damage spread?

**Open the Entity Graph for `productcatalogservice`. What depends on it, and what does it run on?**

The **Entity Graph** draws the dependency topology - `CALLS`, `HOSTS`, and other relationships as edges. It's how you see blast radius: who is affected upstream, and what infrastructure sits underneath.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The graph shows **`frontend` calls `productcatalogservice`** (so the crash-looping service is exactly why the frontend is throwing 500s), and that `productcatalogservice` is **hosted on a pod/node** that's showing the crash-loop. The propagation path from a failing backend pod up to the customer-facing frontend is laid out visually.

**How to find it:**

1. **Observability → Entity graph** (or "Show connected entities" from the catalog entry).
2. Search `Show Service productcatalogservice`.
3. Follow the `CALLS` edge upstream to `frontend` and the `HOSTS` edge down to its pod/node.
4. Note the health rings on each connected entity.

![Entity Graph blast radius](/img/lab3/3.3-entity-graph.png)

> **The value:** the graph answers "what else is affected?" instantly. You can see the whole chain - failing pod → service → frontend → user - without knowing the architecture in advance.

</details>

---

## Question 3: What kind of failure is this? <Badge variant="optional">Optional</Badge>

**From the entity's Kubernetes detail, what is happening to its memory and why is it restarting?**

The same entity carries its infrastructure metrics. For a crash-looping pod, the memory-vs-limit trend and the restart reason tell you the failure mode.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The entity's **Kubernetes** detail shows memory **climbing steadily into the configured limit**, then the container being **OOMKilled** and restarting - over and over. It's a **memory leak**: the service consumes more and more memory until the kernel kills it, and Kubernetes restarts it into the same fate (`KubePodCrashLooping`).

**How to find it:**

1. Open `productcatalogservice` and select its **Kubernetes** detail/tab (or open it in **Kubernetes Monitoring**).
2. Read the **container memory vs limit** graph.
3. Check the **restarts / termination reason** - **OOMKilled**.

![Memory climbing into the limit, OOMKilled](/img/lab3/3.4-oomkilled.png)

> **The value:** the graph unifies application health and Kubernetes infrastructure on the same entity, so "the service is erroring" and "the pod is OOMKilling" are one story, not two tools.

</details>
