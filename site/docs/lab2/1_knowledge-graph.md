---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';

# 2.1. Using Knowledge Graph

*In Lab 1 we walked the trail manually - Frontend O11y → App O11y → Kubernetes Monitoring - hopping between apps to follow the breadcrumbs. It worked, but it was a lot of clicks. Now let's see what the same investigation looks like when the relationships between everything are already mapped for us.*

Grafana Cloud [Knowledge Graph](https://grafana.com/docs/grafana-cloud/knowledge-graph/) automatically discovers your services, infrastructure, and the relationships between them from telemetry you're already sending. It connects metrics, logs, and traces into one workflow so you can troubleshoot without writing complex queries.

You'll use two surfaces in this lab:

- **[Entity Explorer](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/)** - filter and explore entities (services, pods, namespaces) to identify what needs attention.
- **[RCA Workbench](https://grafana.com/docs/grafana-cloud/knowledge-graph/troubleshoot-infra-apps/)** - stream insights into a timeline so you can investigate potential causes correlated over time and dependency.

---

## Question 1: Worst service

**Over the last 24 hours, which service looks to be in the worst state? Why?**

This is the question Lab 1 made us answer the long way: page-by-page errors → service error rate → restarts. With Knowledge Graph it's the *first thing on the screen*. The list of services on the left of Entity Explorer is sorted by **insights** - the count of anomalies, errors, and failures firing for each entity. The worst-off service floats to the top.

> **Why this matters:** "Sort by insights" replaces the entire triage motion from Lab 1 - errors are pre-correlated to entities, so you don't have to chase them across three different apps.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The **`frontend`** service - it has more insights firing than any other service. The frontend is an API gateway, so all service traffic flows through it and errors propagate upward, triggering insights.

Insights observed:

- **Errors / Anomalies:**
  - `INBOUND:LatencyAverageAnomaly`
  - `INBOUND:span_errors::ErrorRatioBreach`
  - `OUTBOUND:LatencyAverageAnomaly`
  - `OUTBOUND:span_errors::ErrorRatioBreach`

**How to find it:**

1. Open Entity Explorer. The list of services on the left is ordered by **insights** - this surfaces the entity in the worst state.

   ![All entities sorted by insights](/img/lab2/1.1-knowledge-graph-1.png)

2. Hover an entity to see its insights.

   ![Entity insights popover](/img/lab2/1.1-knowledge-graph-2.png)

</details>

---

## Question 2: Connected services

**How many application services are connected to the `productcatalogservice` within the last 24 hours?**

Remember in Lab 1.2 you clicked into `productcatalogservice`, then into the Inbound and Outbound panels separately? Knowledge Graph builds the whole dependency map for you from telemetry, so you can answer "what services talk to this one" in one view. Graph or search - either works.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**7 services.** The Alloy receiver doesn't count - it isn't part of the application.

### Option 1 - Via the Entity Explorer graph

1. Open Entity Explorer, find `productcatalogservice`, click it, and expand **Connected Entities**.

   ![Connected entities](/img/lab2/1.2-knowledge-graph-1.png)

2. Click **Services**.
3. Count the services that show as connected.

   ![Connected services](/img/lab2/1.2-knowledge-graph-2.png)

### Option 2 - Via the search bar

1. In Entity Explorer, type `productcatalogservice connected services` in the search bar.
2. Click `productcatalogservice` in the graph results - it gets a blue ring.
3. Count the connected entities that have colored rings.

   ![Search-based view](/img/lab2/1.2-knowledge-graph-3.png)

</details>

---

## Question 3: Cart pods

**How many pods does the cart service have?**

Connected Entities works across types, not just services. So "how many pods belong to this service?" is the same operation as "how many services are connected" - just a different entity dimension. Same UI, different question.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**1.**

### Option 1

1. Start in Entity Explorer. If nothing is showing, click **Show All Services** or type it in the search bar.

   ![Show all services](/img/lab2/1.3-knowledge-graph-1.png)

2. This shows _all_ discovered services. The colored rings may differ from the example image.

   ![All entities](/img/lab2/1.3-knowledge-graph-2.png)

3. Click the filter button (top right) and type `cart`.

   ![Filtered for cart](/img/lab2/1.3-knowledge-graph-3.png)

4. Click `cartservice` and expand **Connected Entities**. Pod count is shown next to **Pod**.

   ![Cart connected entities](/img/lab2/1.3-knowledge-graph-4.png)

### Option 2

1. In Entity Explorer, type `Show Service cartservice` in the search bar and select the suggestion.

   ![Search suggestion](/img/lab2/1.3-knowledge-graph-5.png)

2. Click `cartservice` and expand **Connected Entities** to see the pod count.

   ![Cart connected entities](/img/lab2/1.3-knowledge-graph-6.png)

</details>

---

## Question 4: Deployment namespace

**Which namespace is everything deployed in?**

Namespaces are first-class entities in Knowledge Graph too. That means you can ask "show me all the namespaces" directly in the search bar - no clicking into individual services and reading their labels.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**`ecommerce-prod`**

### Option 1

Go to Entity Explorer, look at all services, and hover over each to read the namespace - slow.

### Option 2

In the Entity Explorer search bar, type `Show all Namespaces`. Two come back - `kube-system` and `ecommerce-prod`. Our app is in `ecommerce-prod`.

</details>

---

## Question 5: First event

**What looks to be the first event that caused the issue within the last 24 hours?**

Now we get to the payoff. We *know* productcatalog is broken - we proved that the hard way in Lab 1. But what *caused* it to break? In Lab 1 we never actually answered that. The RCA Workbench is built for exactly this: pull a service in, ask Knowledge Graph to add potential causes, sort by time, read down the list. The first event at the top is the earliest insight that fired - the original sin.

> **Why this matters:** This is the question Lab 1's tools genuinely couldn't answer. The classic apps showed you *what* was broken; RCA Workbench tells you *what changed* and started it.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

A feature flag was enabled called **`productCatalogStopClosingPostgresConnections`**.

This is a custom insight, based on a recording rule that watches the logs from the `flagd` service. When the rule has a value greater than 0 (i.e. a feature flag state changed), the insight fires.

**How to find it:**

1. Open Entity Explorer and find `productcatalogservice` - either click through or type `productcatalogservice` and select **Show Service productcatalogservice**.

There are two ways to add an entity to the RCA Workbench:

**Via the entity graph:**

1. Click `productcatalogservice`.
2. Click the **Troubleshoot in Workbench** button.

**Via the results table:**

1. Hover `productcatalogservice` in the results table.
2. Click **Add to Workbench for inspecting**.

   ![Add to workbench](/img/lab2/1.5-knowledge-graph-1.png)

3. Click **Open in Workbench**.

Now the productcatalogservice is in RCA Workbench - let's investigate.

1. Click the second icon on the left, **Add potential causes**.

   ![Add potential causes](/img/lab2/1.5-knowledge-graph-2.png)

2. Sort by **Time**.

   ![Sort by time](/img/lab2/1.5-knowledge-graph-3.png)

3. `flagd` is now at the top - its insight fired first. Occasionally `frontend` will fire an anomaly insight first; this is because the feature flag insight may take a minute or two to fire depending on environment factors.
4. Click `flagd`, then click the **amend** category. The amend insight is `FeatureFlagStateChange`.

   ![FeatureFlagStateChange](/img/lab2/1.5-knowledge-graph-4.png)

5. To dig in: click `FeatureFlagStateChange` and hover the series in the metrics graph.

   ![Feature flag detail](/img/lab2/1.5-knowledge-graph-5.png)

The `productCatalogStopClosingPostgresConnections` feature flag was turned on (and later turned off).

### Custom dashboards

A custom dashboard has been added to the KPI drawer for the `flagd` service. Click the **KPI** icon on the far right next to `flagd`.

![KPI icon](/img/lab2/1.5-knowledge-graph-6.png)

It shows a custom dashboard listing all feature flags and their current state.

![Custom dashboard](/img/lab2/1.5-knowledge-graph-7.png)

To configure your own: side bar → **Configuration** → **KPI display options**.

![KPI display options](/img/lab2/1.5-knowledge-graph-8.png)

This lets you attach any dashboard to any service or type of service - without leaving the context of the root cause investigation.

**Optional - see how the custom insight was created.** Replace `{STACK_URL}` with the URL of the lab environment.

- Recording Rule: `{STACK_URL}/alerting/list?search=flag_state:change`
- Custom Insight: `{STACK_URL}/a/grafana-knowledge-graph-app/rules/add/file` - then click the edit icon next to `fieldengotelenv.yml`.

</details>

---

## Question 6: First to error

**Which service started having errors first within the last 24 hours?**

We know the trigger was a feature flag. But what was the *first* service to actually go red as a result? That's a different question - and the **Summary** tab is built to answer it. It's a flat, time-ordered list of every insight, much easier to read than the timeline when you just want to know who broke first.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**`productcatalogservice`** - though in some views you may see `productcatalog-postgres` was impacted first. The order between these two is fickle because they error at similar times, depending on when the metric is scraped. Occasionally `frontend` fires an anomaly insight first because the feature flag insight may take a minute or two to fire.

**How to find it:**

1. Continue from the previous question - you should be in RCA Workbench with potential causes added.
2. Sort by **Time** (as before).
3. Click the **Summary** tab - it's much easier to read.

   ![Summary tab](/img/lab2/1.6-knowledge-graph.png)

4. The exact order may vary, but the insights you'll see include:
   - `productcatalog-postgres` throws `PostgresSQLHighConnections` failure insights plus a few anomaly insights.
   - `productcatalogservice` throws `ErrorRatioBreach` error insights on its `oteldemo.ProductCatalogService/ListProducts` endpoint, and `KubePodCrashLooping` failure insights.
   - `frontend` shows anomalies and `ErrorRatioBreach` insights, since all requests flow through it. The frontend also complains that the recommendation service is having issues - to surface that, go back to **Timeline** (Summary is read only) and click **Add potential causes** on the frontend service.

</details>

---

## Question 7: Redis version

**Which version of Redis is deployed?**

Once the dust settles, you'll want to capture details for the post-mortem. Every entity in Knowledge Graph carries a properties bag - version, image, labels - which you can read directly without leaving the catalog.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**8.2.1**

**How to find it:**

- Type `redis` in the main search bar and select **Show Service redis**.

  ![Search for redis](/img/lab2/1.7-knowledge-graph-1.png)

- Hover the entity - the version is shown as `8.2.1`.

  ![Redis version](/img/lab2/1.7-knowledge-graph-2.png)

- Alternatively, click **Show more** for the full properties page, which also includes the version and other properties.

  ![Full properties page](/img/lab2/1.7-knowledge-graph-3.png)

</details>
