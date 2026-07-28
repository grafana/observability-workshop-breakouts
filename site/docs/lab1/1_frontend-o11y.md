---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 1.1. See what your users see

*You start where your users are. Open the browser telemetry and let the app tell you what's wrong.*

In Grafana, open the left-hand menu and select **Observability** -> **Frontend**. You'll see a list of every application instrumented with Faro. Click into the `ecommerce` app and set the time range to the **last 24 hours** so you can see before and after the slowdown began.

The app opens on the **Performance** tab - your application health at a glance.

![Frontend Observability - Performance overview](/img/lab1/1.1-frontend-overview.png)

---

## Question 1: Is the app even busy, and are page loads succeeding?

**On the Performance tab, how many page loads have there been, and are any of them failing?**

Before hunting for the problem, get your bearings. The **Page Loads** panel is your traffic baseline - and it colors successful loads blue and failed loads red, so you immediately know whether this is a "broken" problem or a "slow" problem.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

There's healthy, steady traffic, and the **Page Loads** panel is essentially **all blue** - pages *are* loading successfully. Nothing is failing outright. That already reframes the investigation: this is a **performance** problem, not an availability one.

**How to find it:**

1. Left menu → **Frontend** → **Frontend Apps** → **`ecommerce`**.
2. On the **Performance** tab, read the **Page Loads** panel and its time series.
3. Note the absence of red (failed) segments.

![Page Loads panel](/img/lab1/1.1-frontend-overview.png)

> **The value:** RUM measures real visits from real browsers. One glance tells you traffic is normal and loads are succeeding - so whatever customers are feeling, it isn't an outage.

</details>

---

## Question 2: Which Core Web Vital has gone bad?

**Look at the Core Web Vitals row. Which vital is in the "poor" (red) range, and what does it measure?**

Grafana surfaces Google's [Core Web Vitals](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/web-vitals/) as color-coded tiles - green (good), amber (needs improvement), red (poor) - each measured at the 75th percentile of real users. The vital that's red tells you *what kind* of bad experience users are having.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**Largest Contentful Paint (LCP)** is in the red. LCP measures how long until the largest element on the page finishes rendering - and its "good" threshold is **2.5s**. Here it has climbed well past that, while the other vitals stay green:

- **LCP** (loading) - **poor** ⬆
- TTFB (server response), FCP (first paint) - fine
- CLS (visual stability), INP (interaction responsiveness) - fine

Because only the *loading* vital regressed - and specifically the *largest* element - the prime suspect is a big, slow asset like an image. (Note: older views may still label responsiveness as **FID**; Google and Grafana are moving to **INP**.)

**How to find it:**

1. On the **Performance** tab, read the **Core Web Vitals** row.
2. Hover the **?** on each tile to recall what it measures.
3. Identify **LCP** as the red one; note its p75 value vs the 2.5s threshold.

![Core Web Vitals - LCP poor](/img/lab1/1.2-lcp-regression.png)

> **The value:** Web Vitals turn a vague "it feels slow" into a specific, industry-standard number tied to a specific dimension of user experience - and a threshold you can hold yourself to.

</details>

---

## Question 3: Which pages are affected?

**Use the Page Performance panel. Is every page slow, or only some?**

The **Page Performance** panel breaks the same metrics down per page (by page ID), each with its own vitals and error columns. Whether the regression is everywhere or isolated is the single most useful early clue - it points straight at the common ingredient.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The regression is concentrated on the **image-heavy pages** - the product pages (`/product/*`) and the home page (`/`) with its banner. Lighter pages such as `/cart` look fine.

The pattern *"slow only where there are big images"* combined with *"only LCP is bad"* narrows this almost to a diagnosis: something is wrong with how images load.

**How to find it:**

1. On the **Performance** tab, find the **Page Performance** panel.
2. Compare the LCP column across page IDs.
3. Note that image-heavy routes stand out while others are green.

![Page Performance panel](/img/lab1/1.3-page-performance.png)

> **The value:** Per-page breakdown converts "the site is slow" into "these specific pages are slow," shrinking the search space before you've left the overview.

</details>

---

## Question 4: Is it everyone, or one segment? <Badge variant="optional">Optional</Badge>

**Use filters and Geolocation insights to check whether one browser, device, or country is worse.**

