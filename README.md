# BIP! Services API

RESTful API for accessing citation-based impact indicators the BIP! Services. This service provides ranking scores and bibliometric indicators for scientific publications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Development](#development)
- [Technology Stack](#technology-stack)
- [Security](#security)
- [License](#license)


## Prerequisites

- **Node.js**: v14.x or higher
- **MySQL**: v5.7 or higher (or MySQL 8.x)
- **npm**: v6.x or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bip-finder-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration (see [Configuration](#configuration))

4. **Set up the database**
   - Create a MySQL database
   - Import your schema and data
   - Update database credentials in `.env`

## Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_db_user
MYSQL_PASS=your_db_password
MYSQL_DBNAME=bcn_papers
MYSQL_PORT=3306

# Server Configuration
HOSTNAME=localhost
NODE_ENV=development

# Security - JWT Secret
# Generate with: openssl rand -base64 48
JWT_SECRET=your-cryptographically-secure-secret-here
```

### Important Security Notes

- **JWT_SECRET**: Generate a strong random secret using `openssl rand -base64 48`
- **Never commit** `.env` to version control (already in `.gitignore`)
- **Use different secrets** for development, staging, and production environments

## Running the Application

### Development Mode

```bash
npm start
```

The server will start on port **4000** (configurable via environment).

### Docker Development

#### Prerequisites
- Docker and Docker Compose installed
- Existing MariaDB/MySQL instance running on port 3306
- `.env` file configured (see [Configuration](#configuration))

#### Quick Start with Docker

**Using the deployment script (Recommended):**
```bash
# Make script executable (first time only)
chmod +x deployment.sh

# Start the application
./deployment.sh start

# View logs
./deployment.sh logs

# Stop the application
./deployment.sh stop

# Check status
./deployment.sh status
```

**Manual Docker Compose commands:**
```bash
# Build and run the application
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f bip-api

# Stop the application
docker compose down
```

#### Docker Configuration

The application uses:
- **Node.js 24** Alpine image for consistency with local development
- **Host networking** to connect to your existing MariaDB container
- **Environment variables** loaded from `.env` file
- **Volume mapping** for log files (`./log:/app/log`)

#### Connecting to Existing Database

The Docker setup assumes you have a MariaDB container running (like `mariadb11`). Update your `.env` file:

```bash
# For Docker, use host.docker.internal to connect to host services
MYSQL_HOST=host.docker.internal
# ... other variables remain the same
```

#### Docker Development Commands

**Using the deployment script:**
```bash
# Start services
./deployment.sh start

# Stop services
./deployment.sh stop

# View live logs
./deployment.sh logs

# Restart application
./deployment.sh restart

# Check service status
./deployment.sh status

# Build without starting
./deployment.sh build

# Show help
./deployment.sh
```

**Manual Docker Compose commands:**
```bash
# Build only
docker compose build

# Run with live logs
docker compose up

# Restart application only
docker compose restart bip-api

# View application logs
docker compose logs -f bip-api

# Execute commands inside container
docker compose exec bip-api sh

# Clean up (removes containers and volumes)
docker compose down -v
```

### Production Deployment

#### Using Docker (Recommended for Production)

For production deployment with Docker:

```bash
# Build production image
docker build -t bip-services-api .

# Run with production environment
docker run -d \
  --name bip-services-api \
  --restart unless-stopped \
  -p 4000:4000 \
  --env-file .env \
  -v /path/to/logs:/app/log \
  bip-finder-api
```

Create `.env.production` with production settings:
```bash
NODE_ENV=live
MYSQL_HOST=your-production-db-host
MYSQL_USER=your-production-user
MYSQL_PASS=your-production-password
MYSQL_DBNAME=bcn_papers
MYSQL_PORT=3306
HOSTNAME=0.0.0.0
JWT_SECRET=your-production-jwt-secret
```

#### Using PM2 (Alternative)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name bip-finder-api

# View logs
pm2 logs bip-finder-api

# Restart
pm2 restart bip-finder-api

# Stop
pm2 stop bip-finder-api

# Auto-start on system reboot
pm2 startup
pm2 save
```

#### Using Forever

```bash
# Install Forever globally
npm install -g forever

# Start the application
forever start server.js

# View running processes
forever list

# Stop the application
forever stop server.js
```

## API Documentation

Access the Swagger UI at: `http://localhost:4000/documentation`

## Deployment

### Environment-Specific Configuration

- **Development**: Set `NODE_ENV=development` for detailed console logging
- **Production**: Set `NODE_ENV=live` for file-based logging only

## Development

### Project Structure

```
bip-finder-api/
├── config/              # Configuration files
├── modules/
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── libs/            # Utility functions
│   ├── logger/          # Winston logging setup
│   └── databaseInteractions/  # Database query layer
├── bootstrap.js         # Database initialization
├── server.js           # Application entry point
├── package.json        # Dependencies
└── env.example         # Environment template
```

### Key Files

- `server.js`: Hapi server setup, plugin registration
- `bootstrap.js`: MySQL connection pool initialization
- `config/default.js`: Application configuration
- `modules/routes/`: API route definitions with Joi validation
- `modules/controllers/`: Business logic and data processing

## Technology Stack

### Core Framework
- **Hapi.js v20**: Web framework
- **Joi v17**: Request validation
- **MySQL2 v3**: Database driver with connection pooling
- **Node.js v24**: Runtime environment

### Plugins & Middleware
- **hapi-swagger v14**: API documentation
- **@hapi/inert & @hapi/vision**: Static file and template support
- **hapi-auth-bearer-token**: Bearer token authentication
- **@hapi/boom**: HTTP error responses

### Utilities
- **axios**: HTTP client for external API calls
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation/verification
- **winston**: Logging framework
- **lodash**: Utility functions

### Development Tools
- **nodemon**: Development auto-restart
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **deployment.sh**: Automated deployment script

### Recent Upgrades

This project was recently upgraded to modern dependencies. See `UPGRADE_SUMMARY.md` for details:
- Hapi v18 → v20 (@hapi scoped packages)
- mysql → mysql2
- request-promise → axios
- Q promises → native Promises
- Winston v2 → v3
- Added Docker support
- Added nodemon for development
- Added automated deployment script

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See `CONTRIBUTING.md` for detailed guidelines.

## License

See `LICENSE` file for details.

## Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: `/documentation` endpoint (Swagger UI)
- **Contact**: bip@athenarc.gr

---

**Maintained by**: the Sknow Lab  
**Project**: BIP! Services API
