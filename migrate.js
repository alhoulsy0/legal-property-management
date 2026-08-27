const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:[Jadsalah88@]@db.aujswjusokqfnhcqwrmi.supabase.co:5432/postgres',
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clients (
    client_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    property_id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
    property_name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(property_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('active', 'expired', 'closed', 'delayed', 'litigation')) NOT NULL,
    payment_amount NUMERIC(10, 2) NOT NULL,
    frequency VARCHAR(50) CHECK (frequency IN ('monthly', 'annual')) NOT NULL,
    next_due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(property_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_properties_client_id ON properties(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON expenses(property_id);
`;

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
