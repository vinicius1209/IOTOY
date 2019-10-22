"""empty message

Revision ID: 503463d61065
Revises: 
Create Date: 2019-06-18 08:48:30.508938

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '503463d61065'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=64), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('password_hash', sa.String(length=128), nullable=True),
    sa.Column('api_key', sa.String(length=255), nullable=True),
    sa.Column('api_url', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)
    op.create_table('toy',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=120), nullable=True),
    sa.Column('mac_address', sa.String(length=17), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_toy_description'), 'toy', ['description'], unique=False)
    op.create_index(op.f('ix_toy_mac_address'), 'toy', ['mac_address'], unique=True)
    op.create_table('sound',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('file_name', sa.String(length=120), nullable=False),
    sa.Column('part', sa.String(length=30), nullable=False),
    sa.Column('toy_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['toy_id'], ['toy.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sound_file_name'), 'sound', ['file_name'], unique=False)
    op.create_index(op.f('ix_sound_part'), 'sound', ['part'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sound_part'), table_name='sound')
    op.drop_index(op.f('ix_sound_file_name'), table_name='sound')
    op.drop_table('sound')
    op.drop_index(op.f('ix_toy_mac_address'), table_name='toy')
    op.drop_index(op.f('ix_toy_description'), table_name='toy')
    op.drop_table('toy')
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
    # ### end Alembic commands ###
