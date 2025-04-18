
-- Create database (run this separately)
-- CREATE DATABASE itemexchange;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  balance NUMERIC(10, 2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  seller_id UUID NOT NULL REFERENCES users(id),
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table - Using PARTITION BY RANGE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions by month (example for a year)
CREATE TABLE transactions_y2023m01 PARTITION OF transactions
    FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
    
CREATE TABLE transactions_y2023m02 PARTITION OF transactions
    FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');
    
CREATE TABLE transactions_y2023m03 PARTITION OF transactions
    FOR VALUES FROM ('2023-03-01') TO ('2023-04-01');
    
CREATE TABLE transactions_y2023m04 PARTITION OF transactions
    FOR VALUES FROM ('2023-04-01') TO ('2023-05-01');
    
CREATE TABLE transactions_y2023m05 PARTITION OF transactions
    FOR VALUES FROM ('2023-05-01') TO ('2023-06-01');
    
CREATE TABLE transactions_y2023m06 PARTITION OF transactions
    FOR VALUES FROM ('2023-06-01') TO ('2023-07-01');
    
CREATE TABLE transactions_y2023m07 PARTITION OF transactions
    FOR VALUES FROM ('2023-07-01') TO ('2023-08-01');
    
CREATE TABLE transactions_y2023m08 PARTITION OF transactions
    FOR VALUES FROM ('2023-08-01') TO ('2023-09-01');
    
CREATE TABLE transactions_y2023m09 PARTITION OF transactions
    FOR VALUES FROM ('2023-09-01') TO ('2023-10-01');
    
CREATE TABLE transactions_y2023m10 PARTITION OF transactions
    FOR VALUES FROM ('2023-10-01') TO ('2023-11-01');
    
CREATE TABLE transactions_y2023m11 PARTITION OF transactions
    FOR VALUES FROM ('2023-11-01') TO ('2023-12-01');
    
CREATE TABLE transactions_y2023m12 PARTITION OF transactions
    FOR VALUES FROM ('2023-12-01') TO ('2024-01-01');
    
-- Partition for current and future data
CREATE TABLE transactions_current PARTITION OF transactions
    FOR VALUES FROM ('2024-01-01') TO (MAXVALUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_seller ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);

-- Create function to automatically create new partitions
CREATE OR REPLACE FUNCTION create_transaction_partition_and_indexes()
RETURNS TRIGGER AS $$
DECLARE
  partition_date TEXT;
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := date_trunc('month', NEW.created_at)::DATE;
  end_date := (date_trunc('month', NEW.created_at) + INTERVAL '1 month')::DATE;
  partition_date := to_char(NEW.created_at, 'y"y"YYYY"m"MM');
  partition_name := 'transactions_' || partition_date;
  
  -- Check if the partition exists
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace 
                WHERE c.relname = partition_name AND n.nspname = 'public') THEN
    -- Create a new partition
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF transactions 
                  FOR VALUES FROM (%L) TO (%L)', 
                  partition_name, start_date, end_date);
    
    -- Create indexes on the new partition
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_seller ON %I(seller_id)', 
                  partition_name, partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_buyer ON %I(buyer_id)', 
                  partition_name, partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_date ON %I(created_at)', 
                  partition_name, partition_name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create partitions
CREATE TRIGGER create_transaction_partition_trigger
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION create_transaction_partition_and_indexes();
