# observability-workshop-breakouts

![Grafana Logo](./site/static/img/grafana.png)

Hands-on labs for the Grafana Cloud Observability workshop, served as a Docusaurus site. Each lab is self-contained: a different app, a different problem, and a different tool for solving it.

- **Lab 1** - Users say slow, dashboards say fine (Frontend Observability)
- **Lab 2** - It's always the database (Database Observability)
- **Lab 3** - When everything breaks at once (Knowledge Graph + Kubernetes Monitoring)
- **Lab 4** - One page, a thousand queries (Traces Drilldown + Database Observability, banking app)

Every lab starts from a user-facing symptom, works down to the root cause, and ends by asking the **Grafana Assistant** to investigate - then checking its answer.

## Run locally

```sh
cd site
npm install
npm start
```

Then open http://localhost:3001/observability-workshop-breakouts/.

## Production
The official workshop site can be viewed here https://grafana.github.io/observability-workshop-breakouts/
