-- Referral & Affiliate Program Schema

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 10,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 10,
  uses_count INT DEFAULT 0,
  total_commission_earned NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral redemptions (one per referrer-user pair)
CREATE TABLE IF NOT EXISTS referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_amount NUMERIC(12,2) NOT NULL,
  discount_applied NUMERIC(12,2),
  referrer_payout_id UUID REFERENCES referral_payouts(id),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referral_code_id, referred_user_id)
);

-- Referral payouts (commission payouts to referrers)
CREATE TABLE IF NOT EXISTS referral_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  payment_details JSONB,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_org ON referral_codes(organization_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_redemptions_code ON referral_redemptions(referral_code_id);
CREATE INDEX idx_referral_redemptions_user ON referral_redemptions(referred_user_id);
CREATE INDEX idx_referral_payouts_org ON referral_payouts(organization_id);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_codes_org_isolation ON referral_codes
  FOR ALL USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_redemptions_view ON referral_redemptions
  FOR SELECT USING (
    referral_code_id IN (SELECT id FROM referral_codes WHERE organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()))
  );

ALTER TABLE referral_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_payouts_org_isolation ON referral_payouts
  FOR ALL USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));
