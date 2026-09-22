import asyncio
from arq import create_pool, cron
from arq.connections import RedisSettings
from backend.app.core.config import get_settings
from backend.app.workers.tasks import (
    process_reminders,
    process_recurring_items,
    calculate_smart_reorders,
    send_notifications,
    generate_daily_digest,
    aggregate_prices,
    cleanup_expired,
)

async def startup(ctx):
    """Initialize database session factory for worker."""
    from backend.app.db.engine import async_session_factory
    ctx['session_factory'] = async_session_factory

async def shutdown(ctx):
    pass

class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(get_settings().REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown
    functions = [
        process_reminders,
        process_recurring_items,
        calculate_smart_reorders,
        send_notifications,
        generate_daily_digest,
        aggregate_prices,
        cleanup_expired,
    ]
    cron_jobs = [
        cron(process_reminders, minute={0, 15, 30, 45}),  # Every 15 min
        cron(process_recurring_items, hour={6, 12, 18}),    # 3x daily
        cron(calculate_smart_reorders, hour=3, minute=0),   # Daily at 3 AM
        cron(send_notifications, minute={0, 15, 30, 45}),   # Every 15 min
        cron(generate_daily_digest, hour=8, minute=0),      # Daily at 8 AM
        cron(aggregate_prices, hour={0, 6, 12, 18}),        # Every 6 hours
        cron(cleanup_expired, hour=2, minute=0),            # Daily at 2 AM
    ]

if __name__ == '__main__':
    asyncio.run(main())

async def main():
    from arq import run_worker
    run_worker(WorkerSettings)
