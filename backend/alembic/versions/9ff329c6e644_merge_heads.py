"""merge heads

Revision ID: 9ff329c6e644
Revises: 001, a6ef1e814907
Create Date: 2026-06-20 16:25:48.460901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ff329c6e644'
down_revision: Union[str, None] = ('001', 'a6ef1e814907')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
