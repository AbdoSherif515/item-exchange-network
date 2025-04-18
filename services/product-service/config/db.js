const { Pool } = require('pg');

// Create a connection pool with proper settings for distributed workload
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'citus-master',
  database: process.env.DB_NAME || 'itemexchange',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  // Connection pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
  maxUses: 7500, // Close and replace a connection after it has been used 7500 times
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds, after which we release the client
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for too long!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
      client.release();
    }, 5000);
    
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    client.release = () => {
      // Clear our timeout
      clearTimeout(timeout);
      // Set the methods back to their old implementation
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};
