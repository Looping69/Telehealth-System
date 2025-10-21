# Telehealth System - Complete FHIR Healthcare Platform

A comprehensive React-based telehealth system with full Medplum FHIR integration, dual-mode functionality, and production-ready deployment on Vercel.

## 🌐 Live Demo

**🚀 [View Live Application](https://telehealth-system-woad.vercel.app/)**

The application is deployed on Vercel and ready for immediate use. You can explore all features in Mock Data mode without any setup required.

## 🚀 Features

### Core Healthcare Functionality
- **Complete Patient Management**: Comprehensive patient records, demographics, medical history
- **Appointment Scheduling**: Video and in-person sessions with provider management
- **Clinical Orders**: Lab orders, prescriptions, and diagnostic requests
- **Task Management**: Healthcare workflow automation and tracking
- **Billing & Insurance**: Invoice management and insurance claim processing
- **Messaging System**: Secure healthcare communication
- **Form Builder**: Dynamic FHIR Questionnaire creation and management
- **Audit Trail**: Complete system activity logging and compliance

### Technical Excellence
- **Dual-Mode Operation**: Seamlessly switch between Mock Data and Live FHIR modes
- **Medplum FHIR Integration**: Full FHIR R4 compliance with real-time API calls
- **Cloud Deployment**: Production-ready deployment on Vercel with automatic CI/CD
- **Modern React Stack**: React 19, TypeScript, Mantine UI, React Query
- **Self-Hosted Infrastructure**: PostgreSQL database, Redis cache, Nginx reverse proxy
- **Role-Based Access Control**: Comprehensive permission system for healthcare roles
- **Error Handling**: Graceful fallbacks and comprehensive error management
- **TypeScript**: 100% TypeScript coverage with strict type checking

## 🏗️ Architecture

### Application Modes
The system operates in two distinct modes:

#### 1. **Mock Data Mode** (Default)
- Uses comprehensive mock healthcare data
- Perfect for development, testing, and demonstrations
- No external dependencies required
- Includes realistic patient scenarios and clinical workflows

#### 2. **Live FHIR Mode** (Production)
- Connects to self-hosted Medplum FHIR server
- Real-time healthcare data management
- Full FHIR R4 compliance
- Production-ready with PostgreSQL and Redis

### Mode Switching
Users can toggle between modes using the integrated mode switcher in the navigation bar, providing seamless transition between mock and live data environments.

## 📋 Prerequisites

- **Node.js 18+** (Recommended: Node.js 22.14.0 or later)
- **npm** or **yarn** (Package manager)
- **Git** (for version control)
- **Docker & Docker Compose** (optional, for local FHIR server setup)

## 🚀 Quick Start

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd "Telehealth System"
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application available at: `http://localhost:5173` (Vite default port)

3. **Access the System**
   - Default mode: Mock Data (no additional setup required)
   - Switch to Live FHIR mode using the navigation toggle

### Vercel Deployment (Recommended)

The application is optimized for Vercel deployment with automatic CI/CD:

1. **Fork the Repository**
2. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect the Vite configuration
3. **Deploy**
   - Automatic deployments on every push to main branch
   - Preview deployments for pull requests

### Local Docker Deployment (Optional)

For local FHIR server development:

```bash
# Start Medplum FHIR server locally
npm run medplum:start

# Start development with local FHIR
npm run dev

# Services available at:
# - Telehealth App: http://localhost:5173
# - Medplum Server: http://localhost:8103
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

## 🏥 Healthcare Pages & Features

### Core Clinical Pages
1. **Dashboard** - Healthcare metrics, patient overview, appointment summary
2. **Patients** - Complete patient management with FHIR Patient resources
3. **Sessions** - Appointment scheduling with FHIR Appointment resources
4. **Orders** - Clinical orders using FHIR ServiceRequest resources
5. **Tasks** - Workflow management with FHIR Task resources
6. **Messages** - Secure communication using FHIR Communication resources

### Administrative Pages
7. **Invoices** - Billing management with FHIR Invoice resources
8. **Insurance** - Coverage management with FHIR Coverage resources
9. **Providers** - Healthcare provider management with FHIR Practitioner resources
10. **Pharmacies** - Pharmacy network with FHIR Organization resources
11. **Products** - Medical products and supplies
12. **Resources** - Clinical resources and documentation

### System Management
13. **Forms** - Dynamic form creation with FHIR Questionnaire resources
14. **Settings** - System configuration and preferences
15. **Tags** - Content organization and categorization
16. **Audit** - System activity logging and compliance tracking
17. **Discounts** - Pricing and discount management

Each page includes both Mock Data and Medplum-integrated versions with real FHIR API calls.

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Medplum Configuration (Online Hosted Service)
VITE_MEDPLUM_BASE_URL=https://api.medplum.com
MEDPLUM_BASE_URL=https://api.medplum.com
MEDPLUM_ADMIN_EMAIL=admin@example.com
MEDPLUM_ADMIN_PASSWORD=admin123

# Medplum Client Configuration
VITE_MEDPLUM_CLIENT_ID=demo-client-id
VITE_MEDPLUM_ADMIN_EMAIL=admin@example.com
VITE_MEDPLUM_ADMIN_PASSWORD=admin123

# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=medplum
POSTGRES_PASSWORD=medplum
POSTGRES_DB=medplum
DATABASE_URL=postgresql://medplum:medplum@localhost:5432/medplum

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=medplum
REDIS_URL=redis://:medplum@localhost:6379

# Development Environment
NODE_ENV=development
VITE_NODE_ENV=development
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking

# Medplum FHIR Server (Local Development)
npm run medplum:start    # Start local Medplum server
npm run medplum:stop     # Stop local Medplum server
npm run medplum:restart  # Restart local Medplum server
npm run medplum:logs     # View Medplum server logs
npm run medplum:status   # Check Medplum server status
npm run medplum:reset    # Reset Medplum server (removes all data)
```

## 📁 Project Structure

```
telehealth-system/
├── 🚀 Deployment Configuration
│   ├── vercel.json                # Vercel deployment config
│   ├── docker-compose.simple.yml  # Local Medplum FHIR server
│   ├── nginx.conf                 # Nginx reverse proxy config
│   └── .vercelignore              # Vercel build optimization
│
├── 📱 Application Source
│   ├── src/
│   │   ├── App.tsx                # Main application with routing
│   │   ├── index.tsx              # Application entry point
│   │   │
│   │   ├── 🏥 Healthcare Pages (Dual Mode)
│   │   ├── pages/
│   │   │   ├── Dashboard/         # Mock data version
│   │   │   ├── Dashboard-Medplum/ # Live FHIR version
│   │   │   ├── Patients/          # Mock data version
│   │   │   ├── Patients-Medplum/  # Live FHIR version
│   │   │   └── ... (16 page pairs total)
│   │   │
│   │   ├── 🧩 Components
│   │   ├── components/
│   │   │   ├── layout/            # Navigation, layout components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── common/            # Shared UI components
│   │   │   └── forms/             # Form components
│   │   │
│   │   ├── ⚙️ Configuration
│   │   ├── config/
│   │   │   └── medplum.ts         # Medplum client configuration
│   │   │
│   │   ├── 🎣 Hooks & State
│   │   ├── hooks/
│   │   │   ├── useMedplum.ts      # Medplum integration hooks
│   │   │   └── useQuery.ts        # Data fetching hooks
│   │   ├── contexts/
│   │   │   └── ModeContext.tsx    # Mode switching context
│   │   └── store/
│   │       └── authStore.ts       # Authentication state
│   │
│   ├── 📄 Configuration Files
│   ├── package.json               # Dependencies and scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite build configuration
│   └── .env                       # Environment variables
│
└── 📚 Documentation
    ├── README.md                  # This file
    └── ARCHITECTURE_DIAGRAM.md    # System architecture
```

## 👥 User Roles & Permissions

The system supports comprehensive role-based access control:

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **Super Admin** | Full system access, all CRUD operations | Complete |
| **Healthcare Provider** | Patient care, clinical operations, form builder | Clinical |
| **Practice Manager** | Management operations, form builder, reporting | Administrative |
| **Receptionist** | Appointment management, limited patient access | Front Office |
| **Billing Specialist** | Billing, insurance, financial operations | Financial |

## 🔒 Security Features

- **FHIR Compliance**: Full FHIR R4 standard compliance
- **Role-Based Access**: Granular permission system
- **Secure Authentication**: Medplum OAuth integration
- **Data Encryption**: Secure data transmission and storage
- **Audit Logging**: Complete activity tracking
- **CORS Protection**: Secure cross-origin resource sharing
- **Security Headers**: Comprehensive HTTP security headers

## 🚀 Deployment Options

### 1. Vercel (Recommended)
- **Live Demo**: [https://telehealth-system-woad.vercel.app/](https://telehealth-system-woad.vercel.app/)
- Automatic CI/CD from GitHub
- Global CDN distribution
- Serverless functions support
- Zero configuration deployment
- Preview deployments for PRs

### 2. Local Development
- Mock data mode for immediate development
- Hot reloading with Vite
- TypeScript type checking
- No external dependencies required

### 3. Local FHIR Development
- Complete healthcare stack with local Medplum server
- PostgreSQL database
- Redis caching
- Admin interface included
- Full FHIR R4 compliance testing

## 🔧 Troubleshooting

### Common Issues

#### 1. **Mode Switching Not Working**
- Ensure Medplum server is running: `docker-compose -f docker-compose.dev.yml up -d`
- Check environment variables in `.env` file
- Verify network connectivity to Medplum hosted service

#### 2. **Local FHIR Server Issues**
```bash
# Check Medplum server status
npm run medplum:status

# View Medplum logs
npm run medplum:logs

# Restart Medplum server
npm run medplum:restart
```

#### 3. **Authentication Errors**
- Verify Medplum credentials in `.env`
- Check Medplum service status: `curl https://api.medplum.com/fhir/R4/metadata`
- Ensure client ID matches Medplum configuration

#### 4. **Database Connection Issues**
```bash
# Reset local Medplum server and database
npm run medplum:reset

# Start fresh Medplum server
npm run medplum:start
```

#### 5. **Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Clean build
npm run build
```

### Windows-Specific Notes
- Uses PowerShell-compatible commands
- WSL support for Linux-style development
- VS Code integration ready
- Windows Terminal compatibility

## 🔄 Development Workflow

1. **Start Development**: `npm run dev` (Mock data mode)
2. **Test Features**: Use mock data for rapid development
3. **Enable FHIR**: `npm run medplum:start` for live data testing
4. **Switch Modes**: Use navigation toggle to test both modes
5. **Build Production**: `npm run build` for deployment
6. **Deploy**: Push to GitHub for automatic Vercel deployment

## 📚 Resources

### Medplum & FHIR
- [Medplum Documentation](https://www.medplum.com/docs)
- [FHIR R4 Specification](https://www.hl7.org/fhir/)
- [Medplum React Components](https://www.medplum.com/docs/react)

### Development Tools
- [React 19 Documentation](https://react.dev/)
- [Mantine UI Components](https://mantine.dev/)
- [Vite Build Tool](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)

## 📄 License

ISC License - See LICENSE file for details.

---

**Built with ❤️ for Healthcare Innovation**

This telehealth system provides a complete, production-ready platform for healthcare organizations looking to implement FHIR-compliant digital health solutions with modern web technologies.