Real users aren't uniform. Frontend Observability lets you slice the *same* metric by browser, OS, device, release version, and geography. Even when a problem turns out to be universal, knowing how to segment is the skill that catches the ones that aren't (a bad CDN edge, a broken browser version, a regional outage).

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The slowdown is **universal** - every browser, device, and country degrades together. That itself is informative: a segment-specific cause (one CDN region, one browser) is ruled out, pointing at something in the application itself rather than the delivery network.

**How to find it:**

1. Use the **filter bar** at the top of any tab; add a filter on `browser`, then `os`, then compare.
2. Open the **Geolocation insights** tab to see performance broken down by country on a map.
3. Confirm the regression is present across all segments.

![Geolocation and segmentation](/img/lab1/1.6-geo-breakdown.png)

> **The value:** Segmentation answers "who is actually affected?" - the difference between a global rollback and a targeted fix.

</details>

---

## Question 5: Rule out errors

**Open the Errors tab. Are exceptions elevated during this window?**

It's tempting to assume "slow" and "broken" travel together. Check the **Errors overview** - the **Top Exceptions**, **Top URLs**, and **Top Browsers** panels. What you *don't* find here is as important as what you do.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

**No.** Exceptions are flat - **Top Exceptions** shows nothing new lining up with the slowdown. The pages render correctly and completely; they're just *slow*.

This is the crux of why Frontend Observability exists. There is no error to catch, no 500 in a log, no failing span. Every backend signal is green. The only evidence of a real, revenue-affecting problem is a Web Vital measured in the browser.

**How to find it:**

1. Open the **Errors** (Errors overview) tab.
2. Read **Top Exceptions** and its distribution over your time range.
3. Confirm counts are unchanged across the slowdown window.

> **The value:** RUM captures client-side exceptions your backend never sees - and, just as usefully, confirms when there *are* none, so you don't chase a bug that doesn't exist. (When there are errors, uploaded **source maps** turn minified stack traces back into readable code.)

![Errors overview - flat](/img/lab1/1.4-errors-flat.png)

</details>

---

## Question 6: Watch one real user

**Open a session on an affected page. In the User Journey, what specifically took so long?**

KPIs tell you *that* it's slow; a **session** tells you *why*. Each session is one visitor's timeline - navigations, network calls, errors, and traces in order. Expand a navigation event to see exactly which phase of the page load ate the time.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

In the session's **User Journey** table, expand a `faro.performance.navigation` event on `/product/*`. The navigation-timings breakdown shows the network and document phases (DNS, TCP, TLS, document parsing, DOM processing) all completing quickly - but the page's **image resource loads** stretch out for seconds. The images are the long pole; everything else is fast.

You've now localised the problem completely: image assets, on image-heavy pages, in the browser, with no errors.

**How to find it:**

1. From an affected page or the **Sessions** tab, open a recent session on `/product/*`.
2. In the **User Journey** table, expand the `faro.performance.navigation` event.
3. Read the timing breakdown and spot the slow image resource(s). (If **session replay** is enabled, you can even watch the visit play back.)

![Session User Journey - slow image resource](/img/lab1/1.5-session-slow-image.png)

> **The value:** Sessions replace guesswork with a single user's ground truth - the exact sequence and timing of what they experienced.

</details>

---

## Question 7: Prove the backend is innocent

**Follow a slow page's request into its backend trace. Where did the time actually go?**

Faro links browser spans to backend distributed traces (the backend returns a `Server-Timing` / `traceparent` header, and Faro stitches them together). Before you hand this off as a frontend issue, *prove* it: jump to the trace and look at the backend spans.

<TryIt />

<details className="answer-reveal">
<summary>Show answer</summary>

The **backend spans are fast**. From a session's HTTP request (or the **HTTP insights** tab), click through to the trace in Application Observability: the API, the services, and the database all return in milliseconds. The seconds of delay live entirely on the client, fetching and rendering images.

You didn't just *suspect* a frontend problem - you followed the request end to end and **proved** the backend was healthy.

**How to find it:**

1. In a **Session** (or **HTTP insights**), open an HTTP request and click the **Services** action to jump to its backend trace.
2. Inspect the span durations - backend work is fast; the time is client-side.

![Trace - fast backend spans](/img/lab1/1.7-trace-fast-backend.png)

> **The value:** Frontend-to-backend trace correlation is the full-stack payoff - one click from "the browser is slow" to "and here's exactly how far down the stack the slowness does (or doesn't) go." In **Lab 2** you'll take that same click when the trail *keeps going* - all the way into a database query.

</details>
