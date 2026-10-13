-- SPECIFICATION ONLY. NOT EXECUTED. Extension/version approval and migration review required.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE businesses (
  id uuid NOT NULL,
  name text NOT NULL,
  timezone text NOT NULL,
  configuration_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (id)
);

CREATE TABLE app_users (
  id uuid NOT NULL,
  issuer text NOT NULL,
  subject text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (id),
  UNIQUE (issuer, subject)
);

CREATE TABLE business_memberships (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, user_id),
  CHECK (role IN ('OWNER','OPERATOR')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE customers (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  display_name text,
  contact_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE customer_identities (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  customer_id uuid NOT NULL,
  channel text NOT NULL,
  external_user_id text NOT NULL,
  link_method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, channel, external_user_id),
  UNIQUE (business_id, id, customer_id),
  CHECK (channel IN ('TELEGRAM','WHATSAPP','INSTAGRAM','WEB')),
  CHECK (link_method IN ('FIRST_CONTACT','MANUAL_VERIFIED','VERIFIED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE integrations (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  channel text NOT NULL,
  provider_account_id text NOT NULL,
  secret_reference text NOT NULL,
  mode text NOT NULL,
  enabled boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (channel, provider_account_id),
  CHECK (mode IN ('LIVE','MOCK','SANDBOX')),
  CHECK (channel IN ('TELEGRAM','WHATSAPP','INSTAGRAM','WEB')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE products (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  unit_price numeric(18,4) NOT NULL,
  currency varchar(3) NOT NULL,
  active boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, sku),
  CHECK (unit_price >= 0),
  CHECK (currency ~ '^[A-Z]{3}$'),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE inventory (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  product_id uuid NOT NULL,
  available_qty numeric(18,4) NOT NULL,
  reserved_qty numeric(18,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, product_id),
  CHECK (available_qty >= 0 AND reserved_qty >= 0),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE orders (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  customer_id uuid NOT NULL,
  status text NOT NULL,
  currency varchar(3) NOT NULL,
  delivery_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (status IN ('CREATED','CONFIRMED','NEEDS_ATTENTION')),
  CHECK (currency ~ '^[A-Z]{3}$'),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE order_items (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity numeric(18,4) NOT NULL,
  reserved_qty numeric(18,4) NOT NULL,
  unit_price numeric(18,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, order_id, product_id),
  CHECK (quantity > 0 AND reserved_qty >= 0 AND reserved_qty <= quantity AND unit_price >= 0),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE conversations (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  customer_id uuid,
  identity_id uuid,
  owner_user_id uuid,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK ((identity_id IS NULL) = (customer_id IS NULL)),
  CHECK ((identity_id IS NOT NULL) <> (owner_user_id IS NOT NULL)),
  CHECK (status IN ('OPEN','ESCALATED','CLOSED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE messages (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  integration_id uuid,
  provider_message_id text,
  direction text NOT NULL,
  body text NOT NULL,
  status text NOT NULL,
  correlation_id uuid NOT NULL,
  lease_until timestamptz,
  claim_token uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (direction IN ('INBOUND','OUTBOUND')),
  CHECK (status IN ('RECEIVED','PROCESSING','PROCESSED','PENDING_DELIVERY','DELIVERED','DELIVERY_UNKNOWN','FAILED')),
  CHECK (direction <> 'INBOUND' OR (integration_id IS NOT NULL AND provider_message_id IS NOT NULL)),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE object_records (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  bucket text NOT NULL,
  object_key text NOT NULL,
  sha256 char(64) NOT NULL,
  media_type text NOT NULL,
  byte_size bigint NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  storage_version_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (bucket, object_key),
  CHECK (byte_size >= 0),
  CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  CHECK (kind IN ('DOCUMENT','ATTACHMENT','MODEL')),
  CHECK (status IN ('QUARANTINED','CLEAN','REVOKED','DELETED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE message_attachments (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  message_id uuid NOT NULL,
  object_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, message_id, object_id),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE documents (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  title text NOT NULL,
  access_scope text NOT NULL,
  published_version_id uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (access_scope IN ('CUSTOMER','STAFF')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE document_versions (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  document_id uuid NOT NULL,
  object_id uuid NOT NULL,
  content_hash char(64) NOT NULL,
  parser_version text NOT NULL,
  embedding_model text NOT NULL,
  embedding_dimension integer NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, document_id, id),
  CHECK (embedding_dimension > 0),
  CHECK (status IN ('STAGED','READY','FAILED','REVOKED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE embeddings (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  document_id uuid NOT NULL,
  document_version_id uuid NOT NULL,
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  embedding_dimension integer NOT NULL,
  embedding vector NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, document_version_id, chunk_index),
  CHECK (chunk_index >= 0 AND embedding_dimension > 0),
  CHECK (vector_dims(embedding) = embedding_dimension),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE agent_runs (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  message_id uuid NOT NULL,
  mode text NOT NULL,
  status text NOT NULL,
  active_agent text,
  resume_revision bigint NOT NULL,
  step_count integer NOT NULL,
  handoff_count integer NOT NULL,
  retry_count integer NOT NULL,
  deadline timestamptz NOT NULL,
  budget_state jsonb NOT NULL,
  execution_metadata jsonb NOT NULL,
  routing_confidence text NOT NULL,
  reason_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, message_id),
  CHECK (mode IN ('SINGLE','STATIC_MULTI','ADAPTIVE_MULTI')),
  CHECK (status IN ('RUNNING','WAITING_HUMAN','SUCCEEDED','FAILED')),
  CHECK (active_agent IS NULL OR active_agent IN ('Sales','Support','Analytics')),
  CHECK (routing_confidence IN ('HIGH','MEDIUM','LOW','UNKNOWN')),
  CHECK (resume_revision >= 0 AND step_count >= 0 AND handoff_count >= 0 AND retry_count >= 0),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE idempotency_operations (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  operation_key text NOT NULL,
  tool_name text NOT NULL,
  canonical_payload_hash char(64) NOT NULL,
  actor_scope text NOT NULL,
  status text NOT NULL,
  result jsonb,
  error_code text,
  run_id uuid NOT NULL,
  reconcile_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, tool_name, actor_scope, operation_key),
  CHECK (tool_name IN ('create_order','update_order','reserve_inventory')),
  CHECK (status IN ('STARTED','SUCCEEDED','FAILED','UNKNOWN')),
  CHECK (status <> 'SUCCEEDED' OR result IS NOT NULL),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE tool_calls (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  run_id uuid NOT NULL,
  operation_id uuid,
  tool_name text NOT NULL,
  attempt integer NOT NULL,
  status text NOT NULL,
  error_code text,
  duration_ms numeric(18,4),
  result_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (attempt > 0),
  CHECK (status IN ('STARTED','SUCCEEDED','FAILED','OUTCOME_UNKNOWN')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE agent_steps (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  run_id uuid NOT NULL,
  sequence integer NOT NULL,
  kind text NOT NULL,
  summary jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, run_id, sequence),
  CHECK (sequence >= 0),
  CHECK (kind IN ('ROUTE','CONTEXT','HANDOFF','WAIT','FINAL')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE escalations (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  run_id uuid NOT NULL,
  reason_code text NOT NULL,
  assigned_user_id uuid,
  status text NOT NULL,
  expected_resume_revision bigint NOT NULL,
  resolution jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (status IN ('OPEN','CLAIMED','RESOLVED')),
  CHECK (expected_resume_revision >= 0),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE audit_logs (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  run_id uuid,
  correlation_id uuid NOT NULL,
  actor_scope text NOT NULL,
  event_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  detail jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, id),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE model_artifacts (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  object_id uuid NOT NULL,
  model_version text NOT NULL,
  dataset_version text NOT NULL,
  manifest jsonb NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  UNIQUE (business_id, model_version),
  CHECK (status IN ('CANDIDATE','VALIDATED','RETIRED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

CREATE TABLE forecast_runs (
  business_id uuid NOT NULL,
  id uuid NOT NULL,
  model_artifact_id uuid NOT NULL,
  agent_run_id uuid,
  as_of timestamptz NOT NULL,
  horizon integer NOT NULL,
  granularity text NOT NULL,
  target_definition text NOT NULL,
  status text NOT NULL,
  predictions jsonb,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (business_id, id),
  CHECK (horizon > 0),
  CHECK (status IN ('PENDING','SUCCEEDED','FAILED')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT
);

ALTER TABLE business_memberships ADD CONSTRAINT fk_business_memberships_0 FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE RESTRICT;

CREATE INDEX ix_customers_0 ON customers (business_id, created_at, id);

ALTER TABLE customer_identities ADD CONSTRAINT fk_customer_identities_0 FOREIGN KEY (business_id, customer_id) REFERENCES customers (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_customer_identities_0 ON customer_identities (business_id, customer_id);

CREATE INDEX ix_products_0 ON products (business_id, active, name, id);

ALTER TABLE inventory ADD CONSTRAINT fk_inventory_0 FOREIGN KEY (business_id, product_id) REFERENCES products (business_id, id) ON DELETE RESTRICT;

ALTER TABLE orders ADD CONSTRAINT fk_orders_0 FOREIGN KEY (business_id, customer_id) REFERENCES customers (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_orders_0 ON orders (business_id, customer_id, created_at, id);

CREATE INDEX ix_orders_1 ON orders (business_id, status, created_at, id);

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_0 FOREIGN KEY (business_id, order_id) REFERENCES orders (business_id, id) ON DELETE RESTRICT;

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_1 FOREIGN KEY (business_id, product_id) REFERENCES products (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_order_items_0 ON order_items (business_id, product_id);

ALTER TABLE conversations ADD CONSTRAINT fk_conversations_0 FOREIGN KEY (business_id, identity_id, customer_id) REFERENCES customer_identities (business_id, id, customer_id) ON DELETE RESTRICT;

ALTER TABLE conversations ADD CONSTRAINT fk_conversations_1 FOREIGN KEY (business_id, owner_user_id) REFERENCES business_memberships (business_id, user_id) ON DELETE RESTRICT;

CREATE INDEX ix_conversations_0 ON conversations (business_id, status, updated_at, id);

ALTER TABLE messages ADD CONSTRAINT fk_messages_0 FOREIGN KEY (business_id, conversation_id) REFERENCES conversations (business_id, id) ON DELETE RESTRICT;

ALTER TABLE messages ADD CONSTRAINT fk_messages_1 FOREIGN KEY (business_id, integration_id) REFERENCES integrations (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_messages_0 ON messages (business_id, conversation_id, created_at, id);

CREATE INDEX ix_messages_1 ON messages (status, lease_until, created_at);

ALTER TABLE message_attachments ADD CONSTRAINT fk_message_attachments_0 FOREIGN KEY (business_id, message_id) REFERENCES messages (business_id, id) ON DELETE RESTRICT;

ALTER TABLE message_attachments ADD CONSTRAINT fk_message_attachments_1 FOREIGN KEY (business_id, object_id) REFERENCES object_records (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_documents_0 ON documents (business_id, access_scope, revoked_at);

ALTER TABLE document_versions ADD CONSTRAINT fk_document_versions_0 FOREIGN KEY (business_id, document_id) REFERENCES documents (business_id, id) ON DELETE RESTRICT;

ALTER TABLE document_versions ADD CONSTRAINT fk_document_versions_1 FOREIGN KEY (business_id, object_id) REFERENCES object_records (business_id, id) ON DELETE RESTRICT;

ALTER TABLE embeddings ADD CONSTRAINT fk_embeddings_0 FOREIGN KEY (business_id, document_id, document_version_id) REFERENCES document_versions (business_id, document_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_embeddings_0 ON embeddings (business_id, document_id, document_version_id);

ALTER TABLE agent_runs ADD CONSTRAINT fk_agent_runs_0 FOREIGN KEY (business_id, message_id) REFERENCES messages (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_agent_runs_0 ON agent_runs (business_id, status, created_at, id);

ALTER TABLE idempotency_operations ADD CONSTRAINT fk_idempotency_operations_0 FOREIGN KEY (business_id, run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_idempotency_operations_0 ON idempotency_operations (business_id, status, reconcile_after);

ALTER TABLE tool_calls ADD CONSTRAINT fk_tool_calls_0 FOREIGN KEY (business_id, run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

ALTER TABLE tool_calls ADD CONSTRAINT fk_tool_calls_1 FOREIGN KEY (business_id, operation_id) REFERENCES idempotency_operations (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_tool_calls_0 ON tool_calls (business_id, run_id, created_at, id);

ALTER TABLE agent_steps ADD CONSTRAINT fk_agent_steps_0 FOREIGN KEY (business_id, run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

ALTER TABLE escalations ADD CONSTRAINT fk_escalations_0 FOREIGN KEY (business_id, run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

ALTER TABLE escalations ADD CONSTRAINT fk_escalations_1 FOREIGN KEY (business_id, assigned_user_id) REFERENCES business_memberships (business_id, user_id) ON DELETE RESTRICT;

CREATE INDEX ix_escalations_0 ON escalations (business_id, status, created_at, id);

ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_0 FOREIGN KEY (business_id, run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_audit_logs_0 ON audit_logs (business_id, correlation_id, created_at, id);

CREATE INDEX ix_audit_logs_1 ON audit_logs (business_id, resource_type, resource_id, created_at);

ALTER TABLE model_artifacts ADD CONSTRAINT fk_model_artifacts_0 FOREIGN KEY (business_id, object_id) REFERENCES object_records (business_id, id) ON DELETE RESTRICT;

ALTER TABLE forecast_runs ADD CONSTRAINT fk_forecast_runs_0 FOREIGN KEY (business_id, model_artifact_id) REFERENCES model_artifacts (business_id, id) ON DELETE RESTRICT;

ALTER TABLE forecast_runs ADD CONSTRAINT fk_forecast_runs_1 FOREIGN KEY (business_id, agent_run_id) REFERENCES agent_runs (business_id, id) ON DELETE RESTRICT;

CREATE INDEX ix_forecast_runs_0 ON forecast_runs (business_id, created_at, id);

CREATE UNIQUE INDEX ux_ingress ON messages (business_id, integration_id, provider_message_id) WHERE direction = 'INBOUND';

ALTER TABLE documents ADD CONSTRAINT fk_published_version FOREIGN KEY (business_id, id, published_version_id) REFERENCES document_versions (business_id, document_id, id) ON DELETE RESTRICT;
