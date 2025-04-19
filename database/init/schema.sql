
-- Create extensions required by Citus
CREATE EXTENSION IF NOT EXISTS citus;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Account table (distributed by account_id)
CREATE TABLE ACCOUNT (
  account_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product table (distributed by creator_id)
CREATE TABLE PRODUCT (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  on_sale BOOLEAN NOT NULL DEFAULT true,
  creator_id INTEGER NOT NULL REFERENCES ACCOUNT(account_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product transfer table (distributed by buyer_id)
CREATE TABLE PRODUCT_TRANSFER (
  buyer_id INTEGER NOT NULL REFERENCES ACCOUNT(account_id),
  product_id INTEGER NOT NULL REFERENCES PRODUCT(product_id),
  date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (buyer_id, product_id)
);

-- Money transaction table (distributed by account_id)
CREATE TABLE MONEY_TRANSACTION (
  account_id INTEGER NOT NULL REFERENCES ACCOUNT(account_id),
  amount INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (timestamp, account_id)
);

-- Distribute tables
SELECT create_distributed_table('ACCOUNT', 'account_id');
SELECT create_distributed_table('PRODUCT', 'creator_id');
SELECT create_distributed_table('PRODUCT_TRANSFER', 'buyer_id');
SELECT create_distributed_table('MONEY_TRANSACTION', 'account_id');

-- Create indexes for better query performance
CREATE INDEX idx_product_creator ON PRODUCT(creator_id);
CREATE INDEX idx_transfer_product ON PRODUCT_TRANSFER(product_id);
CREATE INDEX idx_transaction_timestamp ON MONEY_TRANSACTION(timestamp);
