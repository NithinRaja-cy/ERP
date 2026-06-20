"""Add activity_logs and assigned_to

Revision ID: 4ebc6257fde6
Revises: 9ff329c6e644
Create Date: 2026-06-20 16:26:31.797538

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ebc6257fde6'
down_revision: Union[str, None] = '9ff329c6e644'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Sales Orders
    with op.batch_alter_table('sales_orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('assigned_to', sa.String(length=36), nullable=True))
        batch_op.create_index(batch_op.f('ix_sales_orders_assigned_to'), ['assigned_to'], unique=False)

    # Purchase Orders
    with op.batch_alter_table('purchase_orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('assigned_to', sa.String(length=36), nullable=True))
        batch_op.create_index(batch_op.f('ix_purchase_orders_assigned_to'), ['assigned_to'], unique=False)

    # Manufacturing Orders
    with op.batch_alter_table('manufacturing_orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('assigned_to', sa.String(length=36), nullable=True))
        batch_op.create_index(batch_op.f('ix_manufacturing_orders_assigned_to'), ['assigned_to'], unique=False)

    # Activity Logs
    op.create_table('activity_logs',
    sa.Column('user_id', sa.String(length=36), nullable=True),
    sa.Column('user_name', sa.String(length=255), nullable=True),
    sa.Column('action', sa.String(length=255), nullable=False),
    sa.Column('module', sa.String(length=100), nullable=False),
    sa.Column('details', sa.String(length=500), nullable=True),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_activity_created', 'activity_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_activity_logs_action'), 'activity_logs', ['action'], unique=False)
    op.create_index(op.f('ix_activity_logs_id'), 'activity_logs', ['id'], unique=False)
    op.create_index(op.f('ix_activity_logs_module'), 'activity_logs', ['module'], unique=False)
    op.create_index(op.f('ix_activity_logs_user_id'), 'activity_logs', ['user_id'], unique=False)
    op.create_index('ix_activity_module_action', 'activity_logs', ['module', 'action'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_activity_module_action', table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_user_id'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_module'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_id'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_action'), table_name='activity_logs')
    op.drop_index('ix_activity_created', table_name='activity_logs')
    op.drop_table('activity_logs')

    with op.batch_alter_table('manufacturing_orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_manufacturing_orders_assigned_to'))
        batch_op.drop_column('assigned_to')

    with op.batch_alter_table('purchase_orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_purchase_orders_assigned_to'))
        batch_op.drop_column('assigned_to')

    with op.batch_alter_table('sales_orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_sales_orders_assigned_to'))
        batch_op.drop_column('assigned_to')
