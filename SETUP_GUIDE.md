# PrivateGPT Chatbot - Setup Guide

## 📋 Requirements

### System Requirements
- **OS**: Windows 10/11, Linux, or macOS
- **Docker Desktop**: Version 20.10 or higher
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free space

### Software Requirements
- Docker Desktop installed and running
- Git (for cloning the repository)
- PowerShell (Windows) or Bash (Linux/macOS)

### API Requirements
- **OpenAI API Key**: Required for LLM and embeddings
  - Sign up at: https://platform.openai.com/
  - Create API key: https://platform.openai.com/api-keys
  - Store in environment variable: `OPENAI_API_KEY`

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Aakash192/FB_Bot_privategpt.git
cd FB_Bot_privategpt
```

### 2. Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "your-openai-api-key-here"
```

**Linux/macOS (Bash):**
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

**Permanent Setup (Windows):**
- Go to System Properties → Environment Variables
- Add `OPENAI_API_KEY` as a new user variable

**Permanent Setup (Linux/macOS):**
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Build and Start Docker Containers

```powershell
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f private-gpt
```

### 4. Verify Installation

**Check Backend Health:**
```powershell
# Health check
curl http://localhost:8001/health

# Expected: {"status":"ok"}
```

**Test Chat API:**
```powershell
# PowerShell
$body = @{
    model = "gpt-3.5-turbo"
    messages = @(
        @{
            role = "user"
            content = "Hello, test message"
        }
    )
    use_context = $false
    stream = $false
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:8001/v1/chat/completions" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### 5. Access the Chatbot UI

**Option 1: Custom UI (Recommended)**
- Open `chatbot-test-ui.html` in your browser
- Or use the provided PowerShell script:
```powershell
.\serve-chatbot.ps1
```

**Option 2: Default Gradio UI**
- Open: http://localhost:8001

## 🏗️ Docker Architecture

The application uses Docker Compose with 3 services:

### 1. PrivateGPT Application (`private-gpt`)
- **Image**: `private-gpt:prod` (built from `Dockerfile`)
- **Port**: `8001:8001`
- **Environment**: 
  - `OPENAI_API_KEY` (from environment variable)
  - `PGPT_PROFILES=prod`
- **Volumes**:
  - `./local_data` → `/home/worker/app/local_data` (persistent data)
  - `./settings-prod.yaml` → settings file

### 2. PostgreSQL (`postgres`)
- **Image**: `ankane/pgvector:latest`
- **Port**: `5432:5432`
- **Database**: `privategpt`
- **User/Password**: `user/password`
- **Purpose**: Node store for document metadata
- **Health Check**: Enabled (waits for DB to be ready)

### 3. Qdrant (`qdrant`)
- **Image**: `qdrant/qdrant:latest`
- **Ports**: `6333:6333` (HTTP), `6334:6334` (gRPC)
- **Purpose**: Vector database for embeddings

## 📁 Configuration Files

### Production Settings (`settings-prod.yaml`)
- Uses environment variables for API keys: `${OPENAI_API_KEY:}`
- CORS enabled: `allow_origins: ["*"]`
- RAG similarity threshold: `0.80` (80% match required)
- Database connections to `postgres` and `qdrant` services

### Docker Compose (`docker-compose.prod.yml`)
- Defines all 3 services with proper dependencies
- Volume mounts for persistent data
- Health checks for reliable startup

## 🔧 Common Commands

### Container Management
```powershell
# Start all containers
docker compose -f docker-compose.prod.yml up -d

# Stop all containers
docker compose -f docker-compose.prod.yml down

# Restart a specific service
docker compose -f docker-compose.prod.yml restart private-gpt

# View logs
docker compose -f docker-compose.prod.yml logs -f [service-name]

# Rebuild containers after code changes
docker compose -f docker-compose.prod.yml up -d --build
```

### Data Management
```powershell
# Ingest documents into the knowledge base
# (Use the ingest API or scripts/ingest_folder.py)

# Access PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U user -d privategpt

# Access Qdrant UI
# Open: http://localhost:6333/dashboard
```

## 📝 Ingestion Workflow

1. **Prepare Documents**: Place files in a folder (PDF, TXT, DOCX, etc.)
2. **Ingest via API**: Use the `/v1/ingest` endpoint
3. **Or Use Script**: `python scripts/ingest_folder.py <folder-path>`
4. **Verify**: Check collections in Qdrant dashboard

## 🔒 Security Notes

- **API Keys**: Never commit `settings.yaml` or `settings-openai.yaml` (they contain hardcoded keys)
- **Use Environment Variables**: Always use `${OPENAI_API_KEY:}` pattern in production
- **CORS**: Currently set to `["*"]` for development - restrict in production

## 🐛 Troubleshooting

### Containers won't start
```powershell
# Check Docker Desktop is running
docker ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs
```

### API Key not working
- Verify environment variable is set: `echo $env:OPENAI_API_KEY` (PowerShell)
- Restart containers after setting: `docker compose -f docker-compose.prod.yml restart`

### Port already in use
- Change port mapping in `docker-compose.prod.yml`
- Or stop conflicting services using those ports

### Qdrant connection errors
- Wait 30 seconds after starting containers
- Check Qdrant is running: `docker ps | findstr qdrant`
- Verify health: `curl http://localhost:6333/health`

## 📚 Additional Resources

- **API Documentation**: http://localhost:8001/docs (Swagger UI)
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **Project README**: See `README.md` for more details

## 🆘 Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Review this setup guide
3. Check Docker Desktop is running
4. Verify all environment variables are set correctly

