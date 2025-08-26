# Overview

This is a full-stack mini golf management system called "Madras Mini Golf" built as a single deployable Node.js application. The Express backend serves the built React frontend as static files, creating a unified application that simplifies deployment and hosting. The system provides a complete player experience for playing mini golf games and an administrative interface for managing pricing, sales analytics, and game data.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 2025)

## Single Environment Architecture (Latest)
- **Date**: August 25, 2025
- **Change**: Simplified project to run as single environment (no dev/prod split)
- **Impact**: Always builds and serves static files, eliminates development/production complexity
- **Benefits**: One consistent environment, simplified deployment, no environment-specific issues
- **Technical**: Modified server/index.ts to always serve static files, single startup process

## Single Deployable Application Architecture
- **Date**: August 17, 2025
- **Change**: Converted project from separate frontend/backend to unified Node.js application
- **Impact**: Frontend now bundles and serves from Express backend for simplified deployment
- **Benefits**: Single build process, unified hosting, easier deployment to any Node.js platform
- **Files Created**: DEPLOYMENT.md, ARCHITECTURE.md, build scripts, Docker configs

## Gameplay Interface Improvements
- **Date**: August 21, 2025
- **Change**: Simplified score input system by removing increment/decrement buttons
- **Impact**: Cleaner mobile interface with manual input for scores 7+ 
- **Benefits**: Reduced interface complexity, better mobile experience, faster score entry
- **Details**: Input box shows "7+" placeholder, accepts any number 1-20, compact total score display

## Railway Deployment Documentation
- **Date**: August 21, 2025
- **Change**: Created comprehensive Railway deployment guide
- **Impact**: Complete step-by-step instructions for production deployment
- **Benefits**: Easy Railway deployment with PostgreSQL, automated build process
- **Files Created**: RAILWAY_DEPLOYMENT.md with detailed deployment steps

# System Architecture

## Application Architecture
This is a **single deployable Node.js application** that serves both frontend and backend:

### Single Environment Mode (Current)
- **Unified Server**: Always builds and serves React app as static files + API routes
- **Static Assets**: Frontend automatically built into dist/public/ directory
- **Single Process**: One consistent Node.js process handles all requests
- **No Environment Split**: Eliminated development/production complexity
- **Simple Startup**: Build → Serve, no conditional logic
- **Deployment**: Single application package for any hosting platform

## Frontend Architecture
The client-side application is built with React and TypeScript:

- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed color variables
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod schema validation
- **Animation**: Framer Motion for smooth UI transitions
- **Build**: Vite bundles frontend into static assets served by Express

## Backend Architecture
Express.js server with integrated frontend serving:

- **API Layer**: RESTful routes with proper error handling and logging
- **Static Serving**: Built React app served as static files in production
- **Data Layer**: Abstracted storage interface with PostgreSQL implementation
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: bcrypt for password hashing and session-based authentication
- **Database**: Auto-detection between Neon (cloud) and local PostgreSQL

## Database Design
Uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Schema Management**: Centralized schema definitions in shared directory for type consistency
- **Relations**: Proper foreign key relationships between users, players, games, scores, and pricing
- **Data Types**: Uses UUIDs for primary keys, decimal types for monetary values, and arrays for player names
- **Migration Strategy**: Drizzle Kit for schema migrations and database versioning

Key entities include users (admin), players, games, scores, and pricing history with proper relational integrity.

## Development Environment
Configured for modern development with unified production deployment:

- **Build System**: Vite for frontend development + production bundling
- **Backend Build**: ESBuild for server bundling and optimization
- **TypeScript**: Strict type checking across all code
- **Path Mapping**: @ aliases for clean imports
- **Hot Reload**: Vite HMR in development, static serving in production
- **Single Port**: Development and production both use port 5000
- **Unified Deployment**: Single Node.js application for hosting simplicity

## Authentication & Authorization
Simple but effective security model:

- **Admin Authentication**: Session-based login for administrative functions
- **Player Flow**: Registration-based system using sessionStorage for game continuity
- **Route Protection**: Middleware-based route protection for admin endpoints
- **Session Storage**: PostgreSQL-backed sessions for persistence and scalability

## Game Flow Architecture
Designed for intuitive mini golf experience:

- **Registration**: Player details capture with validation
- **Game Setup**: Dynamic player count selection and name collection
- **Scoring**: Hole-by-hole score tracking with validation
- **Results**: Comprehensive score calculation and leaderboard display
- **Pricing**: Dynamic weekend/weekday pricing with administrative controls

## Analytics & Reporting
Comprehensive sales and performance tracking:

- **Time-based Analytics**: Daily, weekly, monthly, and hourly sales breakdowns
- **Revenue Tracking**: Automatic cost calculation based on player count and pricing
- **Game Statistics**: Player counts, game completion tracking, and historical data
- **Admin Dashboard**: Real-time metrics and trend visualization

# External Dependencies

## Database & ORM
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Design System
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Animation library for smooth user interactions

## Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **React Query**: Server state management with caching and synchronization
- **Zod**: Runtime type validation for forms and API data

## Authentication & Security
- **bcryptjs**: Password hashing for secure credential storage
- **express-session**: Session management middleware
- **React Hook Form**: Performant form handling with validation

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **class-variance-authority**: Component variant management
- **wouter**: Lightweight React router