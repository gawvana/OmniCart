import structlog
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, and_

logger = structlog.get_logger()

async def process_reminders(ctx):
    """Check for due reminders and send notifications."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.services.reminder_service import ReminderService
        from app.services.notification_service import NotificationService
        
        reminder_svc = ReminderService(session)
        notification_svc = NotificationService(session)
        
        due_reminders = await reminder_svc.get_due()
        for reminder in due_reminders:
            await notification_svc.create(
                user_id=reminder.user_id,
                type='reminder',
                title=f'🔔 {reminder.title}',
                body=reminder.description or '',
                data={'reminder_id': str(reminder.id)}
            )
            await reminder_svc.complete(reminder.user_id, reminder.id)
        
        await session.commit()
        logger.info('processed_reminders', count=len(due_reminders))

async def process_recurring_items(ctx):
    """Check for due recurring items and create suggestions."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.recurring import RecurringItem
        from app.services.notification_service import NotificationService
        
        now = datetime.now(timezone.utc)
        result = await session.execute(
            select(RecurringItem).where(
                and_(
                    RecurringItem.enabled == True,
                    RecurringItem.next_due_at <= now
                )
            )
        )
        due_items = result.scalars().all()
        
        notification_svc = NotificationService(session)
        for item in due_items:
            await notification_svc.create(
                user_id=item.user_id,
                type='recurring_item',
                title=f'🔄 Пора купить {item.name}',
                body=f'Вы обычно покупаете каждые {item.interval_days} дней',
                data={'recurring_item_id': str(item.id), 'name': item.name}
            )
            item.next_due_at = now + timedelta(days=item.interval_days or 7)
        
        await session.commit()
        logger.info('processed_recurring', count=len(due_items))

async def calculate_smart_reorders(ctx):
    """Analyze purchase history and create smart reorder suggestions."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.user import User
        from app.services.reorder_service import ReorderService
        
        # Get all active users
        result = await session.execute(
            select(User.id).where(User.is_active == True)
        )
        user_ids = result.scalars().all()
        
        total_suggestions = 0
        for user_id in user_ids:
            reorder_svc = ReorderService(session)
            suggestions = await reorder_svc.calculate_reorders(user_id)
            total_suggestions += len(suggestions)
        
        await session.commit()
        logger.info('calculated_smart_reorders', users=len(user_ids), suggestions=total_suggestions)

async def send_notifications(ctx):
    """Process pending notifications and send via Telegram."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.activity import Notification
        from app.models.user import User
        from app.bot.bot import create_bot
        
        # Find unsent notifications created in the last hour
        cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
        result = await session.execute(
            select(Notification, User.telegram_user_id)
            .join(User, Notification.user_id == User.id)
            .where(
                and_(
                    Notification.is_sent == False,
                    Notification.created_at >= cutoff
                )
            )
            .limit(100)
        )
        notifications = result.all()
        
        if not notifications:
            return
        
        bot = create_bot()
        sent = 0
        now_utc = datetime.now(timezone.utc)
        try:
            for notification, telegram_id in notifications:
                try:
                    await bot.send_message(
                        chat_id=telegram_id,
                        text=f"{notification.title}\n\n{notification.body}"
                    )
                    notification.is_sent = True
                    notification.sent_at = now_utc
                    sent += 1
                except Exception as e:
                    logger.warning('notification_send_failed', telegram_id=telegram_id, error=str(e))
            await session.commit()
        finally:
            await bot.session.close()
        
        logger.info('sent_notifications', total=len(notifications), sent=sent)

async def generate_daily_digest(ctx):
    """Generate daily summary for users who have it enabled."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.user import User, UserSettings
        from app.services.analytics_service import AnalyticsService
        from app.services.notification_service import NotificationService
        from app.models.shopping import ShoppingItem
        from sqlalchemy import func
        
        # Get users with notifications enabled
        result = await session.execute(
            select(User.id, User.first_name)
            .join(UserSettings, UserSettings.user_id == User.id)
            .where(
                and_(
                    User.is_active == True,
                    UserSettings.notifications_enabled == True
                )
            )
        )
        users = result.all()
        
        notification_svc = NotificationService(session)
        for user_id, first_name in users:
            # Count pending items
            item_count_result = await session.execute(
                select(func.count(ShoppingItem.id))
                .where(
                    and_(
                        ShoppingItem.created_by == user_id,
                        ShoppingItem.is_purchased == False
                    )
                )
            )
            item_count = item_count_result.scalar() or 0
            
            if item_count == 0:
                continue
            
            await notification_svc.create(
                user_id=user_id,
                type='daily_summary',
                title=f'☀️ Доброе утро, {first_name}!',
                body=f'🛒 {item_count} товаров в списке',
                data={'item_count': item_count}
            )
        
        await session.commit()
        logger.info('generated_daily_digest', users=len(users))

async def aggregate_prices(ctx):
    """Aggregate price observations into statistics."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.price import PriceObservation
        from app.models.product import Product
        from sqlalchemy import func, and_
        
        # Get products with recent observations
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        result = await session.execute(
            select(
                PriceObservation.product_id,
                func.count(PriceObservation.id).label('count'),
                func.avg(PriceObservation.price).label('avg_price'),
                func.min(PriceObservation.price).label('min_price'),
                func.max(PriceObservation.price).label('max_price'),
            )
            .where(PriceObservation.observed_at >= cutoff)
            .group_by(PriceObservation.product_id)
        )
        stats = result.all()
        
        logger.info('aggregated_prices', products=len(stats))

async def cleanup_expired(ctx):
    """Clean up expired invites and soft-deleted accounts."""
    session_factory = ctx['session_factory']
    async with session_factory() as session:
        from app.models.family import FamilyInvite
        from app.models.user import User
        
        now = datetime.now(timezone.utc)
        
        # Delete expired, unused invites
        await session.execute(
            FamilyInvite.__table__.delete().where(
                and_(
                    FamilyInvite.expires_at < now,
                    FamilyInvite.is_used == False
                )
            )
        )
        
        # Process accounts deleted > 30 days ago (hard delete)
        cutoff = now - timedelta(days=30)
        result = await session.execute(
            select(User).where(
                and_(
                    User.deleted_at.isnot(None),
                    User.deleted_at < cutoff
                )
            )
        )
        deleted_users = result.scalars().all()
        for user in deleted_users:
            await session.delete(user)  # Cascade delete
        
        await session.commit()
        logger.info('cleanup_expired', expired_invites='cleaned', deleted_users=len(deleted_users))
