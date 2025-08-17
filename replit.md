# Overview

This is a full-stack mini golf management system called "Madras Mini Golf" built as a single deployable Node.js application. The Express backend serves the built React frontend as static files, creating a unified application that simplifies deployment and hosting. The system provides a complete player experience for playing mini golf games and an administrative interface for managing pricing, sales analytics, and game data.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key decisions:

- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom golf-themed color variables and responsive design
- **State Management**: React Query (TanStack Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod schema validation for type-safe form handling
- **Animation**: Framer Motion for smooth UI animations and transitions

The application follows a page-based structure with separate flows for players and administrators, implementing proper authentication checks and session management.

## Backend Architecture
The server is built with Express.js and follows a clean separation of concerns:

- **API Layer**: RESTful Express routes with proper error handling and request logging
- **Data Layer**: Abstracted storage interface with concrete database implementation
- **Session Management**: Express sessions with PostgreSQL storage for authentication
- **Security**: bcrypt for password hashing and session-based authentication

The backend implements a repository pattern through the IStorage interface, allowing for easy testing and potential database swapping.

## Database Design
Uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Schema Management**: Centralized schema definitions in shared directory for type consistency
- **Relations**: Proper foreign key relationships between users, players, games, scores, and pricing
- **Data Types**: Uses UUIDs for primary keys, decimal types for monetary values, and arrays for player names
- **Migration Strategy**: Drizzle Kit for schema migrations and database versioning

Key entities include users (admin), players, games, scores, and pricing history with proper relational integrity.

## Development Environment
Configured for modern development workflow:

- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Path Mapping**: Organized imports with @ aliases for cleaner code organization
- **Hot Reload**: Development server with HMR for rapid iteration

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