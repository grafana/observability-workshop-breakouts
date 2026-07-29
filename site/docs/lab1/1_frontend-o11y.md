---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';

# 1.1. See what your users see

*Imagine you're on call. Customers say the ecommerce site feels slow, but every backend dashboard is green. Where do you start? At the same place your users do: in the browser.*

Frontend Observability collects telemetry directly from the browser using the Faro Web SDK - Core Web Vitals, page loads, errors, sessions, and client-side traces - so you can see what real users on real devices actually experience.

In Grafana, open the left-hand menu and select **Observability** -> **Frontend**. You'll see a list of every application instrumented with Faro. Click into the `ecommerce` app and set the time range to cover **today's slow-images window** (`{LAB1_WINDOW}` - see the lab intro), starting about an hour before it so you can see the healthy baseline and the moment the slowdown began. Avoid a much wider range like 24 hours: it would also pick up yesterday's other lab scenarios and muddy the picture.

The app opens on the **Performance** tab.

![Frontend Observability - Performance overview](/img/lab1/1.1-frontend-overview.png)

---

## Question 1: Page loads

**How many page loads have there been, and are any of them failing?**

Before hunting for problems, get your baseline.

<TryIt where="the Page Loads panel on the Performance tab - successful loads in blue, failed loads in red." />

<details className="answer-reveal">
<summary>Show answer</summary>

Traffic is steady and the **Page Loads** panel is essentially all blue - pages are loading successfully. Nothing is failing outright, so this is a performance problem, not an availability problem.

**How to find it:**

1. Open **Observability** -> **Frontend** -> **`ecommerce`**.
2. On the **Performance** tab, read the **Page Loads** panel and its time series.
3. Note the absence of red (failed) segments.

![Page Loads panel](/img/lab1/1.1-frontend-overview.png)

</details>

---

## Question 2: Core Web Vitals

**Which Core Web Vital is in the "poor" (red) range, and what does it measure?**

Grafana surfaces Google's [Core Web Vitals](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/web-vitals/) as color-coded tiles - green (good), amber (needs improvement), red (poor) - measured at the 75th percentile of real users.

<TryIt where="the Core Web Vitals row on the Performance tab; hover the ? on each tile to see what it measures." />

<details className="answer-reveal">
<summary>Show answer</summary>

**Largest Contentful Paint (LCP)** is in the red. LCP measures how long until the largest element on the page finishes rendering; its "good" threshold is **2.5s**, and here it has climbed well past that. The other vitals stay green:

- **LCP** (loading) - poor
- TTFB (server response), FCP (first paint) - fine
- CLS (visual stability), INP (interaction responsiveness) - fine

Only the loading vital regressed, and specifically the *largest* element - which points at a big, slow asset like an image. (Older views may still label responsiveness as **FID**; Google and Grafana are moving to **INP**.)

**How to find it:**

1. On the **Performance** tab, read the **Core Web Vitals** row.
2. Identify **LCP** as the red one; note its p75 value against the 2.5s threshold.

![Core Web Vitals - LCP poor](/img/lab1/1.2-lcp-regression.png)

</details>

---

## Question 3: Which pages are affected?

**Is every page slow, or only some?**

Whether a regression is everywhere or isolated to certain routes is one of the most useful early clues.

<TryIt where="the Page Performance panel, which breaks the same metrics down per page." />

<details className="answer-reveal">
<summary>Show answer</summary>

The regression is concentrated on the image-heavy pages - the product pages (`/product/*`) and the home page (`/`) with its banner. Lighter pages such as `/cart` look fine.

"Slow only where there are big images" plus "only LCP is bad" narrows this down: something is wrong with how images load.

**How to find it:**

1. On the **Performance** tab, find the **Page Performance** panel.
2. Compare the LCP column across page IDs.
3. Note that the image-heavy routes stand out while others are green.

![Page Performance panel](/img/lab1/1.3-page-performance.png)

</details>

---

