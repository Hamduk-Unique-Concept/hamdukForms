-- =========================================
-- PUBLIC SCHEMA: COLUMNS / TABLE STRUCTURE
-- =========================================

SELECT
    table_name,
    ordinal_position AS column_position,
    column_name,
    data_type,
    udt_name AS postgres_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

[
  {
    "table_name": "activity_logs",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "activity_logs",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 3,
    "column_name": "user_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 4,
    "column_name": "activity_type",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 5,
    "column_name": "description",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 6,
    "column_name": "resource_type",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 7,
    "column_name": "resource_id",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "activity_logs",
    "column_position": 8,
    "column_name": "metadata",
    "data_type": "jsonb",
    "postgres_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_name": "activity_logs",
    "column_position": 9,
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "postgres_type": "timestamp",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "addon_products",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "addon_products",
    "column_position": 2,
    "column_name": "addon_type",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 3,
    "column_name": "display_name",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 4,
    "column_name": "description",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 5,
    "column_name": "unit_price",
    "data_type": "numeric",
    "postgres_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 6,
    "column_name": "currency",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": "'USD'::text"
  },
  {
    "table_name": "addon_products",
    "column_position": 7,
    "column_name": "stripe_product_id",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 8,
    "column_name": "stripe_price_id",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 9,
    "column_name": "stripe_price_id_monthly",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 10,
    "column_name": "is_recurring",
    "data_type": "boolean",
    "postgres_type": "bool",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "addon_products",
    "column_position": 11,
    "column_name": "billing_interval",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "addon_products",
    "column_position": 12,
    "column_name": "active",
    "data_type": "boolean",
    "postgres_type": "bool",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_name": "addon_products",
    "column_position": 13,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "api_keys",
    "column_position": 1,
    "column_name": "id",
    "data_type": "bigint",
    "postgres_type": "int8",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "api_keys",
    "column_position": 2,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "api_keys",
    "column_position": 3,
    "column_name": "key_hash",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_keys",
    "column_position": 4,
    "column_name": "name",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_keys",
    "column_position": 5,
    "column_name": "rate_limit",
    "data_type": "integer",
    "postgres_type": "int4",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_keys",
    "column_position": 6,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_keys",
    "column_position": 7,
    "column_name": "key_prefix",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "audit_logs",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 3,
    "column_name": "user_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 4,
    "column_name": "action",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 5,
    "column_name": "entity_type",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 6,
    "column_name": "entity_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 7,
    "column_name": "old_values",
    "data_type": "jsonb",
    "postgres_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 8,
    "column_name": "new_values",
    "data_type": "jsonb",
    "postgres_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 9,
    "column_name": "ip_address",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 10,
    "column_name": "user_agent",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "audit_logs",
    "column_position": 11,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "billing_history",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "billing_history",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 3,
    "column_name": "stripe_invoice_id",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 4,
    "column_name": "amount",
    "data_type": "numeric",
    "postgres_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 5,
    "column_name": "currency",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": "'USD'::text"
  },
  {
    "table_name": "billing_history",
    "column_position": 6,
    "column_name": "status",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 7,
    "column_name": "description",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 8,
    "column_name": "invoice_pdf_url",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 9,
    "column_name": "paid_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "billing_history",
    "column_position": 10,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "billing_history",
    "column_position": 11,
    "column_name": "paystack_reference",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 3,
    "column_name": "user_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 4,
    "column_name": "plan_id",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 5,
    "column_name": "full_name",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 6,
    "column_name": "email",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 7,
    "column_name": "phone",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 8,
    "column_name": "company",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 9,
    "column_name": "status",
    "data_type": "character varying",
    "postgres_type": "varchar",
    "is_nullable": "YES",
    "column_default": "'pending'::character varying"
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 10,
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "postgres_type": "timestamp",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "checkout_sessions",
    "column_position": 11,
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "postgres_type": "timestamp",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "email_templates",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "email_templates",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 3,
    "column_name": "name",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 4,
    "column_name": "description",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 5,
    "column_name": "email_type",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 6,
    "column_name": "template_html",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 7,
    "column_name": "template_text",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 8,
    "column_name": "variables",
    "data_type": "jsonb",
    "postgres_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_name": "email_templates",
    "column_position": 9,
    "column_name": "is_default",
    "data_type": "boolean",
    "postgres_type": "bool",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "email_templates",
    "column_position": 10,
    "column_name": "is_active",
    "data_type": "boolean",
    "postgres_type": "bool",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "table_name": "email_templates",
    "column_position": 11,
    "column_name": "created_by",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "email_templates",
    "column_position": 12,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "email_templates",
    "column_position": 13,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "field_analytics",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "field_analytics",
    "column_position": 2,
    "column_name": "form_field_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "field_analytics",
    "column_position": 3,
    "column_name": "form_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "field_analytics",
    "column_position": 4,
    "column_name": "total_responses",
    "data_type": "integer",
    "postgres_type": "int4",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "field_analytics",
    "column_position": 5,
    "column_name": "completion_rate",
    "data_type": "numeric",
    "postgres_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "field_analytics",
    "column_position": 6,
    "column_name": "most_common_value",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "field_analytics",
    "column_position": 7,
    "column_name": "average_value",
    "data_type": "numeric",
    "postgres_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "field_analytics",
    "column_position": 8,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "field_analytics",
    "column_position": 9,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "file_uploads",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "file_uploads",
    "column_position": 2,
    "column_name": "organization_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 3,
    "column_name": "form_response_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 4,
    "column_name": "uploaded_by",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 5,
    "column_name": "file_name",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 6,
    "column_name": "file_type",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 7,
    "column_name": "file_size",
    "data_type": "integer",
    "postgres_type": "int4",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 8,
    "column_name": "file_url",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 9,
    "column_name": "is_virus_scanned",
    "data_type": "boolean",
    "postgres_type": "bool",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "file_uploads",
    "column_position": 10,
    "column_name": "scan_result",
    "data_type": "text",
    "postgres_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "file_uploads",
    "column_position": 11,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "postgres_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "form_analytics",
    "column_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "form_analytics",
    "column_position": 2,
    "column_name": "form_id",
    "data_type": "uuid",
    "postgres_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "form_analytics",
    "column_position": 3,
    "column_name": "date",
    "data_type": "date",
    "postgres_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "form_analytics",
    "column_position": 4,
    "column_name": "views",
    "data_type": "integer",
    "postgres_type": "int4",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "form_analytics",
    "column_position": 5,
    "column_name": "starts",
    "data_type": "integer",
    "postgres_type": "int4",
    "is_nullable": "YES",
    "column_default": "0"
  }
]

