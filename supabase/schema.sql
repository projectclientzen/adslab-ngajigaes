-- ============================================
-- ADS LAB Ngajigaes — Full Schema Migration
-- Jalankan SEKALI di Supabase SQL Editor
-- ============================================

-- ─── 001_create_ads_detail.sql ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ads_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id TEXT UNIQUE NOT NULL,
    advertiser_name TEXT,
    ad_copy TEXT,
    creative_type TEXT CHECK (creative_type IN ('image', 'video', 'carousel')),
    cta_button TEXT,
    destination_url TEXT,
    date_active TIMESTAMPTZ,
    funnel_type TEXT CHECK (funnel_type IN ('LP', 'CTWA', 'Visit Profile', 'Lead Form')),
    funnel_override TEXT,
    campaign_stage TEXT CHECK (campaign_stage IN ('TOFU', 'MOFU', 'BOFU')),
    stage_confidence FLOAT CHECK (stage_confidence >= 0 AND stage_confidence <= 1),
    stage_override TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_detail_advertiser ON ads_detail(advertiser_name);
CREATE INDEX IF NOT EXISTS idx_ads_detail_funnel ON ads_detail(funnel_type);
CREATE INDEX IF NOT EXISTS idx_ads_detail_created ON ads_detail(created_at DESC);


-- ─── 002_create_campaign_snapshots.sql ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS campaign_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL CHECK (brand IN ('ngajigaes', 'labbaika', 'alaika')),
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    adset_id TEXT,
    adset_name TEXT,
    ad_id TEXT,
    ad_name TEXT,
    level TEXT NOT NULL CHECK (level IN ('campaign', 'adset', 'ad')),
    date_start DATE NOT NULL,
    date_stop DATE NOT NULL,
    spend NUMERIC(12,2),
    reach INTEGER,
    impressions INTEGER,
    clicks INTEGER,
    ctr NUMERIC(6,4),
    cpm NUMERIC(10,2),
    frequency NUMERIC(6,4),
    purchases INTEGER,
    purchase_value NUMERIC(12,2),
    leads INTEGER,
    roas NUMERIC(8,4),
    cpl NUMERIC(10,2),
    cpp NUMERIC(10,2),
    status TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_kpi_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL CHECK (brand IN ('ngajigaes', 'labbaika', 'alaika')),
    campaign_id TEXT NOT NULL,
    kpi_type TEXT NOT NULL CHECK (kpi_type IN ('roas', 'cpl', 'cpp', 'reach', 'spend')),
    target_value NUMERIC(12,4) NOT NULL,
    set_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, kpi_type)
);

CREATE INDEX IF NOT EXISTS idx_campaign_snapshots_brand_date
    ON campaign_snapshots(brand, date_start DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_snapshots_campaign_level
    ON campaign_snapshots(campaign_id, level);

CREATE INDEX IF NOT EXISTS idx_campaign_snapshots_fetched_at
    ON campaign_snapshots(fetched_at DESC);


-- ─── 003_add_snapshot_unique.sql ───
UPDATE campaign_snapshots
SET
    adset_id = COALESCE(adset_id, ''),
    ad_id = COALESCE(ad_id, '')
WHERE adset_id IS NULL OR ad_id IS NULL;

ALTER TABLE campaign_snapshots
    ALTER COLUMN adset_id SET DEFAULT '',
    ALTER COLUMN adset_id SET NOT NULL,
    ALTER COLUMN ad_id SET DEFAULT '',
    ALTER COLUMN ad_id SET NOT NULL;

ALTER TABLE campaign_snapshots
    ADD CONSTRAINT uq_snapshot_identity
    UNIQUE (brand, campaign_id, adset_id, ad_id, level, date_start, date_stop);


-- ─── 004_create_fetch_status.sql ───
CREATE TABLE IF NOT EXISTS fetch_status (
    brand TEXT PRIMARY KEY CHECK (brand IN ('ngajigaes', 'labbaika', 'alaika')),
    last_fetched_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('success', 'error')),
    error_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fetch_status (brand)
VALUES
    ('ngajigaes'),
    ('labbaika'),
    ('alaika')
ON CONFLICT (brand) DO NOTHING;


-- ─── 005_create_alert_log.sql ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS alert_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_key TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL CHECK (brand IN ('ngajigaes', 'labbaika', 'alaika')),
    type TEXT NOT NULL,
    campaign_id TEXT,
    message_text TEXT NOT NULL,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    dry_run BOOLEAN NOT NULL DEFAULT FALSE,
    telegram_message_id TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_log_brand_sent_at
    ON alert_log (brand, sent_at DESC);