## Question 4: Is it everyone, or one segment? <Badge variant="optional">Optional</Badge>

**Use filters and Geolocation insights to check whether one browser, device, or country is worse.**

Frontend Observability can slice the same metric by browser, OS, device, release version, and geography. Even when a problem turns out to be universal, segmenting is how you catch the ones that aren't - a bad CDN edge, a broken browser version, a regional outage.

<TryIt where="the filter bar at the top of any tab, and the Geolocation insights tab." />

<details className="answer-reveal">
<summary>Show answer</summary>

The slowdown is universal - every browser, device, and country degrades together. That rules out a segment-specific cause (one CDN region, one browser) and points at the application itself rather than the delivery network.

**How to find it:**

1. Use the **filter bar** at the top of any tab; add a filter on `browser`, then `os`, and compare.
2. Open the **Geolocation insights** tab to see performance broken down by country.
3. Confirm the regression is present across all segments.

![Geolocation and segmentation](/img/lab1/1.6-geo-breakdown.png)

</details>

---

## Question 5: Rule out errors

**Open the Errors tab. Are exceptions elevated during this window?**

It's tempting to assume "slow" and "broken" travel together.

<TryIt where="the Errors tab - the Top Exceptions, Top URLs, and Top Browsers panels." />

<details className="answer-reveal">
<summary>Show answer</summary>

No. Exceptions are flat - **Top Exceptions** shows nothing new lining up with the slowdown. The pages render correctly; they're just slow.

> **Why this matters:** there is no error to catch here - no 500 in a log, no failing span. The only evidence of a real, revenue-affecting problem is a Web Vital measured in the browser. Without RUM, this incident is invisible.

**How to find it:**

1. Open the **Errors** tab.
2. Read **Top Exceptions** and its distribution over your time range.
3. Confirm counts are unchanged across the slowdown window.

![Errors overview - flat](/img/lab1/1.4-errors-flat.png)

</details>

---

## Question 6: Look at a real user session

**Open a session on an affected page. In the User Journey, what specifically took so long?**

Each session is one visitor's timeline - navigations, network calls, errors, and traces in order.

<TryIt where="the Sessions tab; open a session on /product/* and expand its User Journey navigation event." />

<details className="answer-reveal">
<summary>Show answer</summary>

In the session's **User Journey** table, expand a `faro.performance.navigation` event on `/product/*`. The network and document phases (DNS, TCP, TLS, document parsing, DOM processing) all complete quickly - but the page's **image resource loads** stretch out for seconds.

That localizes the problem completely: image assets, on image-heavy pages, in the browser, with no errors.

**How to find it:**

1. From an affected page or the **Sessions** tab, open a recent session on `/product/*`.
2. In the **User Journey** table, expand the `faro.performance.navigation` event.
3. Read the timing breakdown and spot the slow image resource(s). (If session replay is enabled, you can also watch the visit play back.)

![Session User Journey - slow image resource](/img/lab1/1.5-session-slow-image.png)

</details>

---

## Question 7: Check the backend

**Follow a slow page's request into its backend trace. Where did the time actually go?**

Faro links browser spans to backend distributed traces (the backend returns a `Server-Timing` / `traceparent` header, and Faro stitches them together). Before calling this a frontend issue, confirm it with a trace.

<TryIt where="an HTTP request inside a session (or the HTTP insights tab) - the Services action jumps to the backend trace." />

<details className="answer-reveal">
<summary>Show answer</summary>

The backend spans are fast. From a session's HTTP request (or the **HTTP insights** tab), click through to the trace: the API, the services, and the database all return in milliseconds. The delay is entirely client-side, in fetching and rendering images.

**How to find it:**

1. In a **Session** (or **HTTP insights**), open an HTTP request and click the **Services** action to jump to its backend trace.
2. Inspect the span durations - backend work is fast; the time is client-side.

![Trace - fast backend spans](/img/lab1/1.7-trace-fast-backend.png)

</details>
