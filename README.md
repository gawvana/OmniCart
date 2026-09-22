# OmniCart AI 2.0

> Personal AI Shopping Assistant inside Telegram.

OmniCart AI helps you manage shopping lists, plan purchases, track budgets, monitor prices, and sync with family — all through natural language in Telegram.

## Features

- **🧠 AI Shopping Parser** — Type "2 кг мяса, молоко и хлеб" and get structured items
- **📋 Smart Shopping Lists** — Create, manage, share lists with category grouping
- **💰 Budget Management** — Set budgets, track spending, get AI savings suggestions
- **📊 Price History** — Track price changes over time with statistics
- **🔄 Recurring Shopping** — Auto-suggest items you buy regularly
- **🤖 Smart Reorder** — AI predicts when you need to restock
- **👨‍👩‍👧 Family Sync** — Real-time shared lists with role-based access
- **📈 Analytics** — Spending trends, category breakdowns, frequent items
- **🔔 Notifications & Reminders** — Never forget to buy what you need
- **📱 Offline Support** — Works without internet, syncs when back online
- **🌐 Multi-language** — Russian, Uzbek, English

## Architecture

```
Telegram Bot + Mini App → FastAPI Backend → PostgreSQL / Redis / AI
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TanStack Query/Router, Framer Motion, Tailwind CSS |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0 Async, Pydantic v2 |
| Bot | aiogram 3.x |
| Database | PostgreSQL 16, Alembic migrations |
| Cache | Redis 7 |
| AI | Groq (primary), Google Gemini (fallback) |
| Workers | ARQ (async Redis queue) |
| Design | Apple-inspired Frosted Glass UI |

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Telegram Bot token from [@BotFather](https://t.me/BotFather)
- Groq API key from [console.groq.com](https://console.groq.com)

### Option 1: Docker (Recommended)

```bash
# Clone and configure
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up -d

# Verify
curl http://localhost:8000/health
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run migrations
cd ..
alembic upgrade head

# Start backend
uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Worker

```bash
python -m backend.app.workers.scheduler
```

#### Bot

```bash
python -m backend.app.bot.run
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from @BotFather |
| `TELEGRAM_WEBAPP_URL` | ✅ | URL of deployed Mini App |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `SECRET_KEY` | ✅ | 64-char hex secret for crypto ops |
| `GROQ_API_KEY` | ✅ | Groq API key for AI features |
| `AI_PROVIDER` | | `groq` (default) or `gemini` |
| `GEMINI_API_KEY` | | Gemini API key (fallback) |
| `BOT_MODE` | | `polling` (default) or `webhook` |
| `ALLOWED_ORIGINS` | | CORS allowed origins |

See [.env.example](.env.example) for all variables.

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Telegram Setup

### BotFather Configuration

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Set Menu Button: `/setmenubutton` → your Mini App URL → "🛒 Open OmniCart"
3. Set commands via `/setcommands`:
   ```
   start - Начать работу
   list - Мой список
   add - Добавить товар
   history - История покупок
   favorites - Избранное
   analytics - Аналитика
   family - Семья
   settings - Настройки
   help - Помощь
   ```

### Webhook vs Polling

- **Development**: Use `BOT_MODE=polling` (default)
- **Production**: Use `BOT_MODE=webhook` and configure webhook URL

## API Documentation

API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Endpoint Groups

| Prefix | Description |
|---|---|
| `/api/v1/auth` | Authentication |
| `/api/v1/profile` | User profile |
| `/api/v1/settings` | User settings |
| `/api/v1/lists` | Shopping lists |
| `/api/v1/items` | Shopping items |
| `/api/v1/products` | Products & categories |
| `/api/v1/favorites` | Favorite products |
| `/api/v1/history` | Purchase history |
| `/api/v1/analytics` | Analytics & trends |
| `/api/v1/family` | Family management |
| `/api/v1/market` | Prices & stores |
| `/api/v1/budget` | Budget management |
| `/api/v1/recurring` | Recurring items |
| `/api/v1/ai` | AI operations |
| `/api/v1/reminders` | Reminders |
| `/api/v1/notifications` | Notifications |
| `/api/v1/search` | Global search |
| `/health` | Health check |

## Testing

```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend tests
cd frontend && npm test

# Type checking
cd frontend && npx tsc --noEmit

# Linting
cd backend && python -m ruff check app/
```

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel
```

### Backend → Render / Railway

Deploy as a Docker container using the provided `Dockerfile`.

### Worker → Render Background Worker

Same Docker image, different command:
```bash
python -m backend.app.workers.scheduler
```

## Security

See [SECURITY.md](SECURITY.md) for security practices.

**Key points:**
- All credentials in `.env` only, never in code
- Telegram initData HMAC validation on every request
- Role-based access control for family features
- Rate limiting via Redis
- No AI-generated SQL execution
- Parameterized queries via SQLAlchemy ORM

## License

Private project. All rights reserved.
