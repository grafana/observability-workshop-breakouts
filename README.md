# observability-workshop-breakouts

![Grafana Logo](./site/static/img/grafana.png)

Hands-on labs for the Grafana Cloud Observability workshop, served as a Docusaurus site. Each lab is a self-contained story: a different app, a different problem, and a different tool suited to solving it.

- **Lab 1** - The customer sees it first (Frontend Observability)
- **Lab 2** - Follow the trail into the database (Database Observability)
- **Lab 3** - Map the whole system with the Knowledge Graph (Entity Catalog, Entity Graph, RCA Workbench) + Kubernetes Monitoring
- **Lab 4** - A new app, the same instincts (Traces Drilldown + Database Observability, banking app)

Every lab enters from a user-facing symptom and ends by having the **Grafana Assistant** investigate, then verifying its findings.

## Run locally

```sh
cd site
npm install
npm start
```

Then open http://localhost:3001/observability-workshop-breakouts/.

## Production
The official workshop site can be viewed here https://grafana.github.io/observability-workshop-breakouts/
