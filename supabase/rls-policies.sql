-- ============================================================
-- CreditDesk: Row Level Security Policies & Auth Trigger
-- Run this in the Supabase SQL Editor after `prisma db push`
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS table policies
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- CONTACTS table policies
-- ============================================================
CREATE POLICY "Users can view own contacts"
  ON public.contacts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own contacts"
  ON public.contacts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own contacts"
  ON public.contacts FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- LEDGER_ENTRIES table policies
-- ============================================================
CREATE POLICY "Users can view own entries"
  ON public.ledger_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own entries"
  ON public.ledger_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
  ON public.ledger_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own entries"
  ON public.ledger_entries FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- PAYMENTS table policies
-- Payments are accessed through their parent ledger_entry,
-- so we check the entry's user_id
-- ============================================================
CREATE POLICY "Users can view payments on own entries"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ledger_entries
      WHERE ledger_entries.id = payments.ledger_entry_id
        AND ledger_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments on own entries"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ledger_entries
      WHERE ledger_entries.id = payments.ledger_entry_id
        AND ledger_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments on own entries"
  ON public.payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ledger_entries
      WHERE ledger_entries.id = payments.ledger_entry_id
        AND ledger_entries.user_id = auth.uid()
    )
  );

-- ============================================================
-- Auth trigger: auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Grant necessary permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
