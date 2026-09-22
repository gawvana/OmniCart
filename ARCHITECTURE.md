# OmniCart AI — Architecture

## System Overview

OmniCart AI is a personal AI-powered shopping assistant that operates inside Telegram as a Mini App + Bot combination. Users interact through natural language in the bot or through a rich web interface in the Mini App.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Users                        │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│   Telegram Bot       │  │   Telegram Mini App          │
│   (aiogram 3.x)      │  │   (React 18 + TypeScript)    │
│                      │  │                              │
│   • Natural language │  │   • Frosted glass UI         │
│   • Commands         │  │   • Offline support          │
│   • Notifications    │  │   • Real-time family sync    │
└──────────┬───────────┘  └──────────────┬───────────────┘
           │                             │
           │     HTTPS /api/v1/*         │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │       FastAPI Backend         │
           │                              │
           │   ┌────────────────────┐     │
           │   │   API Routes (v1)  │     │
           │   └────────┬───────────┘     │
           │            │                 │
           │   ┌────────▼───────────┐     │
           │   │    Services        │     │
           │   │  (Business Logic)  │     │
           │   └────────┬───────────┘     │
           │            │                 │
           │   ┌────────▼───────────┐     │
           │   │   Repositories     │     │
           │   │  (Data Access)     │     │
           │   └────────┬───────────┘     │
           │            │                 │
           └────────────┼────────────────-┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐
│  PostgreSQL  │ │   Redis    │ │  AI Provider │
│              │ │            │ │              │
│  28 tables   │ │  Cache     │ │  Groq (1st)  │
│  Alembic     │ │  Rate Limit│ │  Gemini (2nd)│
│  migrations  │ │  Sessions  │ │  Mock (test) │
└──────────────┘ └────────────┘ └──────────────┘
```

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│              API Routes                  │
│  (Request validation, auth, routing)     │
├─────────────────────────────────────────┤
│              Services                    │
│  (Business logic, orchestration)         │
├─────────────────────────────────────────┤
│            Repositories                  │
│  (Data access, SQLAlchemy queries)       │
├─────────────────────────────────────────┤
│          Database / Models               │
│  (SQLAlchemy ORM, PostgreSQL)            │
└─────────────────────────────────────────┘
```

### Module Structure

```
backend/
├── app/
│   ├── api/v1/          # REST API routes (18 routers)
│   ├── bot/             # Telegram bot (handlers, keyboards, middlewares)
│   ├── core/            # Config, security, exceptions, middleware
│   ├── db/              # Database engine, base classes
│   ├── models/          # SQLAlchemy ORM models (28 tables)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── integrations/    # External services (AI, Telegram, Market)
│   │   └── ai/          # AI provider abstraction
│   ├── workers/         # Background job definitions
│   └── utils/           # Shared utilities
├── alembic/             # Database migrations
└── tests/               # Test suite
```

## AI Architecture

```
┌─────────────────────────────────────────┐
│           AI Task Router                 │
│                                         │
│  ParseItems     → Fast model (8B)       │
│  Categorize     → Fast model (8B)       │
│  CreatePlan     → Strong model (70B)    │
│  BudgetSuggest  → Strong model (70B)    │
│  ParseReminder  → Fast model (8B)       │
│  Insights       → Strong model (70B)    │
├─────────────────────────────────────────┤
│         AIProvider Abstraction           │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  Groq    │  │  Gemini  │  │ Mock  │ │
│  │ (Primary)│  │(Fallback)│  │(Test) │ │
│  └──────────┘  └──────────┘  └───────┘ │
├─────────────────────────────────────────┤
│              Redis Cache                 │
│         (Deduplicate requests)           │
├─────────────────────────────────────────┤
│         Pydantic Validation              │
│    (Structured output → typed data)      │
├─────────────────────────────────────────┤
│          Business Services               │
│    (Authorization → DB mutation)         │
└─────────────────────────────────────────┘
```

### AI Safety Rules
1. AI never directly accesses the database
2. All AI output passes through Pydantic validation
3. AI suggestions require user confirmation before mutation
4. Rate limiting per user per operation
5. Request logging for cost tracking
6. Prompt injection protection

## Frontend Architecture

```
frontend/src/
├── app/               # App shell, router, providers
├── pages/             # Route-level page components (16 pages)
├── features/          # Feature modules (11 domains)
│   ├── shopping/      # Shopping list feature
│   ├── lists/         # List management
│   ├── ai/            # AI interaction components
│   ├── family/        # Family sharing
│   ├── budget/        # Budget management
│   ├── analytics/     # Analytics & charts
│   ├── profile/       # User profile
│   ├── settings/      # Settings
│   ├── history/       # Purchase history
│   ├── recurring/     # Recurring items
│   └── notifications/ # Notifications
├── design-system/     # Frosted glass component library
├── api/               # API client layer (16 modules)
├── hooks/             # Custom React hooks
├── store/             # Zustand stores
├── i18n/              # Internationalization (ru, uz, en)
├── types/             # TypeScript interfaces
└── utils/             # Utility functions
```

### State Management Strategy
- **Server state**: TanStack Query (caching, revalidation, optimistic updates)
- **UI state**: React useState / Zustand
- **Offline queue**: IndexedDB via idb-keyval
- **Real-time**: WebSocket for family sync

## Data Flow

### Shopping Item Creation
```
User Input (text)
    ↓
AI Parser (Groq/Gemini)
    ↓
Pydantic Validation
    ↓
Preview in UI
    ↓
User Confirmation
    ↓
API: POST /api/v1/items
    ↓
Auth Middleware
    ↓
ItemService.create()
    ↓
Duplicate Detection
    ↓
Product Resolution
    ↓
DB Transaction
    ↓
Activity Event
    ↓
WebSocket Broadcast (family)
    ↓
Response → UI Update
```

### Family Real-Time Sync
```
Client A (mutation)
    ↓
API Backend
    ↓
DB Transaction
    ↓
Activity Event Created
    ↓
WebSocket Event Published
    ↓
Client B (receives update)
    ↓
TanStack Query Cache Invalidation
    ↓
UI Re-render
```

## Database Schema Overview

### Core Entities (28 tables)
- **Users**: users, user_settings
- **Shopping**: shopping_lists, shopping_list_members, shopping_items
- **Products**: categories, products, product_aliases, favorites
- **Family**: families, family_members, family_invites
- **Activity**: activity_events, notifications, reminders
- **Pricing**: stores, markets, price_observations
- **Financial**: budgets, purchase_history
- **Recurring**: recurring_items, smart_reorder_events
- **System**: ai_requests, feature_flags

## Security Architecture

### Authentication Flow
```
Telegram WebApp
    ↓
initData (signed by Telegram)
    ↓
X-Telegram-Init-Data header
    ↓
Backend HMAC-SHA256 validation
    ↓
User identity extracted
    ↓
Auto-provision if new user
    ↓
Authorized request
```

### Authorization Model
- Resource ownership check on every mutation
- Family role-based access (owner > admin > member > viewer)
- List sharing with role-based permissions
- No UUID = access pattern

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Production                         │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │  Frontend   │  │  Backend   │  │   Worker      │  │
│  │  (Vercel)   │  │ (Render/   │  │  (Render/     │  │
│  │             │  │  Railway)  │  │   Railway)    │  │
│  └────────────┘  └──────┬─────┘  └───────┬───────┘  │
│                         │                │           │
│              ┌──────────┴────────────────┘           │
│              │                                       │
│  ┌───────────▼──────┐  ┌─────────────────────────┐  │
│  │   PostgreSQL      │  │       Redis              │  │
│  │   (managed)       │  │       (managed)          │  │
│  └──────────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Workers & Background Jobs

| Worker | Schedule | Purpose |
|---|---|---|
| Reminders | Every minute | Check and send due reminders |
| Recurring | Every hour | Calculate next due dates, create suggestions |
| Smart Reorder | Daily | Analyze purchase history, generate predictions |
| Notifications | Every minute | Process notification queue |
| Daily Digest | Daily 9:00 | Generate and send daily summaries |
| Price Aggregation | Every 6 hours | Aggregate price data, compute statistics |
| Analytics | Daily | Pre-compute analytics data |
| Cleanup | Daily | Remove expired invites, process deletions |
