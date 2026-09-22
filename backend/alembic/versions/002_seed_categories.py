"""seed categories

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute(
        \"\"\"
        INSERT INTO categories (name, emoji, sort_order) VALUES
        ('Овощи и фрукты', '🥬', 1),
        ('Мясо и птица', '🥩', 2),
        ('Молочные продукты', '🥛', 3),
        ('Хлеб и выпечка', '🍞', 4),
        ('Крупы и макароны', '🌾', 5),
        ('Напитки', '🥤', 6),
        ('Сладости', '🍰', 7),
        ('Рыба и морепродукты', '🐟', 8),
        ('Масла и соусы', '🫒', 9),
        ('Замороженные продукты', '❄️', 10),
        ('Бытовая химия', '🧴', 11),
        ('Личная гигиена', '🧼', 12),
        ('Другое', '📦', 13);
        \"\"\"
    )

def downgrade() -> None:
    op.execute("DELETE FROM categories;")
