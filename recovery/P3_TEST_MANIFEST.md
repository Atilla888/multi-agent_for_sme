# P3 frozen test manifest

Frozen before P3 execution against baseline `1cd69e33be80c81b9222c9a141393d570e692ec6`. Existing tests may not be changed. Function names below are the static module inventory; parameter expansion is verified later by pytest collection.

## File classification and hashes

| Coverage | Test file | Frozen expected cases | Type / execution environment | SHA-256 |
| --- | --- | ---: | --- | --- |
| M02 | `tests/unit/test_tenant_contract.py` | 1 | unit; host/container Python 3.12 | `2e6795602313587136804c27a329c9032daf674a8bf5cb42624d49010304042d` |
| M02 | `tests/integration/test_schema.py` | 6 | PostgreSQL/pgvector in `diploma-p3` | `ddf12deef47ac85ba520fba88c18e560396e5e478ef974286c572a733321aa1d` |
| M02 | `tests/security/test_rls.py` | 8 | negative/security PostgreSQL in `diploma-p3` | `7127b36f1a4429bda9a3358978d014597c13306159ddfed8d402c0983aaf4849` |
| M03 | `tests/integration/test_domain_core.py` | 9 | domain/repository PostgreSQL in `diploma-p3` | `19ec273bf81542d3a397e3170d93cdb49633129634e5078f97d88e8efa33381e` |
| M04 | `tests/contract/test_tools.py` | 23 | contract/negative PostgreSQL in `diploma-p3` | `51d1c741f0f31e4920e58115f431377eb98ca863ac75cd83cb7104117b7ba09b` |
| M05 | `tests/security/test_identity.py` | 10 | OIDC/object/security PostgreSQL in `diploma-p3` | `13c6add8d3f77ecb53569c9e47e371d3f9c237b6d7c3a78c4dfcc51592bd17ac` |
| M05 | `tests/security/test_keycloak_live.py` | 1 | local live Keycloak + PostgreSQL in `diploma-p3` | `a82658c4f4f0e278b6f4e8f134c2d4031e8d94840779b0c3ef4bc37471174a7e` |
| Shared M03–M05 | `tests/integration/test_acceptance_core.py` | 2 | positive/negative integrated PostgreSQL paths | `28a4c57599e82c4ab0f1d346479deaedbe4fa88423c9e834feccc7e0e769a7d9` |
| M06 | `tests/unit/test_brain_contracts.py` | 9 | typed/conflict unit cases, Python 3.12 | `4776b265a7363949487ebdd6000b4b7eb37ddb2047f113893b3777d14f4dc8b7` |
| M06 | `tests/integration/test_brain.py` | 10 | Brain/repository PostgreSQL in `diploma-p3` | `e042f4b6d011ac8b4017da6fcf72a8278f927ea53b2f260c4b5bc273eea83473` |
| M07 | `tests/unit/test_knowledge_processing.py` | 13 | parser/chunker/embedding unit cases | `7d3bdd8abcf78608503b54583a1991f5b0406a508dd214602c93d5f4584880d3` |
| M07 | `tests/integration/test_knowledge.py` | 21 | PostgreSQL/MinIO/pgvector and negative paths in `diploma-p3` | `0e51150eb035ea250ac5024c3c7cd6052070147290ed73298b2844c34def492c` |
| M07 | `tests/integration/test_knowledge_real_model.py` | 1 | bundled offline local FastEmbed model | `fbd18afaca41d90cc59ede1700a0c5e8671be23b17ab54a1aafdb115ae083b97` |
| Shared reconstruction | `tests/reconstruction/test_p2_static.py` | 6 | host Python 3.12 static regression; separate from historical 114 | `76afc2fb1f2f2d46966376f9434ed231c7fac3c2004c115a875df1635112a7ba` |
| **M08 excluded** | `tests/unit/test_m08_provider.py` | 5 | scripted provider-adapter unit scope; not executed in P3 | `27f757069249df84a40a3a3df7bd9862b59c475e8f7daa6bbd8ee358c480e56c` |

Expected M01–M07 regression count is 114: M02 15 + M03 9 + M04 23 + M05 11 + shared acceptance 2 + M06 19 + M07 35. M01 additionally requires operational Compose/health/restart evidence; its regression dependency is the M02 foundation set. No later-research tests exist in the recovered tree.

## Test-function inventory

### M02

- `test_tenant_context_is_transaction_local`
- `test_migration_revision_and_required_tables`
- `test_constraints_and_cross_tenant_composite_fk`
- `test_required_unique_and_version_constraints_exist`
- `test_unique_check_and_positive_version_are_enforced`
- `test_transaction_rollback_does_not_persist_product`
- `test_forecast_artifact_fk_is_required`
- `test_runtime_role_has_rls_without_bypass`
- `test_all_tenant_tables_have_forced_rls_and_policy`
- `test_runtime_grants_are_least_privilege`
- `test_runtime_cannot_disable_rls`
- `test_runtime_cannot_insert_foreign_tenant_row`
- `test_sqlalchemy_tenant_transaction_resets_on_pool_reuse`
- `test_missing_context_fails_closed_and_other_tenant_is_hidden`
- `test_transaction_local_context_does_not_leak_through_pool`

### M03

- `test_repository_read_is_tenant_scoped`
- `test_cross_tenant_and_missing_order_are_not_accessible`
- `test_money_is_exact_decimal_and_rejects_float`
- `test_order_creation_is_atomic_audited_and_idempotent`
- `test_stale_quote_and_changed_idempotency_payload_fail`
- `test_last_unit_concurrency_cannot_oversell`
- `test_multi_line_insufficiency_keeps_all_inventory_unchanged`
- `test_explicit_transaction_rollback_removes_order`
- `test_unknown_operation_is_durable_and_requires_reconciliation`

