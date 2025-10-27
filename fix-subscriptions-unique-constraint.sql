-- Ensure user_email has a UNIQUE constraint in subscriptions table
-- This is required for the upsert operation in the Stripe webhook

-- Drop constraint if it exists, then add it (to ensure it's correct)
DO $$ 
BEGIN
  -- Try to drop the constraint if it exists
  BEGIN
    ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_email_key;
    RAISE NOTICE 'Dropped existing constraint (if any)';
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'No existing constraint to drop';
  END;
  
  -- Add the unique constraint
  ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_user_email_key UNIQUE (user_email);
  
  RAISE NOTICE '✅ Added UNIQUE constraint on user_email column';
END $$;

-- Verify the constraint was added
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  'Constraint exists!' AS status
FROM pg_constraint
WHERE conrelid = 'subscriptions'::regclass
  AND conname = 'subscriptions_user_email_key';

