---
sidebar_position: 1
---

# 3.1. Query Frontend Observability data

Use the Grafana Assistant in this section. The core questions cover frontend page loads and errors; the extra credit walks through using `@` context to pin Assistant to a specific data source and label.

---

## Question 1 - Page loads

Looking at my frontend app `ecommerce`, how many page loads have there been in the last 3 hours?

<details className="answer-reveal">
<summary>Show answer</summary>

Approximately **1,300–1,780 requests per second** over the last 3 hours.

![Assistant page-loads response](/img/lab3/1.1-grafana-assistant-1.png)

</details>

---

## Question 2 - Errors

Do any of those pages have errors?

<details className="answer-reveal">
<summary>Show answer</summary>

![Assistant errors response](/img/lab3/1.2-grafana-assistant.png)

</details>

---

## Question 3 - `@` context (logs data source) - extra credit

Ask another Frontend Observability question, but this time give `@` context so Assistant looks at the logs data source. The data source will be `grafanacloud-*****-logs`.

<details className="answer-reveal">
<summary>Show answer</summary>

![Assistant with logs data source context](/img/lab3/1.3-grafana-assistant.png)

</details>

---

## Question 4 - `@` context (`app_id` label) - extra credit

Ask another Frontend Observability question, but this time give `@` context to select the log label `app_id` (there's only one - Frontend O11y uses it to specify which frontend o11y app). The data source will be `grafanacloud-*****-logs`.

<details className="answer-reveal">
<summary>Show answer</summary>

Navigate to **Labels** in the context menu:

![Labels menu](/img/lab3/1.4-grafana-assistant-1.png)

Select the logs data source:

![Logs data source](/img/lab3/1.4-grafana-assistant-2.png)

Select the `app_id` label:

![app_id label](/img/lab3/1.4-grafana-assistant-3.png)

Choose the app id:

![Choose the app id](/img/lab3/1.4-grafana-assistant-5.png)

</details>