### M04

- `test_exact_registry_and_strict_extra_field_rejection`
- `test_find_product_search_cursor_empty_and_tamper`
- `test_check_inventory_is_read_only_and_customer_lookup_is_minimal`
- `test_create_order_get_order_replay_and_audit`
- `test_reserve_inventory_and_labelled_owner_report`
- `test_update_order_is_controlled_policy_block_not_fake_mutation`
- `test_delivery_unavailable_is_not_order_status`
- `test_forecast_without_artifact_fails_truthfully_and_creates_no_run`
- `test_support_cannot_write_and_foreign_order_has_no_effect`
- `test_every_tool_rejects_forbidden_specialist_with_durable_evidence`
- `test_delivery_adapter_timeout_and_dependency_failure_are_typed`
- `test_delivery_reference_without_configured_adapter_is_dependency_unavailable`
- `test_expired_trusted_context_fails_closed_with_pre_admission_audit`

### M05

- `test_valid_owner_token_resolves_only_own_membership`
- `test_wrong_issuer_audience_expiry_or_token_type_is_rejected`
- `test_invalid_signature_and_unsupported_algorithm_are_rejected`
- `test_platform_admin_is_not_automatically_business_owner`
- `test_q01_same_account_is_tenant_scoped_and_channels_do_not_merge`
- `test_customer_owns_only_linked_order_and_uuid_is_not_authority`
- `test_operator_needs_explicit_escalation_assignment`
- `test_live_keycloak_token_jwks_membership_and_wrong_audience`

### Shared M03–M05 acceptance

- `test_positive_find_check_create_reserve_persists_effect_and_evidence`
- `test_negative_foreign_resource_and_forbidden_agent_have_no_business_effect`

### M06

- `test_model_hints_reject_trusted_control_fields`
- `test_order_truth_beats_derived_summary`
- `test_current_inventory_beats_document_and_policy_beats_injection`
- `test_current_published_document_beats_retired_and_equal_authority_conflicts`
- `test_canonical_digest_ignores_observation_clock_but_not_source_version`
- `test_development_limits_reject_zero_and_text_projection_redacts_credentials`
- `test_seven_typed_parts_provenance_minimal_projection_and_no_write`
- `test_customer_owned_order_and_foreign_tenant_order_are_distinguished_safely`
- `test_same_tenant_other_customer_order_is_not_exposed`
- `test_summary_cannot_override_current_order_and_digest_is_repeatable`
- `test_bounded_history_and_stale_inventory_are_explicit`
- `test_architecture_mode_never_changes_structured_truth_or_tool_matrix`
- `test_run_agent_mismatch_fails_closed`
- `test_owner_analytics_report_and_nonowner_denial`
- `test_foreign_knowledge_provider_result_fails_closed`
- `test_same_tenant_staff_knowledge_is_not_exposed_to_customer`

### M07

- `test_plain_text_utf8_normalization_and_locator`
- `test_parser_rejects_unsupported_empty_and_malformed`
- `test_chunking_is_deterministic_with_overlap`
- `test_embedding_shape_revision_and_finite_values`
- `test_bad_embedding_dimension_finite_or_zero_rejected`
- `test_embedding_provider_error_is_typed`
- `test_development_overlap_must_be_smaller_than_chunk`
- `test_real_minio_pgvector_private_hash_and_provenance`
- `test_anonymous_minio_read_denied`
- `test_v1_v2_stage_ready_publish_revoke_sequence`
- `test_failed_v2_preserves_published_v1`
- `test_incomplete_or_unpublished_version_cannot_be_read_or_published`
- `test_tenant_and_staff_acl_filter_before_vector_result`
- `test_owner_permission_required_for_upload_publish_and_revoke`
- `test_invalid_upload_rejected_before_object`
- `test_oversized_upload_rejected`
- `test_parse_failure_does_not_publish_partial_version`
- `test_object_hash_tamper_fails_and_keeps_unpublished`
- `test_object_upload_failure_is_typed_and_failed`
- `test_object_read_failure_is_typed_and_keeps_current_version`
- `test_embedding_failure_and_dimension_mismatch_fail_closed`
- `test_embedding_revision_change_requires_new_version_path`
- `test_publication_rejects_incomplete_chunk_metadata`
- `test_postgres_unavailable_is_typed`
- `test_malicious_document_is_data_only_in_brain`
- `test_empty_retrieval_query_is_explicit`
- `test_local_model_ranks_public_development_refund_example`

### Shared reconstruction/common gate

- `test_all_python_sources_parse`
- `test_backend_absolute_imports_resolve_in_source_tree`
- `test_migration_chain_and_approved_schema_digest`
- `test_frozen_ten_tool_names_and_role_scopes`
- `test_e02_unknown_and_pre_artifact_forecast_guards_exist`
- `test_no_secret_environment_or_frontend_was_restored`

### Explicitly excluded from P3: M08 provider/live scope

- `test_structured_reply_normalizes_usage_and_version`
- `test_native_function_call_remains_unexecuted_proposal`
- `test_authentication_failure_is_not_retried`
- `test_rate_limit_retries_once_then_succeeds`
- `test_multiple_function_calls_are_rejected_without_execution`

Reason: M08 is a separate milestone and remains PARTIAL/BLOCKED/DEFERRED. No live/external M08 acceptance file was recovered into the active tree; no provider call is authorized for P3.
