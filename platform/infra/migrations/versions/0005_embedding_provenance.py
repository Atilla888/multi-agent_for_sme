"""Add implementation metadata to approved embedding rows, without changing domains."""

from alembic import op

revision = "0005_embedding_provenance"
down_revision = "0004_staff_identity_lookup"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE embeddings ADD COLUMN chunk_locator text")
    op.execute("ALTER TABLE embeddings ADD COLUMN chunk_text_sha256 char(64)")
    op.execute("ALTER TABLE embeddings ADD COLUMN chunker_version text")
    op.execute("ALTER TABLE embeddings ADD COLUMN embedding_revision text")
    op.execute(
        "ALTER TABLE embeddings ADD CONSTRAINT ck_embedding_chunk_sha256 "
        "CHECK (chunk_text_sha256 IS NULL OR chunk_text_sha256 ~ '^[0-9a-f]{64}$')"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE embeddings DROP CONSTRAINT ck_embedding_chunk_sha256")
    op.execute("ALTER TABLE embeddings DROP COLUMN embedding_revision")
    op.execute("ALTER TABLE embeddings DROP COLUMN chunker_version")
    op.execute("ALTER TABLE embeddings DROP COLUMN chunk_text_sha256")
    op.execute("ALTER TABLE embeddings DROP COLUMN chunk_locator")
