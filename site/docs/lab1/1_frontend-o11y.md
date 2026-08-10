---
sidebar_position: 1
---

import TryIt from '@site/src/components/TryIt';
import Badge from '@site/src/components/Badge';
import EnvLink from '@site/src/components/EnvLink';

# 1.1. See what your users see

*Imagine you're on call. Customers say the ecommerce site feels slow, but every backend dashboard is green. Where do you start? At the same place your users do: in the browser.*

Frontend Observability collects telemetry directly from the browser using the Faro Web SDK - Core Web Vitals, page loads, errors, sessions, and client-side traces - so you can see what real users on real devices actually experience.

In Grafana, open the left-hand menu and select **Observability** -> **Frontend**. You'll see a list of every application instrumented with Faro. Click into the `ecommerce` app and set the time range to cover **today's slow-images window** (`{LAB1_WINDOW}` - see the lab intro), starting about an hour before it so you can see the healthy baseline and the moment the slowdown began. Avoid a much wider range like 24 hours: it would also pick up yesterday's other lab scenarios and muddy the picture.

<div style={{maxWidth: '340px'}}>

![Set the time range to today's slow-images window](/img/lab1/1.0-time-range.png)

</div>

:::tip Jump straight there

<EnvLink appIdKey="frontendAppId" path="/a/grafana-kowalski-app/apps/{appId}" from="06:00" to="08:00">Open Frontend Observability for the ecommerce app</EnvLink> - opens the app with the slow-images window (previous day, UTC) already applied. Needs your environment ID and Frontend Observability app ID from the Welcome page.

:::

The app opens on the **Overview** tab.

![Frontend Observability - Performance overview](/img/lab1/1.1-frontend-overview.png)

---

## Question 1: Page loads

**How many page loads have there been, and are any of them failing?**

Before hunting for problems, get your baseline.

<TryIt where="the Page Loads panel on the Overview tab - successful loads in blue, failed loads in red." />

<details className="answer-reveal">
<summary>Show answer</summary>

Traffic is steady and the **Page Loads** panel is essentially all blue - pages are loading successfully. Nothing is failing outright, so this is a performance problem, not an availability problem.

**How to find it:**

1. Open **Observability** -> **Frontend** -> **`ecommerce`**.
2. On the **Overview** tab, read the **Page Loads** panel and its time series.
3. Note the absence of red (failed) segments.

<div style={{maxWidth: '520px'}}>

![Page Loads panel](/img/lab1/1.1-page-loads.png)

</div>

</details>

---

## Question 2: Core Web Vitals

**Which Core Web Vital is in the "poor" (red) range, and what does it measure?**

Grafana surfaces Google's [Core Web Vitals](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/web-vitals/) as color-coded tiles - green (good), amber (needs improvement), red (poor) - measured at the 75th percentile of real users.

<TryIt where="the Core Web Vitals row on the Overview tab; hover the ? on each tile to see what it measures." />

<details className="answer-reveal">
<summary>Show answer</summary>

**Largest Contentful Paint (LCP)** is in the red. LCP measures how long until the largest element on the page finishes rendering; its "good" threshold is **2.5s**, and here it has climbed well past that. The other vitals stay green:

- **LCP** (loading) - poor
- TTFB (server response), FCP (first paint) - fine
- CLS (visual stability), INP (interaction responsiveness) - fine

Only the loading vital regressed, and specifically the *largest* element - which points at a big, slow asset like an image. (Older views may still label responsiveness as **FID**; Google and Grafana are moving to **INP**.)

**How to find it:**

1. On the **Overview** tab, read the **Core Web Vitals** row.
2. Identify **LCP** as the red one; note its p75 value against the 2.5s threshold.

![Core Web Vitals - LCP poor](/img/lab1/1.2-lcp-regression.png)

</details>

---

## Question 3: Which pages are affected?

**Is every page slow, or only some?**

Whether a regression is everywhere or isolated to certain routes is one of the most useful early clues.

<TryIt where="the Page Performance panel, which breaks the same metrics down per page." />

To focus on product pages only, open <EnvLink appIdKey="frontendAppId" path="/a/grafana-kowalski-app/apps/{appId}" from="06:00" to="08:00" params="var-Filters=page_id%7C%3D%7C%2Fproduct%2F%2A">Frontend Observability filtered to `/product/*`</EnvLink>.

<details className="answer-reveal">
<summary>Show answer</summary>

The regression is concentrated on the image-heavy pages - the product pages (`/product/*`) and the home page (`/`) with its banner. Lighter pages such as `/cart` look fine.

"Slow only where there are big images" plus "only LCP is bad" narrows this down: something is wrong with how images load.

**How to find it:**

1. On the **Overview** tab, find the **Page Performance** panel.
2. Compare the LCP column across page IDs.
3. Note that the image-heavy routes stand out in red.

![Page Performance panel](/img/lab1/1.3-page-performance.png)

</details>

---

## Question 4: Is one region worse than another? <Badge variant="optional">Optional</Badge>

**Use the Geolocation tab to check whether the slowdown hits one part of the world harder than the rest.**

Frontend Observability can group the same metric by geography, so you can tell a global regression from a regional one - a bad CDN edge, or a single region degrading on its own.

<TryIt where="the Geolocation tab; set Explore by to LCP. To confirm, add a geo_city filter on the Overview tab to zoom into one city." />

<details className="answer-reveal">
<summary>Show answer</summary>

The slowdown is global. With **Explore by** set to **LCP**, every region is red in the **LCP by location** table - North America ~5.0s, Europe ~4.9s, Asia ~4.8s - and the error rate is 0% everywhere. Filtering the Overview to a single city (for example `geo_city = Stockholm`) shows the same poor LCP. That rules out a regional or CDN cause and points at the application itself.

**How to find it:**

1. Open the **Geolocation** tab.
2. Set **Explore by** to **LCP**; read the **LCP by location** table and the map - LCP is poor across every region.

![Geolocation - LCP poor in every region](/img/lab1/1.6-geo-breakdown.png)

3. To confirm, go to the **Overview** tab and add a filter `geo_city = <a city>`; LCP stays in the red, so no single location is the cause.

![Filtered to one city - still slow](/img/lab1/1.6-geo-filter.png)

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

**Open a session on an affected page. In its event timeline, what specifically took so long?**

Each session is one visitor's timeline - navigations, network calls, errors, and traces in order.

<TryIt where="the Sessions tab. Click a Session ID to open the session; its Activity section lists every event, starting with the Page Load event." />

> **Seeing "No session data in this time range"?** Two common causes:
>
> - **A `page_id = /product/*` filter.** The filter bar does exact matching, so a typed wildcard matches nothing - real page IDs look like `/product/123`. Remove the filter (click its `x`); you don't need it to find a product-page session.
> - **A time range that misses the window.** The time picker shows your local timezone, but the lab window is given in UTC. Open the time picker, switch the timezone to UTC (at the bottom of the picker), and set the range to cover today's window.

<details className="answer-reveal">
<summary>Show answer</summary>

In the session's **Activity** section, click the event whose **Type** is **Page Load** (the first row). The drawer's **Performance** tab breaks the load into **Summary**, **Network**, and **Render**: TTFB and the network phases (DNS, TCP, TLS, request, response) finish in milliseconds and add up to a few percent - while **Render** takes 90%+ of the time. The browser spends seconds laying out the page while its images arrive: close the drawer and the **HTTP** events for `/images/products/...` carry the inflated durations, alongside a late FCP.

That localizes the problem completely: image assets, on image-heavy pages, in the browser, with no errors.

**How to find it:**

1. Open the **Sessions** tab and pick a session from the **middle of the incident window** - the list sorts newest-first, and a session that started in the final minutes of the window will mostly post-date the slowdown, so everything in it looks fast. Scroll down to a mid-window **Timestamp**; most sessions visit a product page, so almost any will do.

   ![Sessions tab - the sessions list](/img/lab1/1.5-sessions-list.png)

2. Click the value in the **Session ID** column to open the session - the `>` chevron only expands the row in place. The session page shows summary panels (Session, Environment, User Experience - note the poor LCP) and, below them, the **Activity** section: an event list with **Elapsed**, **Page**, **Type**, and **Details** columns. (The **User Journey**/**Traces** toggle above it should be on **User Journey**, the default.)

   ![Session page - Activity section with the Page Load event](/img/lab1/1.5-session-detail.png)

3. Click the **Page Load** event (the first row) and read the **Summary** in the drawer: TTFB and Network are a few percent each, Render dominates.

   ![Page Load drawer - Render takes 95% of the load](/img/lab1/1.5-page-load-drawer.png)

4. Close the drawer and look at the events with Type **HTTP** whose Details path is `/images/products/...` - those requests are what's slow, each taking seconds. (If session replay is enabled, you can also watch the visit play back.)

   ![HTTP events - product images taking seconds each](/img/lab1/1.5-slow-images.png)

</details>

---

## Question 7: Check the backend

**Follow a slow page's request into its backend trace. Where did the time actually go?**

Faro links browser spans to backend distributed traces (the backend returns a `Server-Timing` / `traceparent` header, and Faro stitches them together). Before calling this a frontend issue, confirm it with a trace.

<TryIt where="an HTTP event in the session's Activity list - the Traces tab in its drawer shows the linked backend trace." />

<details className="answer-reveal">
<summary>Show answer</summary>

The application is fast. Open an API request from a session and view its trace: the frontend server, API route, and downstream services each return in milliseconds. Trace one of the multi-second `/images/products/...` requests and the same picture holds - the actual application work is a few milliseconds, and the seconds sit on the proxy span in front of the app: the image responses themselves are being delayed (the `imageSlowLoad` fault from the lab intro). Nothing in the backend services or database is slow - the regression lives between the user's browser and the application.

**How to find it:**

1. Stay in the session you opened in Question 6. In its **Activity** list, click an event with Type **HTTP** whose Details show an API call (for example `GET /api/products` - not an image load).

   ![Activity list - the HTTP event for /api/products](/img/lab1/1.7-http-event.png)

2. In the drawer, switch to the **Traces** tab to see the full distributed trace stitched to that browser request. (The **Traces** button in the drawer header opens the same trace in Application Observability.)

   ![HTTP drawer - Traces tab with the backend trace](/img/lab1/1.7-traces-tab.png)

3. Compare the span durations - the browser span carries the total, and every application span below it finishes in milliseconds.
4. Have the Assistant check your reading: click **Explain in Assistant** above the trace. It breaks the trace down the same way - only ~15ms of server-side work in a ~195ms request.

   ![Explain in Assistant - trace breakdown](/img/lab1/1.7-explain-in-assistant.png)

5. For the strongest proof, open one of the multi-second `/images/products/...` events the same way: the seconds sit on the `frontendproxy` span - the injected image delay - with ~3ms of actual application work behind it.

   ![Image request trace - 2.68s total, ~3ms of application work](/img/lab1/1.7-image-trace.png)

</details>

---

## Wrap-up

You found a customer-facing problem that never showed up in a backend dashboard: a slow-image regression visible only through real user monitoring. You confirmed the LCP regression, narrowed it to the image-heavy pages, ruled out errors, pinned the slow image requests in a real user session, and used a trace to prove the application itself was healthy - the delay sits in front of it, on the image responses. Along the way you also saw how **Explain in Assistant** can read a trace and reach the same conclusion, which you verified against your own findings.

In Lab 2, a similar frontend symptom will lead somewhere different - into a database query.