-- =========================================
-- PUBLIC SCHEMA: ROW LEVEL SECURITY POLICIES
-- =========================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

[
  {
    "schemaname": "public",
    "tablename": "activity_logs",
    "policyname": "View activity logs",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = activity_logs.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "addon_products",
    "policyname": "Anyone can view active addons",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(active = true)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "api_keys",
    "policyname": "View organization API keys",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = api_keys.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "audit_logs",
    "policyname": "View audit logs",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = audit_logs.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "billing_history",
    "policyname": "Users can view their org billing",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_fields",
    "policyname": "View form fields",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM (forms f\n     JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = form_fields.form_id) AND (om.user_id = auth.uid()) AND (om.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_fields",
    "policyname": "form_fields_delete_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.organization_id IN ( SELECT organizations.id\n           FROM organizations\n          WHERE (organizations.owner_id = auth.uid())))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_fields",
    "policyname": "form_fields_insert_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.organization_id IN ( SELECT organizations.id\n           FROM organizations\n          WHERE (organizations.owner_id = auth.uid())\n        UNION\n         SELECT user_organizations.organization_id\n           FROM user_organizations\n          WHERE ((user_organizations.user_id = auth.uid()) AND ((user_organizations.role)::text = ANY ((ARRAY['admin'::character varying, 'editor'::character varying])::text[])))))))"
  },
  {
    "schemaname": "public",
    "tablename": "form_fields",
    "policyname": "form_fields_select_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.organization_id IN ( SELECT organizations.id\n           FROM organizations\n          WHERE (organizations.owner_id = auth.uid())\n        UNION\n         SELECT user_organizations.organization_id\n           FROM user_organizations\n          WHERE (user_organizations.user_id = auth.uid())))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_fields",
    "policyname": "form_fields_update_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.organization_id IN ( SELECT organizations.id\n           FROM organizations\n          WHERE (organizations.owner_id = auth.uid())\n        UNION\n         SELECT user_organizations.organization_id\n           FROM user_organizations\n          WHERE ((user_organizations.user_id = auth.uid()) AND ((user_organizations.role)::text = ANY ((ARRAY['admin'::character varying, 'editor'::character varying])::text[])))))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_publish_links",
    "policyname": "Anyone can view published form links",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((is_published = true) OR (auth.uid() IN ( SELECT forms.created_by\n   FROM forms\n  WHERE (forms.id = form_publish_links.form_id))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_publish_links",
    "policyname": "Form creators can manage publish links",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() IN ( SELECT forms.created_by\n   FROM forms\n  WHERE (forms.id = form_publish_links.form_id)))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_response_analytics",
    "policyname": "Form creators can view form analytics",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IN ( SELECT forms.created_by\n   FROM forms\n  WHERE (forms.id = form_response_analytics.form_id)))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_responses",
    "policyname": "Anyone can submit to published forms",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(form_id IN ( SELECT form_publish_links.form_id\n   FROM form_publish_links\n  WHERE (form_publish_links.is_published = true)))"
  },
  {
    "schemaname": "public",
    "tablename": "form_responses",
    "policyname": "Form creators can view responses",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.created_by = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_responses",
    "policyname": "Insert form responses",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM forms\n  WHERE ((forms.id = form_responses.form_id) AND (forms.is_published = true))))"
  },
  {
    "schemaname": "public",
    "tablename": "form_responses",
    "policyname": "Members can view responses in organization",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = form_responses.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true)))) OR (user_id = auth.uid()))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "form_responses",
    "policyname": "View form responses",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM (forms f\n     JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = form_responses.form_id) AND (om.user_id = auth.uid()) AND (om.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "Members can view forms in organization",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((is_public = true) OR (EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = forms.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "Organization members can create forms",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = forms.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))"
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "Organization members can view forms",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = forms.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "forms_delete_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "forms_insert_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid()))) OR (organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE ((user_organizations.user_id = auth.uid()) AND ((user_organizations.role)::text = 'admin'::text)))))"
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "forms_select_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid())\nUNION\n SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "forms",
    "policyname": "forms_update_policy",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "((organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid()))) OR (organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE ((user_organizations.user_id = auth.uid()) AND ((user_organizations.role)::text = 'admin'::text)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "integrations",
    "policyname": "View integrations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = integrations.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "organization_members",
    "policyname": "View organization members",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((user_id = auth.uid()) OR (organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "organizations",
    "policyname": "Only owners can delete organizations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(owner_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "organizations",
    "policyname": "Only owners can update organizations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(owner_id = auth.uid())",
    "with_check": "(owner_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "organizations",
    "policyname": "Organization members can view org",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = organizations.id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "organizations",
    "policyname": "Users can view their organizations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((owner_id = auth.uid()) OR (id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payment_providers",
    "policyname": "Users can manage own payment providers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payment_providers",
    "policyname": "Users can view own payment providers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payment_transactions",
    "policyname": "Users can create payment transactions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "payment_transactions",
    "policyname": "Users can view own payment transactions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "plan_features",
    "policyname": "Plan features are publicly readable",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "plans",
    "policyname": "Plans are publicly readable",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "policyname": "Anyone can view active promo codes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((is_active = true) AND (valid_until > CURRENT_TIMESTAMP))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "referral_codes",
    "policyname": "Users manage their own referral codes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "referral_codes",
    "policyname": "referral_codes_org_isolation",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "((user_id = auth.uid()) OR (organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid()))))",
    "with_check": "((user_id = auth.uid()) OR (organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid()))))"
  },
  {
    "schemaname": "public",
    "tablename": "referral_payouts",
    "policyname": "referral_payouts_org_isolation",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid())))",
    "with_check": "(organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid())))"
  },
  {
    "schemaname": "public",
    "tablename": "referral_redemptions",
    "policyname": "referral_redemptions_view",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(referral_code_id IN ( SELECT referral_codes.id\n   FROM referral_codes\n  WHERE ((referral_codes.user_id = auth.uid()) OR (referral_codes.organization_id IN ( SELECT user_organizations.organization_id\n           FROM user_organizations\n          WHERE (user_organizations.user_id = auth.uid()))))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "refund_requests",
    "policyname": "Form owners manage refunds",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (forms f\n     LEFT JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = refund_requests.form_id) AND ((f.created_by = auth.uid()) OR ((om.user_id = auth.uid()) AND (om.is_active = true) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM (forms f\n     LEFT JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = refund_requests.form_id) AND ((f.created_by = auth.uid()) OR ((om.user_id = auth.uid()) AND (om.is_active = true) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))"
  },
  {
    "schemaname": "public",
    "tablename": "refund_requests",
    "policyname": "Public can request refunds for own payment",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() IS NOT NULL)"
  },
  {
    "schemaname": "public",
    "tablename": "security_sessions",
    "policyname": "View own sessions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_addons",
    "policyname": "Users can insert addons",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_addons",
    "policyname": "Users can update addons",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_addons",
    "policyname": "Users can view org addons",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_addons",
    "policyname": "Users can view their org addons",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((organization_id IN ( SELECT organizations.id\n   FROM organizations\n  WHERE (organizations.owner_id = auth.uid()))) OR (organization_id IN ( SELECT user_organizations.organization_id\n   FROM user_organizations\n  WHERE (user_organizations.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscriptions",
    "policyname": "Organization admins can manage subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(organization_id IN ( SELECT organization_members.organization_id\n   FROM organization_members\n  WHERE ((organization_members.user_id = auth.uid()) AND (organization_members.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscriptions",
    "policyname": "Organization members can view subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((auth.uid() = user_id) OR (organization_id IN ( SELECT organization_members.organization_id\n   FROM organization_members\n  WHERE (organization_members.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "tickets",
    "policyname": "Form owners manage tickets",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (forms f\n     JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = tickets.form_id) AND (om.user_id = auth.uid()) AND (om.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "tickets",
    "policyname": "Public can validate tickets",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "two_factor_auth",
    "policyname": "View own 2FA",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "usage_tracking",
    "policyname": "Service can insert/update usage",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))"
  },
  {
    "schemaname": "public",
    "tablename": "usage_tracking",
    "policyname": "Service can update usage",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "usage_tracking",
    "policyname": "Users can view org usage",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(organization_id IN ( SELECT user_organization_roles.organization_id\n   FROM user_organization_roles\n  WHERE (user_organization_roles.user_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_2fa",
    "policyname": "Users can manage own 2fa",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_2fa",
    "policyname": "Users can view own 2fa",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_api_keys",
    "policyname": "Users can manage own API keys",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_api_keys",
    "policyname": "Users can view own API keys",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_integrations",
    "policyname": "Users can manage own integrations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_integrations",
    "policyname": "Users can view own integrations",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_organizations",
    "policyname": "Users can view their memberships",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_profiles",
    "policyname": "Users can update own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_profiles",
    "policyname": "Users can view own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_sessions",
    "policyname": "Users can view own sessions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "policyname": "Users can view their own subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Users can update own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Users can view own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "waitlist_entries",
    "policyname": "Form owners manage waitlists",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (forms f\n     LEFT JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = waitlist_entries.form_id) AND ((f.created_by = auth.uid()) OR ((om.user_id = auth.uid()) AND (om.is_active = true) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM (forms f\n     LEFT JOIN organization_members om ON ((om.organization_id = f.organization_id)))\n  WHERE ((f.id = waitlist_entries.form_id) AND ((f.created_by = auth.uid()) OR ((om.user_id = auth.uid()) AND (om.is_active = true) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))"
  },
  {
    "schemaname": "public",
    "tablename": "waitlist_entries",
    "policyname": "Public can join waitlist",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM forms f\n  WHERE ((f.id = waitlist_entries.form_id) AND (f.is_published = true))))"
  },
  {
    "schemaname": "public",
    "tablename": "webhooks",
    "policyname": "Form creators can manage webhooks",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "((auth.uid() = user_id) OR (form_id IN ( SELECT forms.id\n   FROM forms\n  WHERE (forms.created_by = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "webhooks",
    "policyname": "Organization admins can manage webhooks",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "((auth.uid() = user_id) OR (organization_id IN ( SELECT organization_members.organization_id\n   FROM organization_members\n  WHERE ((organization_members.user_id = auth.uid()) AND (organization_members.role = 'admin'::text)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "webhooks",
    "policyname": "Organization admins can view webhooks",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((auth.uid() = user_id) OR (organization_id IN ( SELECT organization_members.organization_id\n   FROM organization_members\n  WHERE ((organization_members.user_id = auth.uid()) AND (organization_members.role = 'admin'::text)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "webhooks",
    "policyname": "View webhooks",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = webhooks.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "workspaces",
    "policyname": "Workspace members can view",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM organization_members\n  WHERE ((organization_members.organization_id = workspaces.organization_id) AND (organization_members.user_id = auth.uid()) AND (organization_members.is_active = true))))",
    "with_check": null
  }
]

-- =========================================
-- PUBLIC SCHEMA: TABLES
-- =========================================

SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

[
  {
    "table_schema": "public",
    "table_name": "activity_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "addon_products",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "api_keys",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "audit_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "billing_history",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "checkout_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "email_templates",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "field_analytics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "file_uploads",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_analytics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_field_analytics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_fields",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_page_analytics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_publish_links",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_response_analytics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_responses",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_templates",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "form_versions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "forms",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "integration_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "integrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "invoices",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "notifications",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "organization_members",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "organizations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "payment_accounts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "payment_providers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "payment_transactions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "payments",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "plan_features",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "plans",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "promo_code_usage",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "promo_codes",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "referral_codes",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "referral_payouts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "referral_redemptions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "refund_requests",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "response_comments",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "response_history",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "response_values",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "security_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "subscription_addons",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "subscription_plans",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "subscriptions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "team_invitations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "tickets",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "two_factor_auth",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "usage_tracking",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_2fa",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_api_keys",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_integrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_organization_roles",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_organizations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_profiles",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_subscriptions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "users",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "waitlist_entries",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "webhook_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "webhooks",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "workspaces",
    "table_type": "BASE TABLE"
  }
]