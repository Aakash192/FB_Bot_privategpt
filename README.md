# PrivateGPT - FB Bot 

<a href="https://trendshift.io/repositories/2601" target="_blank"><img src="https://trendshift.io/api/badge/repositories/2601" alt="imartinez%2FprivateGPT | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[![Tests](https://github.com/zylon-ai/private-gpt/actions/workflows/tests.yml/badge.svg)](https://github.com/zylon-ai/private-gpt/actions/workflows/tests.yml?query=branch%3Amain)
[![Website](https://img.shields.io/website?up_message=check%20it&down_message=down&url=https%3A%2F%2Fdocs.privategpt.dev%2F&label=Documentation)](https://docs.privategpt.dev/)
[![Discord](https://img.shields.io/discord/1164200432894234644?logo=discord&label=PrivateGPT)](https://discord.gg/bK6mRVpErU)
[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/ZylonPrivateGPT)](https://twitter.com/ZylonPrivateGPT)

![Gradio UI](/fern/docs/assets/ui.png?raw=true)

PrivateGPT is a production-ready AI project that allows you to ask questions about your documents using the power
of Large Language Models (LLMs), even in scenarios without an Internet connection. 100% private, no data leaves your
execution environment at any point.

>[!TIP]
> If you are looking for an **enterprise-ready, fully private AI workspace**
> check out [Zylon's website](https://zylon.ai)  or [request a demo](https://cal.com/zylon/demo?source=pgpt-readme).
> Crafted by the team behind PrivateGPT, Zylon is a best-in-class AI collaborative
> workspace that can be easily deployed on-premise (data center, bare metal...) or in your private cloud (AWS, GCP, Azure...).

The project provides an API offering all the primitives required to build private, context-aware AI applications.
It follows and extends the [OpenAI API standard](https://openai.com/blog/openai-api),
and supports both normal and streaming responses.

The API is divided into two logical blocks:

**High-level API**, which abstracts all the complexity of a RAG (Retrieval Augmented Generation)
pipeline implementation:
- Ingestion of documents: internally managing document parsing,
splitting, metadata extraction, embedding generation and storage.
- Chat & Completions using context from ingested documents:
abstracting the retrieval of context, the prompt engineering and the response generation.

**Low-level API**, which allows advanced users to implement their own complex pipelines:
- Embeddings generation: based on a piece of text.
- Contextual chunks retrieval: given a query, returns the most relevant chunks of text from the ingested documents.

In addition to this, a working [Gradio UI](https://www.gradio.app/)
client is provided to test the API, together with a set of useful tools such as bulk model
download script, ingestion script, documents folder watch, etc.

## 🎞️ Overview
>[!WARNING]
>  This README is not updated as frequently as the [documentation](https://docs.privategpt.dev/).
>  Please check it out for the latest updates!

### Motivation behind PrivateGPT
Generative AI is a game changer for our society, but adoption in companies of all sizes and data-sensitive
domains like healthcare or legal is limited by a clear concern: **privacy**.
Not being able to ensure that your data is fully under your control when using third-party AI tools
is a risk those industries cannot take.

### Primordial version
The first version of PrivateGPT was launched in May 2023 as a novel approach to address the privacy
concerns by using LLMs in a complete offline way.

That version, which rapidly became a go-to project for privacy-sensitive setups and served as the seed
for thousands of local-focused generative AI projects, was the foundation of what PrivateGPT is becoming nowadays;
thus a simpler and more educational implementation to understand the basic concepts required
to build a fully local -and therefore, private- chatGPT-like tool.

If you want to keep experimenting with it, we have saved it in the
[primordial branch](https://github.com/zylon-ai/private-gpt/tree/primordial) of the project.

> It is strongly recommended to do a clean clone and install of this new version of
PrivateGPT if you come from the previous, primordial version.

### Present and Future of PrivateGPT
PrivateGPT is now evolving towards becoming a gateway to generative AI models and primitives, including
completions, document ingestion, RAG pipelines and other low-level building blocks.
We want to make it easier for any developer to build AI applications and experiences, as well as provide
a suitable extensive architecture for the community to keep contributing.

Stay tuned to our [releases](https://github.com/zylon-ai/private-gpt/releases) to check out all the new features and changes included.

## 📄 Documentation
Full documentation on installation, dependencies, configuration, running the server, deployment options,
ingesting local documents, API details and UI features can be found here: https://docs.privategpt.dev/

## 🧩 Architecture
Conceptually, PrivateGPT is an API that wraps a RAG pipeline and exposes its
primitives.
* The API is built using [FastAPI](https://fastapi.tiangolo.com/) and follows
  [OpenAI's API scheme](https://platform.openai.com/docs/api-reference).
* The RAG pipeline is based on [LlamaIndex](https://www.llamaindex.ai/).

The design of PrivateGPT allows to easily extend and adapt both the API and the
RAG implementation. Some key architectural decisions are:
* Dependency Injection, decoupling the different components and layers.
* Usage of LlamaIndex abstractions such as `LLM`, `BaseEmbedding` or `VectorStore`,
  making it immediate to change the actual implementations of those abstractions.
* Simplicity, adding as few layers and new abstractions as possible.
* Ready to use, providing a full implementation of the API and RAG
  pipeline.

Main building blocks:
* APIs are defined in `private_gpt:server:<api>`. Each package contains an
  `<api>_router.py` (FastAPI layer) and an `<api>_service.py` (the
  service implementation). Each *Service* uses LlamaIndex base abstractions instead
  of specific implementations,
  decoupling the actual implementation from its usage.
* Components are placed in
  `private_gpt:components:<component>`. Each *Component* is in charge of providing
  actual implementations to the base abstractions used in the Services - for example
  `LLMComponent` is in charge of providing an actual implementation of an `LLM`
  (for example `LlamaCPP` or `OpenAI`).

## 💡 Contributing
Contributions are welcomed! To ensure code quality we have enabled several format and
typing checks, just run `make check` before committing to make sure your code is ok.
Remember to test your code! You'll find a tests folder with helpers, and you can run
tests using `make test` command.

Don't know what to contribute? Here is the public 
[Project Board](https://github.com/users/imartinez/projects/3) with several ideas. 

Head over to Discord 
#contributors channel and ask for write permissions on that GitHub project.

## 💬 Community
Join the conversation around PrivateGPT on our:
- [Twitter (aka X)](https://twitter.com/PrivateGPT_AI)
- [Discord](https://discord.gg/bK6mRVpErU)

## 📖 Citation
If you use PrivateGPT in a paper, check out the [Citation file](CITATION.cff) for the correct citation.  
You can also use the "Cite this repository" button in this repo to get the citation in different formats.

Here are a couple of examples:

#### BibTeX
```bibtex
@software{Zylon_PrivateGPT_2023,
author = {Zylon by PrivateGPT},
license = {Apache-2.0},
month = may,
title = {{PrivateGPT}},
url = {https://github.com/zylon-ai/private-gpt},
year = {2023}
}
```

#### APA
```
Zylon by PrivateGPT (2023). PrivateGPT [Computer software]. https://github.com/zylon-ai/private-gpt
```

## 🤗 Partners & Supporters
PrivateGPT is actively supported by the teams behind:
* [Qdrant](https://qdrant.tech/), providing the default vector database
* [Fern](https://buildwithfern.com/), providing Documentation and SDKs
* [LlamaIndex](https://www.llamaindex.ai/), providing the base RAG framework and abstractions

This project has been strongly influenced and supported by other amazing projects like 
[LangChain](https://github.com/hwchase17/langchain),
[GPT4All](https://github.com/nomic-ai/gpt4all),
[LlamaCpp](https://github.com/ggerganov/llama.cpp),
[Chroma](https://www.trychroma.com/)
and [SentenceTransformers](https://www.sbert.net/).

---

## 🚀 FB Bot Setup & Deployment

This FB Bot deployment uses Docker Compose to orchestrate 3 services that work together to provide a scalable, production-ready chatbot system.

### 📋 Requirements

- **Docker Desktop**: Version 20.10 or higher
- **OpenAI API Key**: Required for LLM and embeddings ([Get one here](https://platform.openai.com/api-keys))
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free space

### ⚡ Quick Start

**Windows (PowerShell):**
```powershell
# 1. Set OpenAI API key
$env:OPENAI_API_KEY = "your-openai-api-key-here"

# 2. Build and start all containers
docker compose -f docker-compose.prod.yml up -d --build

# 3. Access chatbot UI
# Open chatbot-test-ui.html in your browser
```

**Linux/macOS (Bash):**
```bash
# 1. Set OpenAI API key
export OPENAI_API_KEY="your-openai-api-key-here"

# 2. Build and start all containers
docker compose -f docker-compose.prod.yml up -d --build

# 3. Access chatbot UI
# Open chatbot-test-ui.html in your browser
```

### 🏗️ Docker Architecture

The application consists of **3 Docker containers** running in a shared Docker network:

#### 1. PrivateGPT Application (`private-gpt`)
- **Image**: `private-gpt:prod` (built from `Dockerfile`)
- **Port**: `8001:8001` (exposed to host)
- **Build**: Multi-stage Dockerfile using Python 3.11 and Poetry
- **Environment Variables**:
  - `OPENAI_API_KEY` - Passed from host environment
  - `PGPT_PROFILES=prod` - Uses production settings profile
  - `PORT=8001` - Application port
- **Volumes**:
  - `./local_data` → `/home/worker/app/local_data` (persistent data storage)
  - `./settings-prod.yaml` → `/home/worker/app/settings-prod.yaml` (read-only)
  - `./settings.yaml` → `/home/worker/app/settings.yaml` (base settings, read-only)
- **Dependencies**: Waits for `postgres` (healthy) and `qdrant` (started) before starting

#### 2. PostgreSQL (`postgres`)
- **Image**: `ankane/pgvector:latest` (PostgreSQL with vector extension)
- **Port**: `5432:5432` (exposed to host for direct access)
- **Database**: `privategpt`
- **Credentials**: `user/password`
- **Purpose**: Node store for document metadata and relationships
- **Health Check**: 
  - Command: `pg_isready -U user -d privategpt`
  - Interval: 5 seconds
  - Retries: 5
  - Ensures database is fully ready before `private-gpt` starts
- **Volumes**:
  - `postgres-data` (named volume) → `/var/lib/postgresql/data` (persistent storage)
  - `./init-pgvector.sql` → `/docker-entrypoint-initdb.d/01-init-pgvector.sql` (initializes vector extension on first run)

#### 3. Qdrant (`qdrant`)
- **Image**: `qdrant/qdrant:latest`
- **Ports**: 
  - `6333:6333` (HTTP API)
  - `6334:6334` (gRPC API)
- **Purpose**: Vector database for storing and querying document embeddings
- **Volumes**:
  - `qdrant-data` (named volume) → `/qdrant/storage` (persistent storage)

### 🔗 Container Communication

All containers run on the same **Docker network** created automatically by Compose, enabling service discovery by name.

#### How Services Connect:

1. **Docker Network**: Compose automatically creates a bridge network where all services can communicate using **service names as hostnames**.

2. **PrivateGPT → PostgreSQL**:
   - Connection string: `postgresql://user:password@postgres:5432/privategpt`
   - Uses service name `postgres` (not `localhost`)
   - Configured in `settings-prod.yaml`:
     ```yaml
     postgres:
       host: postgres  # Service name in docker-compose
       port: 5432
       database: privategpt
     ```

3. **PrivateGPT → Qdrant**:
   - Connection URL: `http://qdrant:6333`
   - Uses service name `qdrant` (not `localhost`)
   - Configured in `settings-prod.yaml`:
     ```yaml
     qdrant:
       url: http://qdrant:6333  # Service name in docker-compose
     ```

4. **Health Checks & Startup Order**:
   - `postgres` starts first and waits until healthy
   - `qdrant` starts next (quick to start)
   - `private-gpt` waits for both using `depends_on`:
     ```yaml
     depends_on:
       postgres:
         condition: service_healthy  # Waits until health check passes
       qdrant:
         condition: service_started   # Waits until container starts
     ```

#### Why Service Names Instead of `localhost`?

- **Inside containers**: Each container has its own network namespace, so `localhost` refers to that container only
- **Docker DNS**: Compose sets up DNS so service names resolve to container IPs automatically
- **Service Discovery**: `postgres` and `qdrant` are hostnames that resolve within the Docker network
- **Isolation**: Containers communicate via the Docker network, providing better isolation and security

### 📁 Configuration Files

#### `docker-compose.prod.yml`
- Defines all 3 services with dependencies
- Configures volumes for persistent data
- Sets up health checks and startup order
- Maps ports from containers to host

#### `settings-prod.yaml`
- Production configuration profile
- Database connection settings (using service names: `postgres`, `qdrant`)
- OpenAI API configuration (uses environment variable `${OPENAI_API_KEY:}`)
- CORS settings: `allow_origins: ["*"]` (for development)
- RAG settings: similarity threshold `0.80` (80% match required)

#### `Dockerfile`
- Multi-stage build for optimized image size
- Stage 1: Install Poetry and dependencies
- Stage 2: Copy virtual environment to final image
- Installs only required extras: `ui vector-stores-qdrant storage-nodestore-postgres llms-openai embeddings-openai`

### 🔧 Common Docker Commands

```powershell
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services (keeps containers)
docker compose -f docker-compose.prod.yml stop

# Stop and remove containers (keeps volumes/data)
docker compose -f docker-compose.prod.yml down

# Stop and remove everything including volumes (⚠️ deletes data)
docker compose -f docker-compose.prod.yml down -v

# View logs
docker compose -f docker-compose.prod.yml logs -f private-gpt
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f qdrant

# Restart a specific service
docker compose -f docker-compose.prod.yml restart private-gpt

# Rebuild after code changes
docker compose -f docker-compose.prod.yml up -d --build

# Check service status
docker compose -f docker-compose.prod.yml ps

# Access PostgreSQL shell
docker compose -f docker-compose.prod.yml exec postgres psql -U user -d privategpt
```

### ✅ Verification

After starting containers, verify everything is working:

```powershell
# Check PrivateGPT health
curl http://localhost:8001/health
# Expected: {"status":"ok"}

# Check PostgreSQL (from host)
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U user

# Check Qdrant (from host)
curl http://localhost:6333/health
# Expected: {"title":"qdrant - vector search engine"}

# View all running containers
docker compose -f docker-compose.prod.yml ps
# All 3 services should show "Up" status
```

### 🌐 Access Points

- **Custom Chatbot UI**: Open `chatbot-test-ui.html` in your browser
- **Default Gradio UI**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs (Swagger UI)
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **Health Check**: http://localhost:8001/health

### 🗄️ Data Persistence

Data is stored in **Docker named volumes**, which persist even if containers are removed:

- **`postgres-data`**: All PostgreSQL database data (documents metadata, nodes)
- **`qdrant-data`**: All Qdrant vector data (embeddings, collections)
- **`./local_data`**: Local files mounted from host (additional storage, if needed)

**⚠️ Important**: To completely reset the application and delete all data:
```powershell
docker compose -f docker-compose.prod.yml down -v
```

### 🐛 Troubleshooting

#### Containers won't start
```powershell
# Check Docker Desktop is running
docker ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs
```

#### PrivateGPT can't connect to PostgreSQL
- Verify `postgres` service is healthy: `docker compose -f docker-compose.prod.yml ps`
- Check logs: `docker compose -f docker-compose.prod.yml logs postgres`
- Ensure `settings-prod.yaml` uses `host: postgres` (not `localhost`)

#### PrivateGPT can't connect to Qdrant
- Check Qdrant is running: `curl http://localhost:6333/health`
- Verify `settings-prod.yaml` uses `url: http://qdrant:6333` (not `localhost`)
- Wait 30 seconds after starting containers for Qdrant to fully initialize

#### API Key not working
- Verify environment variable: `echo $env:OPENAI_API_KEY` (PowerShell)
- Restart containers after setting: `docker compose -f docker-compose.prod.yml restart private-gpt`

#### Port already in use
- Change port mappings in `docker-compose.prod.yml`
- Or stop conflicting services using ports 8001, 5432, 6333, 6334

### 📚 Additional Documentation

For more detailed information, see:
- **Detailed Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Docker Commands Reference**: [DOCKER_COMMANDS.md](DOCKER_COMMANDS.md)
- **Docker Setup Details**: [DOCKER_SETUP.md](DOCKER_SETUP.md)
