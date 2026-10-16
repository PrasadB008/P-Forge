# Architecture

P-Forge is a three-tier task manager: Next.js frontend, Express REST API, PostgreSQL database.
The diagrams are Mermaid and render on GitHub.

## Request flow

```mermaid
flowchart LR
    user([Browser])
    subgraph web["Web — Next.js :3000 (src/web)"]
        page["App Router page<br/>app/page.tsx"]
        actions["Server Actions<br/>app/actions.ts"]
        page --> actions
    end
    subgraph api["API — Express :3001 (src/api)"]
        routes["Routes<br/>/health, /tasks, /tasks/:id"]
        pool["pg pool<br/>db.js"]
        routes --> pool
    end
    db[("PostgreSQL 17<br/>tasks table")]

    user -- "HTTP" --> page
    actions -- "fetch via API_URL" --> routes
    pool -- "DATABASE_URL" --> db
```

## Local deployment (Docker Compose)

```mermaid
flowchart TD
    host([Host :3000])
    pg[("postgres<br/>postgres:17-alpine<br/>volume: postgres_data")]
    migrate["migrate<br/>node-pg-migrate up (src/db)"]
    api["api<br/>Express :3001 (internal)"]
    web["web<br/>Next.js :3000"]

    host --> web
    web -- "API_URL=http://api:3001" --> api
    api -- "DATABASE_URL" --> pg
    migrate -- "apply migrations" --> pg

    pg -. "healthy" .-> migrate
    migrate -. "completed successfully" .-> api
    api -. "started" .-> web
```

Dotted arrows show `depends_on` startup order.

## Production deployment (GCP, Terraform)

```mermaid
flowchart TD
    user([Internet user])
    gh["GitHub Actions<br/>deploy.yml"]
    gcr[("Container Registry<br/>api + web images")]

    subgraph gcp["Google Cloud Platform"]
        webrun["Cloud Run: web<br/>public (allUsers invoker)"]
        apirun["Cloud Run: api<br/>invoker: Cloud Run service account"]
        sm["Secret Manager<br/>database URL"]
        subgraph vpc["VPC + private subnet"]
            conn["VPC Access Connector"]
            sql[("Cloud SQL PostgreSQL 17<br/>private IP")]
        end
    end

    user --> webrun
    webrun -- "API_URL" --> apirun
    apirun --> conn --> sql
    sm -. "DATABASE_URL" .-> apirun
    gh -- "build and push" --> gcr
    gh -- "terraform apply, migrations" --> gcp
    gcr -. "images" .-> webrun
    gcr -. "images" .-> apirun
```

Infrastructure is defined in `src/infrastructure/main.tf`. The wiki's architecture page is the source for the CI/CD and
Cloud Run/Cloud SQL description; the Terraform details above were checked only partially in `main.tf`, so verify against it
before relying on exact wiring.
