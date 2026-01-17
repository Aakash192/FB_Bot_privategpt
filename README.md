
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
