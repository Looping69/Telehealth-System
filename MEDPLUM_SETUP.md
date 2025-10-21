# Medplum FHIR Server Setup Guide

This guide explains how to set up and run a self-hosted Medplum FHIR server using Docker for your telehealth application.

## 🚀 Quick Start (One Command)

```bash
# Start Medplum FHIR server
npm run medplum:start

# Or use the PowerShell script
./start-medplum.ps1
```

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js and npm installed
- ✅ PowerShell (for Windows users)

## Services Included

The simplified Docker setup includes:

1. **PostgreSQL Database** (port 5432)
   - Database: `medplum`
   - Username: `medplum`
   - Password: `medplum123`
   - Auto-initialized with required extensions

2. **Redis Cache** (port 6379)
   - No password required (simplified setup)

3. **Medplum FHIR Service** (Local Development)
   - Base URL: `http://localhost:8103`
   - FHIR API: `http://localhost:8103/fhir/R4/`
   - Admin Interface: `http://localhost:8103/admin/`
   - Self-hosted Medplum server for development

## Available Commands

```bash
# Start all services
npm run medplum:start

# Stop all services
npm run medplum:stop

# Restart all services
npm run medplum:restart

# View logs (follow mode)
npm run medplum:logs

# Check service status
npm run medplum:status

# Reset everything (removes all data)
npm run medplum:reset
```

## Configuration

The telehealth app is configured to connect to the hosted Medplum service:

- **Base URL**: `https://api.medplum.com`
- **Client ID**: Configure with your Medplum project credentials
- **FHIR Endpoint**: `https://api.medplum.com/fhir/R4/`

## 🎯 First Time Setup

1. **Start Docker Desktop**
   ```bash
   # Make sure Docker is running
   docker version
   ```

2. **Run the startup script**:
   ```bash
   ./start-medplum.ps1
   ```
   Or use npm:
   ```bash
   npm run medplum:start
   ```

3. **Wait for services to be ready** (usually 1-3 minutes)
   - The script will automatically wait and test the connection
   - You'll see a success message when ready

4. **Start your telehealth app**:
   ```bash
   npm run dev
   ```

## Accessing the Medplum Service

- **FHIR API**: `https://api.medplum.com/fhir/R4/`
- **Metadata Endpoint**: `https://api.medplum.com/fhir/R4/metadata`
- **Health Check**: Available through Medplum's hosted infrastructure

### Quick Test

```bash
# Test if the service is responding
curl https://api.medplum.com/fhir/R4/metadata

# Or using PowerShell
Invoke-WebRequest -Uri "https://api.medplum.com/fhir/R4/metadata"
```

## 🔧 Troubleshooting

### Services won't start
```bash
# Check if Docker is running
docker version

# Check if ports are available
netstat -an | findstr "8103\|5432\|6379"

# View detailed logs
npm run medplum:logs
```

### Connection issues
```bash
# Check service status
npm run medplum:status

# Wait for all services to be ready
npm run medplum:logs

# Test the connection to hosted service
curl https://api.medplum.com/fhir/R4/metadata
```

### Server keeps restarting
```bash
# Check logs for errors
docker-compose -f docker-compose.simple.yml logs medplum-server

# Common issues:
# - Database not ready (wait longer)
# - Port conflicts (check if 8103 is free)
# - Memory issues (increase Docker memory limit)
```

### Reset everything
```bash
# Stop services and remove all data
npm run medplum:reset

# Start fresh
npm run medplum:start
```

## 📊 Monitoring

### Check service health
```bash
# Quick status check
npm run medplum:status

# Detailed container info
docker-compose -f docker-compose.simple.yml ps -a

# Resource usage
docker stats
```

### View logs
```bash
# All services
npm run medplum:logs

# Specific service
docker-compose -f docker-compose.simple.yml logs medplum-server
docker-compose -f docker-compose.simple.yml logs postgres
docker-compose -f docker-compose.simple.yml logs redis
```

## Environment Variables

You can customize the setup by creating a `.env` file:

```env
# Medplum Configuration
VITE_MEDPLUM_BASE_URL=https://api.medplum.com
VITE_MEDPLUM_CLIENT_ID=medplum-client

# Database Configuration (if needed)
POSTGRES_DB=medplum
POSTGRES_USER=medplum
POSTGRES_PASSWORD=medplum123
```

## 🔒 Security Notes

This setup is optimized for **development use**. For production:

1. **Change default passwords**
2. **Use proper SSL certificates**
3. **Configure proper backup strategies**
4. **Set up monitoring and logging**
5. **Use environment-specific configuration files**
6. **Enable authentication and authorization**

## 📈 Performance Tips

- **Increase Docker memory**: Set Docker Desktop to use at least 4GB RAM
- **Use SSD storage**: Store Docker volumes on SSD for better performance
- **Monitor resources**: Use `docker stats` to check resource usage

## 🆘 Support

If you encounter issues:

1. **Check the logs**: `npm run medplum:logs`
2. **Verify Docker is running**: `docker version`
3. **Check service health**: `npm run medplum:status`
4. **Test connectivity**: `curl https://api.medplum.com/fhir/R4/metadata`
5. **Restart services**: `npm run medplum:restart`
6. **Reset if needed**: `npm run medplum:reset`

## 🎉 Success Indicators

You know everything is working when:

- ✅ All containers show "healthy" status
- ✅ `https://api.medplum.com/fhir/R4/metadata` returns JSON
- ✅ Your telehealth app connects without errors
- ✅ No error messages in the logs

---

**Happy coding! 🚀** Your self-hosted Medplum FHIR server is ready to power your telehealth application.