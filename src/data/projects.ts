export type ProjectCategory = "AI / Data" | "Backend" | "Frontend" | "Design";

export interface Project {
  slug: string;
  title: string;
  shortDescription: string; // shown on the card face, 1-2 sentences
  thumbnail: string; // path in /public, e.g. "/projects/ascii-cam/thumb.png"
  categories: ProjectCategory[]; // can belong to more than one
  techStack: string[]; // e.g. ["Next.js", "PyTorch", "FastAPI"]
  readme: string; // longer markdown description of the project
  gallery?: string[]; // additional image paths in /public
  githubUrl?: string; // omit if no public repo
}

// Placeholder data — thumbnails/gallery reuse existing /public assets so the
// section renders real images immediately. Swap in real project content and
// screenshots later.
export const projects: Project[] = [
{
    slug: "clinical-rag-chronic-disease-monitoring",
    title: "Clinical RAG for Chronic Disease Monitoring",
    shortDescription:
      "A Spanish-language Retrieval-Augmented Generation backend that answers clinician questions from a patient's own records and automatically flags high-risk chronic-disease patients.",
    thumbnail: "/vercel.svg",
    categories: ["AI / Data"],
    techStack: ["Python", "FastAPI", "LangChain", "Qdrant", "PostgreSQL", "RabbitMQ","Docker"],
    readme: `# Clinical RAG for Chronic Disease Monitoring

A Retrieval-Augmented Generation backend that lets clinicians ask natural-language questions in Spanish about a patient's history and get answers grounded strictly in that patient's retrieved clinical records, plus a rule-based risk engine that automatically flags high-risk patients as their records are updated.

Built during a software engineering internship at Lanek (Health-Tech AI Innovation, Santiago, Chile) for the UC Christus healthcare network, as an MVP for asynchronous monitoring of chronic kidney disease (CKD) and COPD patients.

## Overview

Hospitals want clinicians to ask a chatbot things like "What is this patient's current diagnosis?" or "What treatments have worked best for similar diabetes patients?" and get a trustworthy answer instead of a hallucinated one. This MVP validates that workflow end-to-end, entirely in Spanish, against a synthetic Electronic Health Record (EHR) dataset:

- Patient-specific Q&A grounded in that patient's own visits, diagnoses, treatments, notes, vitals, and lab observations
- Cohort analytics routing comparative questions ("what treatment works best for diabetes patients?") to a separate population-level retrieval and aggregation pipeline
- Automatic risk stratification for CKD, COPD, diabetes, depression, and dementia, generating alerts with a clinical recommendation
- An event-driven pipeline (RabbitMQ) that re-indexes only the affected clinical data within seconds of any update

No FHIR interoperability, real hospital EHR integration, or multimodal biomarker capture — the synthetic EHR dataset (patients, visits, diagnoses, treatments, notes, documents, vitals, observations, AI alerts) was generated with Faker to exercise the full pipeline realistically without using real patient data.

## My Role

I designed and implemented the backend end-to-end as the sole engineer on this MVP:

- The hexagonal (ports & adapters) architecture and domain model for the clinical entities
- The full RAG pipeline: clinical query guard, query planner (intent detection, patient/visit resolution, temporal reasoning), hybrid retrieval, context assembly, and prompt construction
- The hybrid retrieval layer combining a vector store with an in-memory BM25 index, fused with weighted Reciprocal Rank Fusion
- The cohort retrieval and comparative-evidence engine for population-level queries
- The rule-based clinical risk engine and alerting pipeline
- The event-driven ingestion pipeline for incremental re-indexing
- A systematic functional evaluation of the finished system (22 test cases across 8 categories)

## Architecture

The platform combines three architectural patterns: hexagonal (ports & adapters) architecture for strict separation of domain logic from infrastructure; event-driven architecture, where clinical state changes propagate as domain events through RabbitMQ, triggering automatic re-indexing and risk evaluation; and Retrieval-Augmented Generation, where every LLM response is grounded in evidence retrieved from indexed clinical data.

Whenever a clinical entity (visit, diagnosis, treatment, vitals, note...) is created or updated, a domain event is published. A worker consumes it, re-indexes only the affected chunk sections via a dependency graph (e.g. adding a diagnosis also refreshes the patient's timeline and summary chunks), and runs risk evaluation when the entity type is risk-relevant.

## Key Features

- Hybrid semantic + lexical retrieval: dense vector search captures paraphrased/semantic queries, BM25 lexical search catches exact clinical terms, medication names, and abbreviations. Results are fused with weighted
Reciprocal Rank Fusion (0.7 vector / 0.3 BM25) rather than raw score averaging, since the two sy comparable.
- Deterministic query planning: a dedicated query planner resolves patient identity, detects clinical intent (diagnosis, treatment, labs, timeline...), interprets temporal references ("last visit", "evolution"), and
decides whether a query should route to single-patient retrieval or the cohort engine.
- Budget-aware context assembly: retrieved chunks are deduplicated, re-ranked by retrieval score, clinical-type priority, and recency, and packed into a strict character budget with paragraph/sentence-aware truncation so
clinical statements are never cut mid-sentence.
- Defense-in-depth patient isolation: patient filtering is enforced at multiple independent stages, query planning, retrieval filters, result filtering, and context construction, to minimize the risk of cross-patient data
leakage.
- Cohort / comparative evidence engine: a nine-stage pipeline qualifies a population by diagnosis, retrieves and scores clinically similar patients, filters and enriches their profiles, and aggregates medication
effectiveness and risk distribution.
- Rule-based clinical risk engine: disease-specific evaluators (CKD, COPD, diabetes, depression, dementia) plus global modifiers (advanced age, urgent visit, multimorbidity) compute a risk score, map it to
low/medium/high, and generate a matched clinical recommendation.
- Real-time alerting: high-risk alerts are persisted and pushed to clinicians over WebSockets as soon as they're generated.
- Strict LLM grounding rules: the system prompt explicitly forbids inferring diagnoses not pres forbids confusing patient/visit identifiers or dates, requires the most recent record to takeprecedence, and requires the model to say "not enough information" rather than guess.

## How the Pipeline Works

A user query flows through seven stages before reaching the LLM: a clinical guard rejects non-clinical or malformed queries; query planning resolves intent, patient/visit identity, temporal scope, and cohort routing;
retrieval executes vector, BM25, or hybrid search with metadata filters; a fallback stage broadl below threshold; post-processing filters, reranks, and applies temporal ranking; ananswerability check guards against generating from insufficient evidence; and context assembly deduplicates, ranks, budgets, and section-groups the final prompt context. Only then is the strictly grounded,
Spanish-language answer generated.

Clinical data is not indexed as raw database rows. It is transformed into ten canonical chunk tsummary, timeline, diagnoses, treatments, notes, documents, alerts, vital signs, observations),each enriched with temporal decay scores, doctor metadata, and graph relationships, so retrieval can filter and rank by clinical relevance instead of just text similarity.

## Clinical Risk Engine

Each patient's total risk score combines a disease score with an acute score weighted 1.5x, then applies global modifiers for advanced age, urgent visit type, and multimorbidity to produce a final low/medium/high risk
level. Disease-specific evaluators (CKD, COPD, diabetes, depression, dementia) run against eachs and diagnoses; a recommendation engine then maps the triggering clinical reasons (e.g. severehyperglycemia, severe hypoxemia, low adherence) to a matched clinical recommendation. Alerts are persisted as a first-class clinical entity and become retrievable evidence themselves, so a clinician can later ask why the
last alert was generated and get a grounded answer.

## Tech Stack

- API framework: FastAPI, WebSockets
- Architecture: hexagonal (ports & adapters), event-driven
- Relational database: PostgreSQL
- Vector database: Qdrant (cosine similarity)
- Lexical retrieval: BM25
- Embeddings: Sentence-Transformers (all-MiniLM-L6-v2)
- RAG orchestration: LangChain, custom query planner and context assembler
- Messaging: RabbitMQ + Pika
- LLM: Mistral / OpenAI-compatible, medical-tuned
- Frontend: Next.js, React, TypeScript
- Testing / quality: Pytest, Ruff, MyPy

Clinical scope: COPD/EPOC (J44), CKD/ERC (N18), Type 2 Diabetes (E11), Major Depressive Disordearchitecture is disease-agnostic and extends through additional risk evaluators, cohort rules,and chunk builders.

## Evaluation Results

I designed and ran a systematic functional evaluation: 22 test cases across 8 categories, each scored 1-5 on groundedness, completeness, and correctness against the synthetic database of record.

| Category | Tests | Passed | Partial | Failed | Mean Score |
|---|---|---|---|---|---|
| Patient-Specific Retrieval | 3 | 3 | 0 | 0 | 4.9 |
| Patient Isolation | 3 | 3 | 0 | 0 | 4.8 |
| Graceful Degradation | 2 | 2 | 0 | 0 | 4.7 |
| Event-Driven Consistency | 1 | 1 | 0 | 0 | 4.6 |
| Temporal Reasoning | 3 | 2 | 1 | 0 | 4.3 |
| Risk Engine & Alerts | 3 | 2 | 1 | 0 | 4.0 |
| Hybrid Retrieval Quality | 3 | 2 | 1 | 0 | 3.9 |
| Cohort Analysis | 4 | 1 | 1 | 2 | 3.2 |
| Total | 22 | 16 | 4 | 2 | 4.2 |

The core single-patient RAG workflow, patient isolation, and graceful degradation (declining to answer rather than hallucinating) all performed strongly. The evaluation also surfaced concrete gaps for the next iteration,
most notably a narrow disease-term vocabulary in the cohort scoring function, and unreliable naompared to ID-based lookups, both scoped as targeted, correctable fixes rather than architectural rework.

## Design Decisions

- Hybrid retrieval over vector-only: vector search captures semantic similarity, BM25 wins on exact matches (medication names, ICD-10 codes, abbreviations). Combining both improves recall without sacrificing precision.
- Reciprocal Rank Fusion over raw score fusion: vector and BM25 scores come from incomparable srank position is more stable than normalizing and averaging raw scores.
- A dedicated query-planning layer: separating patient resolution, intent detection, and temporal interpretation from retrieval execution keeps the retrieval components themselves deterministic.
- Event-driven, scoped re-indexing: a dependency graph maps each entity type to the chunk sectionly triggers the minimal necessary re-index instead of a full rebuild.
- Structured clinical chunking over raw rows: indexing purpose-built chunk types with rich metadata enables precise, type-aware filtering that plain row-text indexing can't.

## Limitations & Future Work

No FHIR interoperability or real hospital EHR integration (by MVP design). Patient name resolution is unreliable for ambiguous or partial matches, while ID-based lookups are fully reliable. The cohort engine's
diagnosis-term vocabulary needs to be extended to cover all five modeled chronic conditions. Th rejects valid comparison queries that use only ICD-style abbreviations without surroundingclinical vocabulary. Planned next steps include broadening cohort vocabulary coverage, strengthening name resolution, and expanding the automated evaluation suite ahead of a pilot with real, de-identified clinical data.

Built as a private-sector internship project for a healthcare partner; the production codebase is confidential and not publicly available.`,
    gallery: ["/images/projects/clinical-rag/1-RAG.png","/images/projects/clinical-rag/2-RAG.png", ],
  },
  {
	slug: "fashion-mnist-transfer-learning",
    title: "Fashion-MNIST Transfer Learning Benchmark",
    shortDescription:
      "A deep learning benchmark comparing a from-scratch CNN against fine-tuned ResNet, EfficientNet, and MobileNet models on Fashion-MNIST.",
    thumbnail: "/vercel.svg",
    categories: ["AI / Data"],
    techStack: ["Python", "PyTorch", "Torchvision", "Scikit-learn", "Streamlit"],
    readme: `# Fashion-MNIST Transfer Learning Benchmark

Explores image classification on Fashion-MNIST by comparing a custom CNN trained from scratch against several pretrained computer vision models fine-tuned via transfer learning, evaluating the trade-offs between accuracy, efficiency, and deployability.

## Workflow

- Exploratory data analysis and data augmentation
- Baseline CNN implementation
- Transfer learning with ResNet, EfficientNet, and MobileNet
- Two-stage fine-tuning (head training, then backbone fine-tuning)
- Hyperparameter optimization
- Evaluation via accuracy, precision, recall, F1-score, and confusion matrices
- Explainability with Grad-CAM and misclassification error analysis

## Deployment

A Streamlit app serves the fine-tuned MobileNetV3 model for live predictions, with optional Grad-CAM overlays showing which regions drove each classification.

Built as coursework investigating transfer learning techniques and comparing modern CNN architectures on a standardized benchmark.`,
    githubUrl: "https://github.com/mestresanna/deeplearning",
  },
  
{
    slug: "banditgames-platform",
    title: "BanditGames Platform",
    shortDescription:
      "A full-stack gaming hub backend and frontend where players browse a game catalog and launch titles, with a REST API for onboarding third-party games and achievements.",
    thumbnail: "/vercel.svg",
    categories: ["Backend", "Frontend"],
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "React Router v6",
      "Material UI",
      "Java",
      "Spring Boot",
      "MongoDB",
      "RabbitMQ",
      "Keycloak",
      "Docker Compose",
    ],
    readme: `# BanditGames Platform

A full-stack web application that serves as a central hub for discovering and launching games. Players can browse a catalog of available games and launch either an external Chess application or an internal Connect Four game, with the platform designed to grow into a complete gaming service featuring lobbies, friends, achievements, matchmaking, and event-driven services.

## Architecture

\`\`\`
React + Vite Frontend
        |
        | GET /api/games
        v
Spring Boot REST API
(Hexagonal Architecture)
        |
        +-- In-memory Repository
        +-- MongoDB (gameplay logging)
        +-- RabbitMQ (events)
        +-- Keycloak (authentication)
                |
                +-- External Chess Application
\`\`\`

The backend follows Hexagonal (Clean) Architecture, separating \`domain\`, \`port/in\` and \`port/out\`, \`core\` use cases, and \`adapter/in\` (REST) and \`adapter/out\` (repositories) layers. The frontend is a React + Vite app using React Router and Material UI, talking to the backend through a development proxy.

## Current Features

- Browse available games in a Material UI grid
- Launch the external Chess application
- Navigate to an internal Connect Four game
- REST API for the game catalog
- Modular Clean Architecture backend, ready for authentication, events, and gameplay logging

## Third-Party Game Integration

The platform exposes a public developer API (\`POST /api/dev/games\`) so external developers can submit their own games. Submissions go through an admin approval lifecycle before appearing on the platform, and approved games can optionally publish achievement-unlock events to a shared RabbitMQ queue, keyed by platform-issued achievement IDs.

## Infrastructure

The full development environment — MongoDB, RabbitMQ with management UI, MySQL + Keycloak, and the external Chess application's Postgres/backend/frontend — is orchestrated with Docker Compose, so \`docker compose up -d\`
brings up every supporting service alongside the Spring Boot backend (port 8080) and Vite front

Built as a team project exploring hexagonal architecture on the backend and a pluggable, event-hird-party games.`,
    githubUrl: "https://github.com/mestresanna/banditgames",
  },
{
    slug: "multiagent-job-application-optimizer",
    title: "Multi-Agent Job Application Optimizer",
    shortDescription:
      "A blackboard-architecture multi-agent system where seven specialized agents collaborate to tailor a resume, cover letter, and supporting materials to a specific job posting, iterating until an ATS match score target is met.",
    thumbnail: "/vercel.svg",
    categories: ["AI / Data", "Backend"],
    techStack: [
      "Python",
      "Ollama",
      "Llama 3.1",
      "spaCy",
      "Jinja2",
      "WeasyPrint",
      "pdfkit",
      "wkhtmltopdf",
      "Matplotlib",
    ],
    readme: `# Multi-Agent Job Application Optimizer

A sophisticated multi-agent system designed to optimize job application materials based on specific job descriptions. The system uses AI to analyze job postings and tailor a resume, cover letter, and other application materials to maximize the chances of success.

## Architecture

\`\`\`
                 Blackboard (shared memory)
                          |
                    EnhancedSupervisor
                          |
   +---------+---------+---------+---------+---------+---------+
   |         |         |         |         |         |         |
JobAnalysis Resume  CoverLetter ATSScanner Interview Portfolio LinkedIn
  Agent    Optimizer   Agent      Agent      Prep      Agent  Optimizer
             Agent                          Agent              Agent
                          |
                 BeautifulResumeExporter (PDF)
\`\`\`

The system follows a **blackboard architecture**: a shared \`Blackboard\` object holds state (resume, job text, generated artifacts, scores) that every agent reads from and writes to, while an \`EnhancedSupervisor\` orchestrates a five-phase pipeline per job posting, calling each agent through Ollama-hosted LLM (Llama 3.1) prompts.

## Pipeline

1. **Phase 1 — Initial Analysis**: \`JobAnalysisAgent\` extracts key requirements, skills, and company information from the posting.
2. **Phase 2 — Initial Optimization**: \`ResumeOptimizerAgent\` tailors the resume to the job; \`ATSScannerAgent\` scores the match and flags missing keywords.
3. **Phase 3 — Iterative Refinement Loop**: the resume is re-optimized against ATS feedback until a target match score is reached.
4. **Phase 4 — Supporting Documents**: \`CoverLetterAgent\`, \`InterviewPrepAgent\`, \`PortfolioAgent\`, and \`LinkedInOptimizerAgent\` generate a cover letter, interview Q&A, portfolio suggestions, and LinkedIn improvements from the finalized resume.
5. **Phase 5 — Comparison Analysis**: differences between the original and optimized resume aree comparison graph is generated across all processed jobs.

## Agents

- **Job Analysis Agent** — extracts requirements, skills, and company info from a job posting.
- **Resume Optimizer Agent** — rewrites the resume for a specific job, consuming ATS feedback across iterations.
- **Cover Letter Agent** — drafts a cover letter referencing the optimized resume and job requi
- **ATS Scanner Agent** — scores resume/job fit from an ATS perspective and lists missing keywords/weak areas.
- **Interview Prep Agent** — generates likely interview questions and suggested answers.
- **Portfolio Agent** — recommends portfolio items to showcase for the role.
- **LinkedIn Optimizer Agent** — suggests LinkedIn profile changes aligned to the job.

## Output

For each processed job, the system writes a JSON file (\`jobExamples/output/<job>_output.json\`, optimized resume, cover letter, interview prep, portfolio suggestions, ATS results, LinkedInsuggestions, and comparison analysis, then auto-exports a formatted PDF via \`BeautifulResumeExporter\` (Jinja2 + WeasyPrint/pdfkit/wkhtmltopdf). When multiple jobs are processed, a Matplotlib bar chart compares match
scores across postings.

## Dependencies

Requires a locally running [Ollama](https://ollama.ai/) instance with the \`llama3.1\` model pujinja2\`, \`pdfkit\`, \`resume_parser\`, \`spacy\`, and \`weasyprint\`. \`wkhtmltopdf\` isrecommended for PDF generation.

Built as part of the Data AI 6 course at KdG Computer Science, by Philipe Souza and Anna Mestres.`,
    githubUrl: "https://github.com/mestresanna/multiagent-curriculum",
  },

  {
    slug: "bike-share-data-warehouse",
    title: "Bike-Share Data Warehouse & ETL Pipeline",
    shortDescription:
      "A data warehousing solution integrating bike-share rides, weather, and subscription data into a star-schema fact/dimension model, with parallel NoSQL exploration in MongoDB and Neo4j.",
    thumbnail: "/vercel.svg",
    categories: ["AI / Data"],
    techStack: ["Python", "PySpark", "Delta Lake", "PostgreSQL", "MongoDB", "Neo4j", "Docker", "Pandas", "Power BI"],
    readme: `# Bike-Share Data Warehouse & ETL Pipeline

Builds a centralized data warehouse for a bike-share system by integrating rides, station, user, vehicle, and weather data from multiple sources into a dimensional (star schema) model that supports analytics and reporting.

## Workflow

- Dimensional modeling: Date, User, Station, Weather, and Vehicle dimensions built with PySpark and stored as Delta tables
- Incremental user dimension updates alongside an initial full load
- Weather enrichment via an external API, fetched per postal code and cached as JSON, then matched to rides by zip code, date, and time
- Haversine-based ride distance calculation computed in PostgreSQL
- Fact table (Fact Rides) assembled by joining all dimensions with ride and weather data, then persisted as both Delta and Parquet
- ETL pipeline structured as Extract (source + dimension joins), Transform (haversine distance, weather-type mapping), and Load (Delta/Parquet fact table)
- Parallel document/graph modeling of the same ride data in MongoDB and Neo4j to compare relational, document, and graph representations for querying rides, stations, and vehicles
-Finally a Power BI dashboard visualizes key metrics and important questions: total rides, average distance, weather impact, and user subscription trends.

## Stack

PostgreSQL (via Docker Compose) as the operational source database, PySpark with Delta Lake for the warehouse layer, a weather API for enrichment, and MongoDB/Neo4j for complementary NoSQL data models. Power BI is used for visualization and reporting.

Built as coursework (Data & AI, KDG) on data warehousing and ETL design, in a team of two.`,
	gallery: ["/images/projects/bike-share-data-warehouse/1.png", "/images/projects/bike-share-data-warehouse/2.png", "/images/projects/bike-share-data-warehouse/3.png"],
    githubUrl: "https://github.com/mestresanna/datawarehouse",
  },
];
