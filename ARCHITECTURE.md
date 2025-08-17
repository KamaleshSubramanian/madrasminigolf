# Application Architecture

## Overview

Madras Mini Golf is built as a **unified Node.js application** that serves both the React frontend and Express API from a single server process. This architecture simplifies deployment, reduces infrastructure complexity, and provides optimal performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                Development Mode                         │
├─────────────────────────────────────────────────────────┤
│  Port 5000                                             │
│  ┌──────────────────┐    ┌─────────────────────────────┐│
│  │   Vite Dev       │    │      Express Server        ││
│  │   Server         │◄──►│                             ││
│  │                  │    │  ┌─────────────────────────┐││
│  │  • React HMR     │    │  │     API Routes          │││
│  │  • TypeScript    │    │  │   /api/*                │││
│  │  • Tailwind      │    │  │                         │││
│  │                  │    │  │  • Authentication       │││
│  │                  │    │  │  • Database Operations  │││
│  │                  │    │  │  • Business Logic       │││
│  │                  │    │  └─────────────────────────┘││
│  └──────────────────┘    └─────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                Production Mode                          │
├─────────────────────────────────────────────────────────┤
│  Port 5000                                             │
│  ┌─────────────────────────────────────────────────────┐│
│  │            Express Server                           ││
│  │                                                     ││
│  │  ┌─────────────────┐    ┌─────────────────────────┐ ││
│  │  │  Static Files   │    │     API Routes          │ ││
│  │  │  /dist/public/  │    │   /api/*                │ ││
│  │  │                 │    │                         │ ││
│  │  │  • index.html   │    │  • Authentication       │ ││
│  │  │  • JS bundles   │    │  • Database Operations  │ ││
│  │  │  • CSS assets   │    │  • Business Logic       │ ││
│  │  │  • Images       │    │  • Session Management   │ ││
│  │  └─────────────────┘    └─────────────────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Key Benefits

### 1. **Simplified Deployment**
- Single application to build and deploy
- No need to coordinate separate frontend/backend deployments
- Unified environment configuration
- One domain, one SSL certificate

### 2. **Development Experience**
- Hot Module Replacement (HMR) for React components
- TypeScript across entire stack
- Shared types and schemas between frontend/backend
- Single development server

### 3. **Performance**
- No CORS issues (same origin)
- Reduced network requests
- Optimized asset serving with caching headers
- Bundle splitting for efficient loading

### 4. **Hosting Flexibility**
- Works on any Node.js hosting platform
- Docker-ready with single container
- VPS deployment with PM2
- Serverless-compatible architecture

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing
- **React Hook Form + Zod** for form handling

### Backend
- **Express.js** for server framework
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Session-based authentication** with bcrypt
- **Automatic database detection** (Neon vs local)

### Build System
- **Vite** for frontend bundling
- **ESBuild** for backend bundling
- **TypeScript compiler** for type checking
- **PostCSS** for CSS processing

## Request Flow

### Development Mode
```
Browser Request → Express Server → Vite Middleware → React App
              ↘ API Request → Express Routes → Database
```

### Production Mode
```
Browser Request → Express Server → Static Files (Built React)
              ↘ API Request → Express Routes → Database
```

## File Structure

```
madras-mini-golf/
├── client/                    # React frontend source
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and configurations
│   └── index.html           # HTML template
├── server/                   # Express backend source
│   ├── index.ts             # Main server file
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data access layer
│   ├── db.ts                # Database configuration
│   └── vite.ts              # Vite integration
├── shared/                   # Shared TypeScript definitions
│   └── schema.ts            # Database schemas and types
├── scripts/                  # Build and deployment scripts
├── dist/                     # Production build output
│   ├── index.js             # Bundled server
│   ├── public/              # Built frontend assets
│   └── package.json         # Production dependencies
└── Configuration files...
```

## Build Process

### Development Build
1. TypeScript compilation with hot reloading
2. Vite dev server for React with HMR
3. Express server with middleware integration
4. Database connection with auto-detection

### Production Build
1. **Frontend Build** (`npm run build`)
   - Vite builds React app to `dist/public/`
   - Assets are optimized, minified, and hashed
   - Bundle splitting for efficient loading

2. **Backend Build**
   - ESBuild bundles server code to `dist/index.js`
   - Node.js modules are externalized
   - TypeScript is compiled to JavaScript

3. **Asset Optimization**
   - Static assets get cache headers
   - Gzip compression enabled
   - Bundle analysis and optimization

## Database Architecture

### Connection Strategy
```typescript
// Auto-detection logic in server/db.ts
if (DATABASE_URL.includes('neon') || NODE_ENV === 'production') {
  // Use Neon serverless driver
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Use standard PostgreSQL driver for local development
  pool = new NodePool({ connectionString: DATABASE_URL });
  db = drizzleNode(pool, { schema });
}
```

### Schema Management
- **Drizzle ORM** for type-safe database operations
- **Shared schemas** in `shared/schema.ts`
- **Migration system** with Drizzle Kit
- **Seed data** for initial setup

## Security Architecture

### Authentication Flow
1. **Session-based authentication** with PostgreSQL storage
2. **bcrypt** password hashing
3. **CSRF protection** through SameSite cookies
4. **Route-level protection** for admin endpoints

### Session Management
```typescript
app.use(session({
  store: new PgSession({ pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

## Performance Optimizations

### Asset Serving
```typescript
// Production static file serving with caching
app.use(express.static(distPath, {
  maxAge: '1y',                    // Long-term caching
  etag: true,                      // ETag support
  lastModified: true,              // Last-Modified headers
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(js|css|png|jpg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));
```

### Bundle Optimization
- **Code splitting** by route and vendor libraries
- **Tree shaking** to remove unused code
- **Minification** and compression
- **Modern JavaScript** output with fallbacks

## Deployment Strategies

### Platform as a Service
- **Heroku**: `git push heroku main`
- **Railway**: Connect repo, auto-deploy
- **Render**: Connect repo with build/start commands
- **DigitalOcean App Platform**: YAML configuration

### Container Deployment
- **Docker**: Multi-stage build with production image
- **Docker Compose**: Full stack with PostgreSQL
- **Kubernetes**: Deployment manifests available

### VPS Deployment
- **PM2**: Process management and clustering
- **Nginx**: Reverse proxy and SSL termination
- **SystemD**: Service management

## Monitoring and Maintenance

### Health Checks
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Logging
- **Request logging** for API endpoints
- **Error tracking** with stack traces
- **Performance monitoring** with response times
- **Database query logging** in development

### Database Maintenance
- **Migration management** with Drizzle Kit
- **Connection pooling** for performance
- **Backup strategies** for data protection
- **Performance monitoring** with query analysis

This architecture provides a robust, scalable foundation for the Madras Mini Golf application while maintaining simplicity in development and deployment processes.