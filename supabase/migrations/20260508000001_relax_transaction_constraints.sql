-- BUG 3 FIX: customer_last_name, customer_phone, customer_address, customer_postcode
-- are NOT NULL but generate-invoice only has first_name, email and postcode from the
-- sessions table at invoice creation time. Make them nullable so invoices can be saved.

ALTER TABLE public.transactions
  ALTER COLUMN customer_last_name DROP NOT NULL,
  ALTER COLUMN customer_phone DROP NOT NULL,
  ALTER COLUMN customer_address DROP NOT NULL,
  ALTER COLUMN customer_postcode DROP NOT NULL;
