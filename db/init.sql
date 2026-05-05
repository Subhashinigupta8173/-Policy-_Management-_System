-- InsureX Policy Management System — Database Schema + Seed Data
-- Run with: psql -U postgres -d insurexdb -f init.sql

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    phone         VARCHAR(20),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_products (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    type            VARCHAR(20)   NOT NULL,
    base_premium    NUMERIC(12,2) NOT NULL,
    description     TEXT,
    min_age         INTEGER NOT NULL DEFAULT 18,
    max_age         INTEGER NOT NULL DEFAULT 65,
    coverage_amount NUMERIC(15,2) NOT NULL,
    terms_json      TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS policies (
    id             BIGSERIAL PRIMARY KEY,
    policy_number  VARCHAR(50)   UNIQUE,
    user_id        BIGINT        NOT NULL REFERENCES users(id),
    product_id     BIGINT        NOT NULL REFERENCES insurance_products(id),
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    premium_amount NUMERIC(12,2) NOT NULL,
    start_date     DATE,
    end_date       DATE,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    kyc_doc_path   VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS claims (
    id                BIGSERIAL PRIMARY KEY,
    claim_number      VARCHAR(50)   NOT NULL UNIQUE,
    policy_id         BIGINT        NOT NULL REFERENCES policies(id),
    user_id           BIGINT        NOT NULL REFERENCES users(id),
    status            VARCHAR(20)   NOT NULL DEFAULT 'SUBMITTED',
    incident_date     DATE,
    description       TEXT,
    proof_doc_path    VARCHAR(500),
    adjuster_id       BIGINT        REFERENCES users(id),
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    settlement_amount NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS renewal_reminders (
    id             BIGSERIAL PRIMARY KEY,
    policy_id      BIGINT NOT NULL REFERENCES policies(id),
    scheduled_date DATE   NOT NULL,
    sent_at        TIMESTAMP
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_policies_user_id     ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_status      ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_end_date    ON policies(end_date);
CREATE INDEX IF NOT EXISTS idx_claims_user_id       ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id     ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status        ON claims(status);
CREATE INDEX IF NOT EXISTS idx_renewal_policy_date  ON renewal_reminders(policy_id, scheduled_date);

-- ─────────────────────────────────────────────
-- SEED: Insurance Products
-- ─────────────────────────────────────────────
INSERT INTO insurance_products (name, type, base_premium, description, min_age, max_age, coverage_amount, terms_json, active)
VALUES
(
    'SecureLife Premium',
    'LIFE',
    8000.00,
    'Comprehensive life insurance providing financial security to your loved ones. Covers natural death, accidental death, and terminal illness.',
    18, 65,
    2500000.00,
    '{"waiting_period_months":3,"max_claim_count":1,"exclusions":["suicide within 1 year","war","self-inflicted injury"],"riders":["accidental death benefit","critical illness rider"]}',
    TRUE
),
(
    'HealthShield Plus',
    'HEALTH',
    5000.00,
    'All-inclusive health insurance for individuals and families. Covers hospitalisation, surgery, diagnostics, and pre/post care.',
    18, 70,
    500000.00,
    '{"waiting_period_months":1,"pre_existing_waiting_months":24,"daycare_procedures":true,"room_rent_limit":5000,"exclusions":["cosmetic surgery","dental unless accident"]}',
    TRUE
),
(
    'DriveGuard Comprehensive',
    'VEHICLE',
    3500.00,
    'Complete vehicle insurance covering own damage, third-party liability, theft, and natural calamities. Cashless repairs at 5000+ garages.',
    18, 75,
    800000.00,
    '{"idv_percentage":100,"zero_depreciation":true,"roadside_assistance":true,"exclusions":["drunk driving","driving without licence","wear and tear"],"add_ons":["engine protection","key replacement"]}',
    TRUE
)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- SEED: Users
-- BCrypt hash of 'password123' (strength 10):
-- $2b$10$wxoV/TH5aFivMxtDkWJ2MObZA8ZAxmwDL0YiUvKeBxF9OA/1acNqK
-- ─────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role, phone)
VALUES
    ('Arjun Sharma',   'customer@insurex.com',    '$2b$10$wxoV/TH5aFivMxtDkWJ2MObZA8ZAxmwDL0YiUvKeBxF9OA/1acNqK', 'CUSTOMER',    '+91-9876543210'),
    ('Priya Verma',    'underwriter@insurex.com', '$2b$10$wxoV/TH5aFivMxtDkWJ2MObZA8ZAxmwDL0YiUvKeBxF9OA/1acNqK', 'UNDERWRITER', '+91-9876543211'),
    ('Rahul Gupta',    'adjuster@insurex.com',    '$2b$10$wxoV/TH5aFivMxtDkWJ2MObZA8ZAxmwDL0YiUvKeBxF9OA/1acNqK', 'ADJUSTER',    '+91-9876543212')
ON CONFLICT (email) DO NOTHING;
