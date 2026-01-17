# Docker Commands Quick Reference

## Stopping Services

### Stop all services (keeps containers)
```powershell
docker compose -f docker-compose.prod.yml stop
```

### Stop and remove containers (keeps volumes/data)
```powershell
docker compose -f docker-compose.prod.yml down
```

### Stop and remove everything including volumes (⚠️ deletes data)
```powershell
docker compose -f docker-compose.prod.yml down -v
```

## Starting Services

### Start all services
```powershell
docker compose -f docker-compose.prod.yml up -d
```

### Start and rebuild if needed
```powershell
docker compose -f docker-compose.prod.yml up -d --build
```

### Start and view logs
```powershell
docker compose -f docker-compose.prod.yml up
```
(Press Ctrl+C to stop, but containers will keep running)

## Useful Commands

### View running containers
```powershell
docker compose -f docker-compose.prod.yml ps
```

### View logs
```powershell
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f private-gpt
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f qdrant
```

### Restart a specific service
```powershell
docker compose -f docker-compose.prod.yml restart private-gpt
```

### Check service health
```powershell
docker compose -f docker-compose.prod.yml ps
curl http://localhost:8001/health
```

## Quick Start/Stop Scripts

### Windows PowerShell Scripts

**stop.ps1** - Stop all services:
```powershell
docker compose -f docker-compose.prod.yml down
```

**start.ps1** - Start all services:
```powershell
docker compose -f docker-compose.prod.yml up -d
```

**restart.ps1** - Restart all services:
```powershell
docker compose -f docker-compose.prod.yml restart
```


