# Docker Production Setup Guide

This guide will help you set up PrivateGPT with scalable database storage using Docker.

## Files Created

1. **Dockerfile** - Multi-stage build for the application
2. **docker-compose.prod.yml** - Docker Compose configuration with PostgreSQL and Qdrant
3. **settings-prod.yaml** - Production settings using databases instead of local files
4. **init-pgvector.sql** - PostgreSQL extension initialization script

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key

## Setup Steps

### 1. Create .env file

Create a `.env` file in the project root with your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Note:** The `.env` file is already in `.gitignore`, so it won't be committed to git.

### 2. Build and Start Services

Run the following command to build and start all services:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This will:
- Build the PrivateGPT application image
- Start PostgreSQL with pgvector extension
- Start Qdrant vector database
- Start PrivateGPT application

### 3. Verify Services

Check that all services are running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

You should see all three services (private-gpt, postgres, qdrant) with status "Up".

### 4. Check Logs

View application logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f private-gpt
```

### 5. Access the Application

Once running, access the application at:
- **Web UI**: http://localhost:8001
- **API**: http://localhost:8001/api/v1

## What Changed?

### Before (Local Storage)
- Vector store: Local Qdrant files (`local_data/private_gpt/qdrant`)
- Node store: JSON files (`local_data/private_gpt/`)
- **Problem**: Everything loaded into memory → crashes with large datasets

### After (Database Storage)
- Vector store: Qdrant (Docker container) - persistent, scalable
- Node store: PostgreSQL with pgvector - persistent, scalable
- **Solution**: Data stored in databases → no memory limits

## Stopping Services

To stop all services:

```bash
docker-compose -f docker-compose.prod.yml down
```

To stop and remove volumes (⚠️ **WARNING**: This deletes all data):

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Data Persistence

- **PostgreSQL data**: Stored in Docker volume `postgres-data`
- **Qdrant data**: Stored in Docker volume `qdrant-data`
- **Local data**: Mounted from `./local_data` (for any remaining local files)

## Troubleshooting

### Service won't start
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify `.env` file exists with valid `OPENAI_API_KEY`
- Ensure ports 8001, 5432, 6333 are not in use

### Database connection errors
- Wait for PostgreSQL healthcheck to pass (check with `docker-compose ps`)
- Verify postgres service shows as "healthy"

### Memory issues persist
- Verify you're using `docker-compose.prod.yml` (not the old `docker-compose.yaml`)
- Check that `settings-prod.yaml` is being used (check logs for "Starting application with profiles=['prod']")

## Migration from Local Storage

If you have existing data in `local_data/`, you can migrate it:

1. Keep the old `local_data/` folder as backup
2. Start the new Docker setup
3. Re-upload your documents through the UI or API
4. The new system will store everything in databases

## Next Steps

1. Upload your 24 FDD documents through the web UI
2. Monitor memory usage - it should stay stable
3. Query the documents - responses should be faster and more reliable

